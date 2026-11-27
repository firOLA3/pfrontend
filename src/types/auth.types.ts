export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  authProviders: string[];
  timezone: string;
  onboarding: {
    completed: boolean;
    step: number;
    goals: string[];
    level?: 'beginner' | 'intermediate' | 'advanced';
    weeklyDays: string[];
    preferredTime?: string;
    remindersEnabled: boolean;
    gender?: string;
    age?: number;
    heightCm?: number;
    weightKg?: number;
    targetWeightKg?: number;
    units?: 'metric' | 'imperial';
    healthKitConnected?: boolean;
    notificationsAllowed?: boolean;
  };
  stats: {
    totalWorkouts: number;
    totalCalories: number;
    totalMinutes: number;
    streakDays?: number;
    lastWorkoutDate?: string;
  };
  points?: number;
  level?: number;
  unlockedBadges?: Array<{ badgeId: string; unlockedAt: string }>;
  devices?: {
    appleHealth: boolean;
    googleFit: boolean;
    readSteps: boolean;
    readCalories: boolean;
    readWeight: boolean;
    readHeartRate: boolean;
    writeWorkouts: boolean;
    lastSyncDate?: string;
  };
  pushToken?: string;
  notificationSettings?: {
    workoutReminders: boolean;
    streakAlerts: boolean;
    communityUpdates: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  tokens?: AuthTokens;
  cooldownSeconds?: number;
  retryAfterSeconds?: number;
  requiresVerification?: boolean;
  email?: string;
}

