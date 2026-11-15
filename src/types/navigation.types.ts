export type AuthStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  CheckEmail: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { email: string; code?: string };
};

export type OnboardingStackParamList = {
  Goals: undefined;
  FitnessLevel: undefined;
  Schedule: undefined;
  AboutYou: undefined;
  Permissions: undefined;
  BuildingPlan: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  WorkoutPlayer: { workoutSlug: string; workoutTitle: string; durationMinutes?: number };
  Notifications: undefined;
  Menu: undefined;
};

