import { apiRequest } from './api';

export interface IBadge {
  id: string;
  title: string;
  description: string;
  category: string;
  unlocked: boolean;
  unlockedAt: string | null;
  targetValue: number;
}

export interface IMilestone {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit?: string;
  progressRatio: number;
  completed: boolean;
}

export interface IAchievementsData {
  points: number;
  level: number;
  nextLevelPoints: number;
  completedMilestones: number;
  inProgressMilestones: number;
  badges: IBadge[];
  milestones: IMilestone[];
}

export const achievementService = {
  async getAchievements(): Promise<{ success: boolean; data: IAchievementsData }> {
    return apiRequest<{ success: boolean; data: IAchievementsData }>('/achievements', {
      method: 'GET',
      requiresAuth: true,
    });
  },
};
