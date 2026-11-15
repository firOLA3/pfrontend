import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { workoutService } from '../../services/workout.service';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BuildingPlan'>;

export const BuildingPlanScreen: React.FC<Props> = () => {
  const { updateUser, user } = useAuth();
  const [percent, setPercent] = useState(15);

  useEffect(() => {
    const timer1 = setTimeout(() => setPercent(45), 600);
    const timer2 = setTimeout(() => setPercent(72), 1400); // Figma exact 72% milestone
    const timer3 = setTimeout(() => setPercent(100), 2200);

    const timerComplete = setTimeout(() => {
      // Mark onboarding completed on backend & generate user plan
      userService.updateOnboarding({ completed: true, step: 6 }).catch(() => {});
      workoutService.generatePlan().catch(() => {});
      updateUser({
        onboarding: {
          ...(user?.onboarding || {
            goals: ['build_muscle'],
            weeklyDays: ['Mon', 'Wed', 'Fri'],
            remindersEnabled: true,
          }),
          completed: true,
          step: 6,
        },
      });
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerComplete);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Progress Ring / Card */}
        <View style={styles.circleContainer}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.percentText}>{percent}%</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Building your plan…</Text>
        <Text style={styles.subtitle}>
          Tailoring workouts, active-time goals, and recovery days specifically for you.
        </Text>

        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.statusText}>
            {percent < 50
              ? 'Analyzing fitness profile...'
              : percent < 90
              ? 'Selecting starter exercises...'
              : 'Finalizing schedule...'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  circleContainer: {
    marginBottom: 36,
  },
  ringOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  percentText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: 40,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '500',
  },
});

