import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../types/navigation.types';
import { GoalsScreen } from '../screens/onboarding/GoalsScreen';
import { FitnessLevelScreen } from '../screens/onboarding/FitnessLevelScreen';
import { ScheduleScreen } from '../screens/onboarding/ScheduleScreen';
import { AboutYouScreen } from '../screens/onboarding/AboutYouScreen';
import { PermissionsScreen } from '../screens/onboarding/PermissionsScreen';
import { BuildingPlanScreen } from '../screens/onboarding/BuildingPlanScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const STEP_TO_ROUTE: Record<number, keyof OnboardingStackParamList> = {
  1: 'Goals',
  2: 'FitnessLevel',
  3: 'Schedule',
  4: 'AboutYou',
  5: 'Permissions',
  6: 'BuildingPlan',
};

export const OnboardingNavigator: React.FC = () => {
  const { user } = useAuth();
  const initialRoute = (user?.onboarding?.step && STEP_TO_ROUTE[user.onboarding.step]) || 'Goals';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="FitnessLevel" component={FitnessLevelScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="AboutYou" component={AboutYouScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="BuildingPlan" component={BuildingPlanScreen} />
    </Stack.Navigator>
  );
};
