export type NotificationType =
  | 'workout_reminder'
  | 'badge_unlocked'
  | 'challenge'
  | 'goal_progress'
  | 'social_like'
  | 'weekly_summary'
  | 'system';

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestampText: string;
  section: 'Today' | 'Earlier';
  data?: {
    workoutSlug?: string;
    badgeId?: string;
    challengeId?: string;
    url?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  success: boolean;
  unreadCount: number;
  data: INotification[];
}

