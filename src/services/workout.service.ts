import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';
import { IWorkout, IProgram, IPlan } from '../types/workout.types';

export interface ISessionPayload {
  clientSessionId: string;
  workoutSlug: string;
  workoutTitle: string;
  durationSeconds: number;
  caloriesBurned: number;
  exercisesCompleted?: number;
  totalExercises?: number;
  feedback?: 'too_easy' | 'just_right' | 'too_hard' | null;
  status?: 'completed' | 'abandoned';
  notes?: string;
  completedAt?: string;
}

export interface ISessionRecord extends ISessionPayload {
  _id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutQueryParams {
  category?: string;
  difficulty?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface ProgramQueryParams {
  level?: string;
  featured?: boolean;
  search?: string;
}

export interface WorkoutsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: IWorkout[];
}

export interface WorkoutDetailResponse {
  success: boolean;
  data: IWorkout;
}

export interface ProgramsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: IProgram[];
}

export interface ProgramDetailResponse {
  success: boolean;
  data: IProgram;
}

export const workoutService = {
  async getWorkouts(params?: WorkoutQueryParams): Promise<WorkoutsResponse> {
    const queryParts: string[] = [];
    if (params?.category && params.category.toLowerCase() !== 'all') {
      queryParts.push(`category=${encodeURIComponent(params.category.toLowerCase())}`);
    }
    if (params?.difficulty && params.difficulty.toLowerCase() !== 'all') {
      queryParts.push(`difficulty=${encodeURIComponent(params.difficulty.toLowerCase())}`);
    }
    if (params?.search && params.search.trim()) {
      queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
    }
    if (params?.featured !== undefined) {
      queryParts.push(`featured=${params.featured}`);
    }
    if (params?.page) {
      queryParts.push(`page=${params.page}`);
    }
    if (params?.limit) {
      queryParts.push(`limit=${params.limit}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return apiRequest<WorkoutsResponse>(`/workouts${queryString}`, {
      method: 'GET',
      requiresAuth: false,
    });
  },

  async getWorkoutBySlug(slug: string): Promise<WorkoutDetailResponse> {
    return apiRequest<WorkoutDetailResponse>(`/workouts/${encodeURIComponent(slug)}`, {
      method: 'GET',
      requiresAuth: false,
    });
  },

  async getPrograms(params?: ProgramQueryParams): Promise<ProgramsResponse> {
    const queryParts: string[] = [];
    if (params?.level && params.level.toLowerCase() !== 'all') {
      queryParts.push(`level=${encodeURIComponent(params.level.toLowerCase())}`);
    }
    if (params?.featured !== undefined) {
      queryParts.push(`featured=${params.featured}`);
    }
    if (params?.search && params.search.trim()) {
      queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return apiRequest<ProgramsResponse>(`/programs${queryString}`, {
      method: 'GET',
      requiresAuth: false,
    });
  },

  async getProgramBySlug(slug: string): Promise<ProgramDetailResponse> {
    return apiRequest<ProgramDetailResponse>(`/programs/${encodeURIComponent(slug)}`, {
      method: 'GET',
      requiresAuth: false,
    });
  },

  async getSavedWorkouts(): Promise<{ success: boolean; count: number; data: IWorkout[] }> {
    return apiRequest<{ success: boolean; count: number; data: IWorkout[] }>('/workouts/saved', {
      method: 'GET',
      requiresAuth: true,
    });
  },

  async saveWorkout(slug: string): Promise<{ success: boolean; message: string; savedWorkouts: string[] }> {
    return apiRequest<{ success: boolean; message: string; savedWorkouts: string[] }>(
      `/workouts/${encodeURIComponent(slug)}/save`,
      {
        method: 'POST',
        requiresAuth: true,
      }
    );
  },

  async unsaveWorkout(slug: string): Promise<{ success: boolean; message: string; savedWorkouts: string[] }> {
    return apiRequest<{ success: boolean; message: string; savedWorkouts: string[] }>(
      `/workouts/${encodeURIComponent(slug)}/save`,
      {
        method: 'DELETE',
        requiresAuth: true,
      }
    );
  },

  async getMyPlan(): Promise<{ success: boolean; data: IPlan }> {
    return apiRequest<{ success: boolean; data: IPlan }>('/plans/my-plan', {
      method: 'GET',
      requiresAuth: true,
    });
  },

  async generatePlan(): Promise<{ success: boolean; data: IPlan }> {
    return apiRequest<{ success: boolean; data: IPlan }>('/plans/generate', {
      method: 'POST',
      requiresAuth: true,
    });
  },

  async saveSession(payload: ISessionPayload): Promise<{
    success: boolean;
    data: ISessionRecord;
    stats?: any;
    points?: number;
    level?: number;
    newlyUnlockedBadges?: Array<{ id: string; title: string; description: string }>;
  }> {
    return apiRequest<{
      success: boolean;
      data: ISessionRecord;
      stats?: any;
      points?: number;
      level?: number;
      newlyUnlockedBadges?: Array<{ id: string; title: string; description: string }>;
    }>('/workouts/sessions', {
      method: 'POST',
      body: payload,
      requiresAuth: true,
    });
  },

  async getSessions(page = 1, limit = 20): Promise<{ success: boolean; count: number; total: number; data: ISessionRecord[] }> {
    return apiRequest<{ success: boolean; count: number; total: number; data: ISessionRecord[] }>(
      `/workouts/sessions?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        requiresAuth: true,
      }
    );
  },

  async syncOfflineSessions(): Promise<number> {
    try {
      const existing = await AsyncStorage.getItem('@pulsefit_offline_sessions');
      if (!existing) return 0;
      const list: ISessionPayload[] = JSON.parse(existing);
      if (!Array.isArray(list) || list.length === 0) return 0;

      const remaining: ISessionPayload[] = [];
      let syncedCount = 0;

      for (const sess of list) {
        try {
          await this.saveSession(sess);
          syncedCount++;
        } catch {
          remaining.push(sess);
        }
      }

      await AsyncStorage.setItem('@pulsefit_offline_sessions', JSON.stringify(remaining));
      return syncedCount;
    } catch {
      return 0;
    }
  },
};
