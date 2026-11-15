import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation.types';
import { colors, spacing } from '../../theme';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { BellIcon } from '../../components/icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Permissions'>;

export const PermissionsScreen: React.FC<Props> = ({ navigation }) => {
  const { updateUser } = useAuth();
  const [notificationsAllowed, setNotificationsAllowed] = useState(true);
  const [healthKitAllowed, setHealthKitAllowed] = useState(true);

  const handleAllowAndContinue = () => {
    userService
      .updateOnboarding({
        step: 6,
        notificationsAllowed,
        healthKitConnected: healthKitAllowed,
      })
      .then((res) => {
        if (res.data) updateUser(res.data);
      })
      .catch(() => {});
    navigation.navigate('BuildingPlan');
  };

  const handleMaybeLater = () => {
    userService
      .updateOnboarding({
        step: 6,
        notificationsAllowed: false,
        healthKitConnected: false,
      })
      .then((res) => {
        if (res.data) updateUser(res.data);
      })
      .catch(() => {});
    navigation.navigate('BuildingPlan');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        {/* Progress: Step 5 of 5 */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '100%' }]} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Stay on track</Text>
          <Text style={styles.subtitle}>
            Two quick permissions make PulseFit work better. You stay in control.
          </Text>
        </View>

        <View style={styles.cardList}>
          {/* Notification Permission Card */}
          <View style={styles.permissionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <BellIcon size={22} color={colors.primary} />
              </View>
              <Switch
                value={notificationsAllowed}
                onValueChange={setNotificationsAllowed}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
            <Text style={styles.cardTitle}>Notifications</Text>
            <Text style={styles.cardDescription}>
              Remind you when it’s time to workout and celebrate your consistency milestones.
            </Text>
          </View>

          {/* Apple Health Permission Card */}
          <View style={styles.permissionCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.iconEmoji}>❤️</Text>
              </View>
              <Switch
                value={healthKitAllowed}
                onValueChange={setHealthKitAllowed}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
            <Text style={styles.cardTitle}>Apple Health</Text>
            <Text style={styles.cardDescription}>
              Sync your active calories, steps, and heart rate so your daily rings fill automatically.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleAllowAndContinue}
        >
          <Text style={styles.continueButtonText}>Allow and continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleMaybeLater} style={styles.skipButton}>
          <Text style={styles.skipText}>Maybe later</Text>
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
    lineHeight: 22,
  },
  cardList: {
    gap: 16,
  },
  permissionCard: {
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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

