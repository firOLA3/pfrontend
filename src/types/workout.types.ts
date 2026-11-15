export interface IExerciseDetails {
  name: string;
  equipment?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  tips?: string[];
  met?: number;
  mediaUrl?: string;
  animationUrl?: string;
  videoUrl?: string;
  startImageUrl?: string;
  peakImageUrl?: string;
}

export interface IWorkoutStep {
  order: number;
  exerciseSlug: string;
  exerciseName: string;
  stepType: 'timed' | 'counted';
  durationSeconds?: number;
  sets?: number;
  reps?: number;
  restSeconds: number;
  notes?: string;
  exerciseDetails?: IExerciseDetails;
}

export interface IWorkout {
  _id?: string;
  slug: string;
  title: string;
  description: string;
  category: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'core' | string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  estimatedCalories: number;
  badge: string;
  bannerImage: string;
  primaryMuscles: string[];
  equipment: string[];
  steps: IWorkoutStep[];
  isFeatured: boolean;
  tags: string[];
}

export interface IProgramDaySchedule {
  day: number;
  isRestDay: boolean;
  workoutSlug?: string;
  workoutTitle?: string;
  workout?: {
    title: string;
    durationMinutes: number;
    estimatedCalories: number;
    difficulty: string;
    category: string;
    bannerImage: string;
  } | null;
}

export interface IProgramWeek {
  weekNumber: number;
  title: string;
  schedule: IProgramDaySchedule[];
}

export interface IProgram {
  _id?: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationWeeks: number;
  sessionsPerWeek: number;
  badge: string;
  bannerImage: string;
  isFeatured: boolean;
  tags: string[];
  weeks: IProgramWeek[];
}

export interface IScheduledDay {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  dayName: string;
  isRestDay: boolean;
  workoutSlug?: string;
  workoutTitle?: string;
  workoutCategory?: string;
  durationMinutes?: number;
  estimatedCalories?: number;
  badge?: string;
}

export interface IPlan {
  _id?: string;
  userId: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  sessionsPerWeek: number;
  preferredDays: string[];
  preferredTime: string;
  schedule: IScheduledDay[];
  generatedAt: string;
}
