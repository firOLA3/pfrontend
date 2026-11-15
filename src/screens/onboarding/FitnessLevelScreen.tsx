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

type Props = NativeStackScreenProps<OnboardingStackParamList, 'FitnessLevel'>;

type Level = 'beginner' | 'intermediate' | 'advanced';

interface LevelOption {
  id: Level;
  title: string;
  subtitle: string;
  frequency: string;
  badge: string;
}

const LEVELS: LevelOption[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    subtitle: 'New to workout or getting back after a break',
    frequency: '1 - 2 sessions / week',
    badge: '🟢',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    subtitle: 'Workout regularly and familiar with standard exercises',
    frequency: '3 - 4 sessions / week',
    badge: '🟡',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    subtitle: 'Experienced and ready for high-intensity training',
    frequency: '5+ sessions / week',
    badge: '🔴',
  },
];

export const FitnessLevelScreen: React.FC<Props> = ({ navigation }) => {
  const { updateUser } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<Level>('intermediate');

  const handleContinue = () => {
    userService
      .updateOnboarding({ step: 3, level: selectedLevel })
      .then((res) => {
        if (res.data) updateUser(res.data);
      })
      .catch(() => {});
    navigation.navigate('Schedule');
  };

  const handleSkip = () => {
    userService
      .updateOnboarding({ step: 3 })
      .then((res) => {
        if (res.data) updateUser(res.data);
      })
      .catch(() => {});
    navigation.navigate('Schedule');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        {/* Progress indicator: Step 2 of 5 */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '40%' }]} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Choose your workout level</Text>
          <Text style={styles.subtitle}>We’ll adjust the workouts to match your level</Text>
        </View>

        <View style={styles.list}>
          {LEVELS.map((level) => {
            const isSelected = selectedLevel === level.id;
            return (
              <TouchableOpacity
                key={level.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelectedLevel(level.id)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badgeIcon}>{level.badge}</Text>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {level.title}
                    </Text>
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </View>

                <Text style={styles.cardSubtitle}>{level.subtitle}</Text>
                <View style={styles.frequencyTag}>
                  <Text style={styles.frequencyText}>{level.frequency}</Text>
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

        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
        >
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
    gap: 14,
  },
  card: {
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeIcon: {
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardTitleSelected: {
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  frequencyTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
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

