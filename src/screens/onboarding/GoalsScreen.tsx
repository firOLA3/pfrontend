import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation.types';
import { colors, spacing } from '../../theme';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { CheckIcon } from '../../components/icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Goals'>;

interface GoalItem {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
}

const GOALS_LIST: GoalItem[] = [
  { id: 'lose_weight', title: 'Lose Weight', subtitle: 'Burn fat and get leaner', emoji: '🔥' },
  { id: 'build_muscle', title: 'Build Muscle', subtitle: 'Gain strength and lean mass', emoji: '💪' },
  { id: 'improve_endurance', title: 'Improve Endurance', subtitle: 'Boost stamina & cardio health', emoji: '⚡' },
  { id: 'stay_fit', title: 'Stay Fit & Healthy', subtitle: 'Feel active, energized and strong', emoji: '🌱' },
  { id: 'flexibility', title: 'Improve Flexibility', subtitle: 'Enhance mobility and recovery', emoji: '🧘' },
];

export const GoalsScreen: React.FC<Props> = ({ navigation }) => {
  const { updateUser } = useAuth();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['build_muscle']);

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    userService
      .updateOnboarding({ step: 2, goals: selectedGoals })
      .then((res) => {
        if (res.data) updateUser(res.data);
      })
      .catch(() => {});
    navigation.navigate('FitnessLevel');
  };

  const handleSkip = () => {
    userService
      .updateOnboarding({ step: 2 })
      .then((res) => {
        if (res.data) updateUser(res.data);
      })
      .catch(() => {});
    navigation.navigate('FitnessLevel');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        {/* Progress indicator: Step 1 of 5 */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '20%' }]} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>What are your fitness goals?</Text>
          <Text style={styles.subtitle}>Choose one or more</Text>
        </View>

        <View style={styles.list}>
          {GOALS_LIST.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.85}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.emoji}>{goal.emoji}</Text>
                  <View>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {goal.title}
                    </Text>
                    <Text style={styles.cardSubtitle}>{goal.subtitle}</Text>
                  </View>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <CheckIcon size={12} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 3,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 20,
    paddingBottom: 24,
  },
  titleBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 18,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  emoji: {
    fontSize: 26,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardTitleSelected: {
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  bottomBar: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 20,
    gap: 12,
  },
  continueButton: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
});

