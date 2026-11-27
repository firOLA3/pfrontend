import { apiRequest } from './api';
import { User } from '../types/auth.types';

export interface OnboardingUpdatePayload {
  step?: number;
  completed?: boolean;
  goals?: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  weeklyDays?: string[];
  preferredTime?: string;
  remindersEnabled?: boolean;
  gender?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  units?: 'metric' | 'imperial';
  healthKitConnected?: boolean;
  notificationsAllowed?: boolean;
  timezone?: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  timezone?: string;
  units?: 'metric' | 'imperial';
}

export const userService = {
  async getMe(): Promise<{ success: boolean; data: User }> {
    return apiRequest<{ success: boolean; data: User }>('/users/me', {
      method: 'GET',
      requiresAuth: true,
    });
  },

  async updateOnboarding(data: OnboardingUpdatePayload): Promise<{ success: boolean; data: User }> {
    return apiRequest<{ success: boolean; data: User }>('/users/onboarding', {
      method: 'PUT',
      body: data,
      requiresAuth: true,
    });
  },

  async updateProfile(data: ProfileUpdatePayload): Promise<{ success: boolean; data: User }> {
    return apiRequest<{ success: boolean; data: User }>('/users/profile', {
      method: 'PUT',
      body: data,
      requiresAuth: true,
    });
  },

  async uploadAvatar(
    image: string,
    mimeType?: 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/webp'
  ): Promise<{ success: boolean; data: User }> {
    return apiRequest<{ success: boolean; data: User }>('/users/avatar', {
      method: 'POST',
      body: { image, mimeType },
      requiresAuth: true,
    });
  },

  async checkUsername(username: string): Promise<{ success: boolean; available: boolean }> {
    return apiRequest<{ success: boolean; available: boolean }>(
      `/users/check-username?username=${encodeURIComponent(username)}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    );
  },

  async updateDevices(data: Partial<NonNullable<User['devices']>>): Promise<{ success: boolean; data: NonNullable<User['devices']> }> {
    return apiRequest<{ success: boolean; data: NonNullable<User['devices']> }>('/users/devices', {
      method: 'PUT',
      body: data,
      requiresAuth: true,
    });
  },

  async updateNotificationSettings(data: Partial<NonNullable<User['notificationSettings']>>): Promise<{ success: boolean; data: NonNullable<User['notificationSettings']> }> {
    return apiRequest<{ success: boolean; data: NonNullable<User['notificationSettings']> }>('/users/notification-settings', {
      method: 'PUT',
      body: data,
      requiresAuth: true,
    });
  },

  async savePushToken(pushToken: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>('/users/push-token', {
      method: 'POST',
      body: { pushToken },
      requiresAuth: true,
    });
  },
};

