import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthTokens } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { signOutFromGoogle } from '../services/googleAuth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (data: { email: string; password: string; name?: string }) => Promise<any>;
  signin: (data: { email: string; password: string }) => Promise<void>;
  verifyEmail: (data: { email: string; code: string }) => Promise<void>;
  resendCode: (email: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (data: { email: string; code: string; newPassword: string }) => Promise<any>;
  oauthLogin: (data: { provider: 'google' | 'apple'; idToken: string; name?: string; avatarUrl?: string }) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (confirmText: string) => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('@pulsefit_access_token');
      if (accessToken) {
        const res = await authService.getMe();
        if (res.success && res.data) {
          setUser(res.data);
        }
      }
    } catch {
      // Token invalid or network offline
      await AsyncStorage.multiRemove(['@pulsefit_access_token', '@pulsefit_refresh_token']);
    } finally {
      setIsLoading(false);
    }
  };

  const storeTokens = async (tokens?: AuthTokens) => {
    if (tokens?.accessToken) {
      await AsyncStorage.setItem('@pulsefit_access_token', tokens.accessToken);
    }
    if (tokens?.refreshToken) {
      await AsyncStorage.setItem('@pulsefit_refresh_token', tokens.refreshToken);
    }
  };

  const signup = async (data: { email: string; password: string; name?: string }) => {
    return authService.signup(data);
  };

  const signin = async (data: { email: string; password: string }) => {
    const res = await authService.signin(data);
    if (res.tokens) {
      await storeTokens(res.tokens);
    }
    if (res.user) {
      setUser(res.user);
    }
  };

  const verifyEmail = async (data: { email: string; code: string }) => {
    const res = await authService.verifyEmail(data);
    if (res.tokens) {
      await storeTokens(res.tokens);
    }
    if (res.user) {
      setUser(res.user);
    }
  };

  const resendCode = async (email: string) => {
    return authService.resendCode({ email });
  };

  const forgotPassword = async (email: string) => {
    return authService.forgotPassword({ email });
  };

  const resetPassword = async (data: { email: string; code: string; newPassword: string }) => {
    return authService.resetPassword(data);
  };

  const oauthLogin = async (data: { provider: 'google' | 'apple'; idToken: string; name?: string; avatarUrl?: string }) => {
    const res = await authService.oauthLogin(data);
    if (res.tokens) {
      await storeTokens(res.tokens);
    }
    if (res.user) {
      setUser(res.user);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {}
    await signOutFromGoogle();
    await AsyncStorage.multiRemove(['@pulsefit_access_token', '@pulsefit_refresh_token']);
    setUser(null);
  };

  const deleteAccount = async (confirmText: string) => {
    await authService.deleteAccount(confirmText);
    await signOutFromGoogle();
    await AsyncStorage.multiRemove(['@pulsefit_access_token', '@pulsefit_refresh_token']);
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedFields });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user && user.isEmailVerified),
        signup,
        signin,
        verifyEmail,
        resendCode,
        forgotPassword,
        resetPassword,
        oauthLogin,
        logout,
        deleteAccount,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

