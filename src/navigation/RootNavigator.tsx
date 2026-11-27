import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation.types';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { WorkoutPlayerScreen } from '../screens/workout/WorkoutPlayerScreen';
import { WorkoutPreviewScreen } from '../screens/workout/WorkoutPreviewScreen';
import { ProgramPreviewScreen } from '../screens/program/ProgramPreviewScreen';
import { SavedWorkoutsScreen } from '../screens/workout/SavedWorkoutsScreen';
import { WorkoutHistoryScreen } from '../screens/workout/WorkoutHistoryScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { MenuScreen } from '../screens/menu/MenuScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { MyPlanScreen } from '../screens/plan/MyPlanScreen';
import { AchievementsScreen } from '../screens/achievements/AchievementsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ConnectedDevicesScreen } from '../screens/devices/ConnectedDevicesScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <SplashScreen isInitialLoading />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !user?.onboarding?.completed ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}

      {/* Full-Screen Workout Player Modal */}
      <Stack.Screen
        name="WorkoutPlayer"
        component={WorkoutPlayerScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
      {/* Workout Preview Screen (Figma #2341:722) */}
      <Stack.Screen
        name="WorkoutPreview"
        component={WorkoutPreviewScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Program Preview Screen (Figma #2341:580) */}
      <Stack.Screen
        name="ProgramPreview"
        component={ProgramPreviewScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Saved Workouts Screen (Figma #2342:1253) */}
      <Stack.Screen
        name="SavedWorkouts"
        component={SavedWorkoutsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Workout History Screen (Figma #2353:1810) */}
      <Stack.Screen
        name="WorkoutHistory"
        component={WorkoutHistoryScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Notifications Screen (Figma #2425:867) */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Menu Screen (Figma #2425:1219) */}
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          animation: 'slide_from_left',
        }}
      />
      {/* Edit Profile Screen (Figma #2426:1469) */}
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* My Plan Screen */}
      <Stack.Screen
        name="MyPlan"
        component={MyPlanScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Achievements Screen (Figma #2353:1601) */}
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Settings Screen (Figma #2420:935 & #2420:1296) */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      {/* Connected Devices Screen (Figma #2420:343) */}
      <Stack.Screen
        name="ConnectedDevices"
        component={ConnectedDevicesScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

