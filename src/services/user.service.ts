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

  async checkUsername(username: string): Promise<{ success: boolean; available: boolean }> {
    return apiRequest<{ success: boolean; available: boolean }>(
      `/users/check-username?username=${encodeURIComponent(username)}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    );
  },
};

