import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../theme';
import { FlameIcon, ProgressTabIcon } from '../../components/icons';

type Props = BottomTabScreenProps<MainTabParamList, 'Progress'>;

type TimeTab = 'Week' | 'Month' | 'Year';

export const ProgressScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TimeTab>('Week');

  const hasWorkouts = (user?.stats?.totalWorkouts || 0) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>

        {/* Time Tabs (Week, Month, Year) */}
        <View style={styles.tabContainer}>
          {(['Week', 'Month', 'Year'] as TimeTab[]).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!hasWorkouts ? (
          // Figma Empty State (#2353:2301)
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <ProgressTabIcon size={32} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Your progress starts here</Text>
            <Text style={styles.emptySubtitle}>
              Finish your first workout and your stats, streaks and badges will show up here.
            </Text>
            <TouchableOpacity
              style={styles.emptyCtaButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Explore')}
            >
              <Text style={styles.emptyCtaText}>Start a Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Active Stats State
          <View style={styles.statsContainer}>
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Workouts</Text>
                <Text style={styles.metricValue}>{user?.stats?.totalWorkouts || 0}</Text>
                <Text style={styles.metricChange}>+2 vs last {activeTab.toLowerCase()}</Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Calories</Text>
                <Text style={styles.metricValue}>{user?.stats?.totalCalories || 0}</Text>
                <Text style={styles.metricUnit}>kcal burned</Text>
              </View>
            </View>

            <View style={styles.streakBanner}>
              <View style={{ marginRight: 12 }}>
                <FlameIcon size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.streakBannerTitle}>Consistency Streak</Text>
                <Text style={styles.streakBannerSubtitle}>You’re on a 3-day active streak</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 28,
  },
  emptyCtaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyCtaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    gap: 16,
    paddingTop: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  metricUnit: {
    fontSize: 12,
    color: colors.textMuted,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    gap: 14,
  },
  streakIcon: {
    fontSize: 28,
  },
  streakBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  streakBannerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

