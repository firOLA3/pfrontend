import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';
import { userService } from './user.service';
import { INotification, NotificationsResponse } from '../types/notification.types';

const REMINDERS_KEY = '@pulsefit_scheduled_reminders';
const PUSH_TOKEN_KEY = '@pulsefit_push_token';

export interface ScheduledReminder {
  day: string;
  time: string;
  enabled: boolean;
  nextTriggerDate?: string;
}

export const notificationService = {
  async getNotifications(): Promise<NotificationsResponse> {
    return apiRequest<NotificationsResponse>('/notifications', {
      method: 'GET',
    });
  },

  async triggerWeeklySummary(): Promise<{ success: boolean; data: INotification }> {
    return apiRequest<{ success: boolean; data: INotification }>('/notifications/weekly-summary', {
      method: 'POST',
      requiresAuth: true,
    });
  },

  async markAllRead(): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },

  async markAsRead(id: string): Promise<{ success: boolean; data: INotification }> {
    return apiRequest<{ success: boolean; data: INotification }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Registers or syncs device push token with the backend (Phase 2.4)
   */
  async registerPushToken(token?: string): Promise<string | null> {
    try {
      let finalToken = token;
      if (!finalToken) {
        const stored = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
        if (stored) {
          finalToken = stored;
        } else {
          finalToken = `device_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await AsyncStorage.setItem(PUSH_TOKEN_KEY, finalToken);
        }
      }

      if (finalToken) {
        await userService.savePushToken(finalToken);
      }
      return finalToken || null;
    } catch {
      return null;
    }
  },

  /**
   * Schedules or updates local workout reminders based on user weekly schedule and preferred time (Phase 2.4)
   */
  async scheduleWorkoutReminders(
    days: string[],
    preferredTime: string = '08:00',
    enabled: boolean = true
  ): Promise<ScheduledReminder[]> {
    try {
      const schedule: ScheduledReminder[] = days.map((day) => ({
        day,
        time: preferredTime,
        enabled,
      }));

      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(schedule));
      return schedule;
    } catch {
      return [];
    }
  },

  /**
   * Retrieves currently scheduled workout reminders
   */
  async getScheduledReminders(): Promise<ScheduledReminder[]> {
    try {
      const raw = await AsyncStorage.getItem(REMINDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Cancels and clears all scheduled workout reminders
   */
  async cancelAllReminders(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REMINDERS_KEY);
    } catch {}
  },
};


