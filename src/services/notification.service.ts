import { apiRequest } from './api';
import { INotification, NotificationsResponse } from '../types/notification.types';

export const notificationService = {
  async getNotifications(): Promise<NotificationsResponse> {
    return apiRequest<NotificationsResponse>('/notifications', {
      method: 'GET',
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
};

