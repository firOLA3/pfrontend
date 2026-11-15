import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In development, automatically detect host IP from Expo Metro bundler
const getBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // Detect host IP from Expo's Metro connection (e.g. "10.100.134.211:8081" -> "10.100.134.211")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:5000/api`;
  }

  // Fallback to LAN Wi-Fi IP
  return 'http://10.100.134.211:5000/api';
};

export const API_BASE_URL = getBaseUrl();

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, requiresAuth = true } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requiresAuth) {
    const token = await AsyncStorage.getItem('@pulsefit_access_token');
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    // If access token expired, attempt refresh
    if (response.status === 401 && requiresAuth && !endpoint.includes('/auth/refresh')) {
      const refreshToken = await AsyncStorage.getItem('@pulsefit_refresh_token');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.tokens?.accessToken) {
              await AsyncStorage.setItem('@pulsefit_access_token', refreshData.tokens.accessToken);
              if (refreshData.tokens?.refreshToken) {
                await AsyncStorage.setItem('@pulsefit_refresh_token', refreshData.tokens.refreshToken);
              }
              // Retry original request with new token
              requestHeaders.Authorization = `Bearer ${refreshData.tokens.accessToken}`;
              const retryRes = await fetch(url, {
                method,
                headers: requestHeaders,
                body: body ? JSON.stringify(body) : undefined,
              });
              return (await retryRes.json()) as T;
            }
          }
        } catch {
          // Token refresh failed
        }
      }
    }

    const error = new Error(data.message || `Request failed with status ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data as T;
}

