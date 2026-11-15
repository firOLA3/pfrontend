import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation.types';
import { colors, spacing } from '../../theme';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AboutYou'>;

type Gender = 'male' | 'female' | 'other';

export const AboutYouScreen: React.FC<Props> = ({ navigation }) => {
  const { updateUser } = useAuth();
  const [gender, setGender] = useState<Gender>('female');
  const [age, setAge] = useState('26');
  const [heightCm, setHeightCm] = useState('168');
  const [weightKg, setWeightKg] = useState('65');
  const [targetWeightKg, setTargetWeightKg] = useState('60');

  const handleContinue = () => {
    userService
      .updateOnboarding({
        step: 5,
        gender,
        age: age ? parseInt(age, 10) : undefined,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        targetWeightKg: targetWeightKg ? parseFloat(targetWeightKg) : undefined,
        units: 'metric',
      })
      .then((res) => {
        if (res.data) updateUser(res.data);
      })
      .catch(() => {});
    navigation.navigate('Permissions');
  };

  const handleSkip = () => {
    userService
      .updateOnboarding({ step: 5 })
      .then((res) => {
        if (res.data) updateUser(res.data);
      })
      .catch(() => {});
    navigation.navigate('Permissions');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          {/* Progress: Step 4 of 5 */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '80%' }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>About you</Text>
            <Text style={styles.subtitle}>
              We use this to estimate calories and set realistic targets. You can change it any time.
            </Text>
          </View>

          {/* Gender Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {(['female', 'male', 'other'] as Gender[]).map((g) => {
                const isSelected = gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, isSelected && styles.genderBtnSelected]}
                    onPress={() => setGender(g)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.genderText, isSelected && styles.genderTextSelected]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Age & Height */}
          <View style={styles.twoColumnRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                placeholderTextColor={colors.textMuted}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="170"
                placeholderTextColor={colors.textMuted}
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Current & Target Weight */}
          <View style={styles.twoColumnRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Current (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="70"
                placeholderTextColor={colors.textMuted}
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Target (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="65"
                placeholderTextColor={colors.textMuted}
                value={targetWeightKg}
                onChangeText={setTargetWeightKg}
                keyboardType="decimal-pad"
              />
            </View>
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
      </KeyboardAvoidingView>
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
    gap: 18,
  },
  titleBlock: {
    marginBottom: 8,
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
    lineHeight: 22,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  genderTextSelected: {
    color: colors.primary,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 14,
  },
  input: {
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
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

