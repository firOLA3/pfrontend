import { apiRequest } from './api';
import { AuthResponse, User } from '../types/auth.types';

export const authService = {
  async signup(data: { email: string; password: string; name?: string }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });
  },

  async signin(data: { email: string; password: string }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });
  },

  async verifyEmail(data: { email: string; code: string }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/verify-email', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });
  },

  async resendCode(data: { email: string }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/resend-code', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });
  },

  async forgotPassword(data: { email: string }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/forgot-password', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });
  },

  async resetPassword(data: { email: string; code: string; newPassword: string }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/reset-password', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });
  },

  async oauthLogin(data: {
    provider: 'google' | 'apple';
    providerId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/oauth', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });
  },

  async getMe(): Promise<{ success: boolean; data: User }> {
    return apiRequest<{ success: boolean; data: User }>('/auth/me', {
      method: 'GET',
      requiresAuth: true,
    });
  },

  async logout(): Promise<void> {
    return apiRequest<void>('/auth/logout', {
      method: 'POST',
      requiresAuth: true,
    });
  },

  async deleteAccount(confirmText: string = 'DELETE'): Promise<void> {
    return apiRequest<void>('/auth/account', {
      method: 'DELETE',
      body: { confirmText },
      requiresAuth: true,
    });
  },
};

