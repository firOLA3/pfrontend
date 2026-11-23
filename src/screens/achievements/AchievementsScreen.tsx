import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRightIcon,
  TrophyMenuIcon,
  FlameIcon,
  ProgressTabIcon,
} from '../../components/icons';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Achievements'>;

type TabType = 'Badges' | 'Milestones';

interface MilestoneItem {
  id: string;
  title: string;
  current: number;
  target: number;
  unit?: string;
  badgeType: 'workout' | 'streak' | 'calories';
}

export const AchievementsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('Milestones');

  const totalWorkouts = user?.stats?.totalWorkouts || 0;
  const totalCalories = user?.stats?.totalCalories || 0;
  const streakDays = (user?.stats as any)?.streakDays || (totalWorkouts > 0 ? 1 : 0);

  const milestones: MilestoneItem[] = [
    {
      id: 'first_workout',
      title: 'First workout',
      current: Math.min(totalWorkouts, 1),
      target: 1,
      badgeType: 'workout',
    },
    {
      id: 'streak_3',
      title: '3-day streak',
      current: Math.min(streakDays, 3),
      target: 3,
      unit: 'days',
      badgeType: 'streak',
    },
    {
      id: 'workouts_50',
      title: '50 workouts',
      current: Math.min(totalWorkouts, 50),
      target: 50,
      unit: 'workouts',
      badgeType: 'workout',
    },
    {
      id: 'cal_10k',
      title: '10K calories burned',
      current: Math.min(totalCalories, 10000),
      target: 10000,
      unit: 'kcal',
      badgeType: 'calories',
    },
    {
      id: 'streak_14',
      title: '14-day consistency',
      current: Math.min(streakDays, 14),
      target: 14,
      unit: 'days',
      badgeType: 'streak',
    },
    {
      id: 'workouts_100',
      title: '100 workouts',
      current: Math.min(totalWorkouts, 100),
      target: 100,
      unit: 'workouts',
      badgeType: 'workout',
    },
  ];

  const badges = [
    { id: 'b1', name: 'Starter', desc: 'Completed 1st workout', unlocked: totalWorkouts >= 1 },
    { id: 'b2', name: 'On Fire', desc: '3-day streak', unlocked: streakDays >= 3 },
    { id: 'b3', name: 'High Burn', desc: 'Burned 1,000+ kcal', unlocked: totalCalories >= 1000 },
    { id: 'b4', name: 'Habit Hero', desc: '7-day streak', unlocked: streakDays >= 7 },
    { id: 'b5', name: 'Century Club', desc: 'Completed 10 workouts', unlocked: totalWorkouts >= 10 },
    { id: 'b6', name: 'Unstoppable', desc: '14-day streak', unlocked: streakDays >= 14 },
    { id: 'b7', name: 'Titan', desc: 'Burned 10,000+ kcal', unlocked: totalCalories >= 10000 },
    { id: 'b8', name: 'Veteran', desc: 'Completed 50 workouts', unlocked: totalWorkouts >= 50 },
    { id: 'b9', name: 'Legend', desc: 'Completed 100 workouts', unlocked: totalWorkouts >= 100 },
  ];

  const completedCount = milestones.filter((m) => m.current >= m.target).length;
  const inProgressCount = milestones.length - completedCount;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ArrowRightIcon size={20} color="#111111" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Toggle Row (Figma #2353:1624) */}
        <View style={styles.tabContainer}>
          {(['Badges', 'Milestones'] as TabType[]).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    isSelected && styles.tabButtonTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Status Subtitle (Figma #2353:1635) */}
        <Text style={styles.subtitle}>
          {completedCount} completed · {inProgressCount} in progress
        </Text>

        {activeTab === 'Milestones' ? (
          /* Milestones List (Figma #2353:1637) */
          <View style={styles.milestonesList}>
            {milestones.map((item) => {
              const progressRatio = Math.min(1, item.current / item.target);
              const isCompleted = item.current >= item.target;

              return (
                <View key={item.id} style={styles.milestoneCard}>
                  <View style={styles.milestoneTopRow}>
                    <View
                      style={[
                        styles.milestoneIconCircle,
                        isCompleted && styles.milestoneIconCompleted,
                      ]}
                    >
                      {item.badgeType === 'streak' ? (
                        <FlameIcon size={18} />
                      ) : (
                        <TrophyMenuIcon
                          size={18}
                          color={isCompleted ? '#FE2E31' : '#888888'}
                        />
                      )}
                    </View>

                    <View style={styles.milestoneTextCol}>
                      <View style={styles.milestoneTitleRow}>
                        <Text style={styles.milestoneTitle}>{item.title}</Text>
                        <Text style={styles.progressFraction}>
                          {item.current.toLocaleString()} / {item.target.toLocaleString()}{' '}
                          {item.unit || ''}
                        </Text>
                      </View>

                      {/* Progress Track */}
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.round(progressRatio * 100)}%` },
                            isCompleted && styles.progressFillDone,
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* Badges 3x3 Grid */
          <View style={styles.badgeGrid}>
            {badges.map((b) => (
              <View
                key={b.id}
                style={[
                  styles.badgeCard,
                  b.unlocked ? styles.badgeUnlocked : styles.badgeLocked,
                ]}
              >
                <View
                  style={[
                    styles.badgeCircle,
                    b.unlocked ? styles.badgeCircleUnlocked : styles.badgeCircleLocked,
                  ]}
                >
                  <TrophyMenuIcon
                    size={24}
                    color={b.unlocked ? '#FE2E31' : '#AAAAAA'}
                  />
                </View>
                <Text style={styles.badgeName}>{b.name}</Text>
                <Text style={styles.badgeDesc} numberOfLines={2}>
                  {b.desc}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 0.8,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  tabButtonTextActive: {
    color: '#111111',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 16,
  },
  milestonesList: {
    gap: 14,
  },
  milestoneCard: {
    backgroundColor: '#FFFBFB',
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.16)',
    padding: 14,
  },
  milestoneTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneIconCompleted: {
    backgroundColor: '#FFF0F0',
  },
  milestoneTextCol: {
    flex: 1,
  },
  milestoneTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  progressFraction: {
    fontSize: 11,
    fontWeight: '500',
    color: '#777777',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FE2E31',
    borderRadius: 3,
  },
  progressFillDone: {
    backgroundColor: '#36C25F',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '30.5%',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 0.8,
  },
  badgeUnlocked: {
    backgroundColor: '#FFF5F5',
    borderColor: 'rgba(254, 46, 49, 0.22)',
  },
  badgeLocked: {
    backgroundColor: '#F9F9F9',
    borderColor: '#EEEEEE',
    opacity: 0.7,
  },
  badgeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeCircleUnlocked: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#FE2E31',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeCircleLocked: {
    backgroundColor: '#EAEAEA',
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 3,
  },
  badgeDesc: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 12,
  },
});
