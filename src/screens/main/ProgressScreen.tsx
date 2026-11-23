import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { workoutService, ISessionRecord } from '../../services/workout.service';
import { colors, spacing } from '../../theme';
import {
  FlameIcon,
  ProgressTabIcon,
  TimeIcon,
  ArrowRightIcon,
} from '../../components/icons';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Progress'>,
  NativeStackScreenProps<RootStackParamList>
>;

type TimeTab = 'Week' | 'Month' | 'Year';

export const ProgressScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TimeTab>('Week');
  const [recentSessions, setRecentSessions] = useState<ISessionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchRecentSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await workoutService.getSessions(1, 4);
      if (res.success && Array.isArray(res.data)) {
        setRecentSessions(res.data);
      }
    } catch {
      // Quiet fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentSessions();
  }, [fetchRecentSessions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecentSessions();
  };

  const totalWorkouts = user?.stats?.totalWorkouts || recentSessions.length || 0;
  const totalCalories = user?.stats?.totalCalories || 0;
  const totalMinutes = user?.stats?.totalMinutes || 0;
  const streakDays = (user?.stats as any)?.streakDays || (totalWorkouts > 0 ? 1 : 0);

  const formatHoursMinutes = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const formatSessionDate = (dateStr?: string, durationSeconds: number = 0) => {
    const date = new Date(dateStr || Date.now());
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    const mins = Math.max(1, Math.round(durationSeconds / 60));

    return `${month} ${day}, ${year} - ${mins}min`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header (Figma #2174:1771) */}
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {totalWorkouts === 0 ? (
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
              <Text style={styles.emptyCtaText}>Start your first workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Active Stats State (Figma #2174:1771)
          <View style={styles.statsContainer}>
            {/* 4 Stat Metric Grid */}
            <View style={styles.gridContainer}>
              {/* Box 1: Workouts Completed */}
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Workout</Text>
                <Text style={styles.statBoxValue}>{totalWorkouts}</Text>
                <Text style={styles.statBoxSub}>Completed</Text>
              </View>

              {/* Box 2: Calories Burned */}
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Calories</Text>
                <Text style={styles.statBoxValue}>{totalCalories.toLocaleString()}</Text>
                <Text style={styles.statBoxSub}>Burned (kcal)</Text>
              </View>

              {/* Box 3: Active Time */}
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Active Time</Text>
                <Text style={styles.statBoxValue}>{formatHoursMinutes(totalMinutes)}</Text>
                <Text style={styles.statBoxSub}>Total Duration</Text>
              </View>

              {/* Box 4: Streak Days */}
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Streak</Text>
                <Text style={[styles.statBoxValue, { color: '#FE2E31' }]}>{streakDays}</Text>
                <Text style={styles.statBoxSub}>Days Active</Text>
              </View>
            </View>

            {/* Streak Consistency Banner */}
            <View style={styles.streakBanner}>
              <View style={{ marginRight: 12 }}>
                <FlameIcon size={26} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.streakBannerTitle}>Consistency Streak</Text>
                <Text style={styles.streakBannerSubtitle}>
                  You’re on a {streakDays}-day active streak! Keep the momentum going.
                </Text>
              </View>
            </View>

            {/* Workout History Section (Figma #2174:1771) */}
            <View style={styles.historySectionHeader}>
              <Text style={styles.historySectionTitle}>Workout History</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('WorkoutHistory')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Workout Cards */}
            <View style={styles.historyList}>
              {recentSessions.map((session) => (
                <TouchableOpacity
                  key={session.clientSessionId || session._id}
                  style={styles.historyCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate('WorkoutPreview', {
                      workoutSlug: session.workoutSlug,
                      workoutTitle: session.workoutTitle,
                    })
                  }
                >
                  <View style={styles.historyCardLeft}>
                    <View style={styles.historyIconBadge}>
                      <FlameIcon size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyWorkoutTitle} numberOfLines={1}>
                        {session.workoutTitle}
                      </Text>
                      <Text style={styles.historyWorkoutMeta}>
                        {formatSessionDate(session.completedAt, session.durationSeconds)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.historyCardRight}>
                    <Text style={styles.historyCaloriesText}>
                      {session.caloriesBurned} kcal
                    </Text>
                    <ArrowRightIcon size={14} color="#999999" style={{ marginLeft: 6 }} />
                  </View>
                </TouchableOpacity>
              ))}
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777777',
  },
  tabTextActive: {
    color: '#111111',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyCtaButton: {
    backgroundColor: '#FE2E31',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  statsContainer: {
    gap: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#FFFBFB',
    borderWidth: 1,
    borderColor: '#F5ECEC',
    borderRadius: 18,
    padding: 16,
  },
  statBoxLabel: {
    fontSize: 13,
    color: '#777777',
    fontWeight: '500',
    marginBottom: 6,
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  statBoxSub: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FCE7E7',
    borderRadius: 18,
    padding: 16,
  },
  streakBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  streakBannerSubtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  historySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FE2E31',
  },
  historyList: {
    gap: 10,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBFB',
    borderWidth: 1,
    borderColor: '#F5ECEC',
    borderRadius: 16,
    padding: 14,
  },
  historyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  historyIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyWorkoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  historyWorkoutMeta: {
    fontSize: 12,
    color: '#777777',
  },
  historyCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyCaloriesText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FE2E31',
  },
});
