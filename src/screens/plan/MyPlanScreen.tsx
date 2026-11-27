import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { workoutService } from '../../services/workout.service';
import { IPlan, IScheduledDay } from '../../types/workout.types';
import {
  ArrowRightIcon,
  PlayIcon,
  TimeIcon,
  CaloriesIcon,
  LevelIcon,
  PlanIcon,
} from '../../components/icons';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MyPlan'>;

const DAY_ORDER: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

export const MyPlanScreen: React.FC<Props> = ({ navigation }) => {
  const [plan, setPlan] = useState<IPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      const res = await workoutService.getMyPlan();
      if (res.success && res.data) {
        setPlan(res.data);
      }
    } catch {
      // Quiet fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlan();
  };

  const handleRegenerate = async () => {
    Alert.alert(
      'Rebuild Plan',
      'Would you like to re-generate your weekly plan schedule based on your current preferences?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rebuild',
          onPress: async () => {
            try {
              setIsRegenerating(true);
              const res = await workoutService.generatePlan();
              if (res.success && res.data) {
                setPlan(res.data);
                Alert.alert('Plan Updated', 'Your weekly plan has been regenerated.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to regenerate plan.');
            } finally {
              setIsRegenerating(false);
            }
          },
        },
      ]
    );
  };

  const scheduleDays = (plan?.schedule || []).slice().sort((a, b) => {
    return (DAY_ORDER[a.dayOfWeek] || 0) - (DAY_ORDER[b.dayOfWeek] || 0);
  });

  const levelText = plan?.level
    ? plan.level.charAt(0).toUpperCase() + plan.level.slice(1)
    : 'Intermediate';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Main');
            }
          }}
          activeOpacity={0.7}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ArrowRightIcon size={20} color="#111111" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Plan</Text>
        <TouchableOpacity
          onPress={handleRegenerate}
          disabled={isRegenerating}
          activeOpacity={0.7}
          style={styles.headerRegenBtn}
        >
          {isRegenerating ? (
            <ActivityIndicator size="small" color="#FE2E31" />
          ) : (
            <Text style={styles.headerRegenText}>Rebuild</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FE2E31" />
          <Text style={styles.loadingText}>Loading your training schedule...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FE2E31"
              colors={['#FE2E31']}
            />
          }
        >
          {/* Plan Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTopRow}>
              <View style={styles.iconCircle}>
                <PlanIcon size={22} color="#FE2E31" />
              </View>
              <View style={styles.summaryTextCol}>
                <Text style={styles.summaryTitle}>Personalized Schedule</Text>
                <Text style={styles.summarySubtitle}>
                  {plan?.sessionsPerWeek || 3} workouts planned this week
                </Text>
              </View>
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.pillBadge}>
                <LevelIcon size={12} color="#FE2E31" style={{ marginRight: 4 }} />
                <Text style={styles.pillText}>{levelText}</Text>
              </View>
              {plan?.preferredTime && (
                <View style={styles.pillBadge}>
                  <TimeIcon size={12} color="#FE2E31" style={{ marginRight: 4 }} />
                  <Text style={styles.pillText}>{plan.preferredTime}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Schedule Days List */}
          <Text style={styles.sectionHeading}>Weekly Schedule</Text>

          <View style={styles.daysList}>
            {scheduleDays.map((day: IScheduledDay, idx: number) => {
              const isRest = day.isRestDay || !day.workoutSlug;
              return (
                <View
                  key={idx}
                  style={[
                    styles.dayCard,
                    isRest ? styles.restCard : styles.workoutCard,
                  ]}
                >
                  <View style={styles.dayHeaderRow}>
                    <Text style={styles.dayName}>{day.dayName}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        isRest ? styles.restBadge : styles.workoutBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isRest ? styles.restText : styles.workoutText,
                        ]}
                      >
                        {isRest ? 'Rest Day' : 'Workout'}
                      </Text>
                    </View>
                  </View>

                  {isRest ? (
                    <Text style={styles.restDescription}>
                      Rest and recovery. Drink plenty of water and allow your muscles to rebuild.
                    </Text>
                  ) : (
                    <View style={styles.workoutBody}>
                      <Text style={styles.workoutTitle} numberOfLines={1}>
                        {day.workoutTitle || 'Full Body Burn'}
                      </Text>

                      <View style={styles.workoutPillRow}>
                        <View style={styles.statPill}>
                          <TimeIcon size={11} color="#FE2E31" style={{ marginRight: 3 }} />
                          <Text style={styles.statPillText}>
                            {day.durationMinutes || 45} min
                          </Text>
                        </View>
                        <View style={styles.statPill}>
                          <CaloriesIcon size={11} color="#FE2E31" style={{ marginRight: 3 }} />
                          <Text style={styles.statPillText}>
                            {day.estimatedCalories || 320} kcal
                          </Text>
                        </View>
                      </View>

                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          style={styles.previewBtn}
                          activeOpacity={0.8}
                          onPress={() =>
                            navigation.navigate('WorkoutPreview', {
                              workoutSlug: day.workoutSlug!,
                              workoutTitle: day.workoutTitle,
                            })
                          }
                        >
                          <Text style={styles.previewBtnText}>Details</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.startBtn}
                          activeOpacity={0.88}
                          onPress={() =>
                            navigation.navigate('WorkoutPlayer', {
                              workoutSlug: day.workoutSlug!,
                              workoutTitle: day.workoutTitle || 'Workout',
                              durationMinutes: day.durationMinutes || 45,
                            })
                          }
                        >
                          <PlayIcon size={18} color="#FE2E31" />
                          <Text style={styles.startBtnText}>Start</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
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
  headerRegenBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerRegenText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FE2E31',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.22)',
    padding: 16,
    marginBottom: 24,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 13,
    color: '#666666',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.2)',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111111',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 14,
  },
  daysList: {
    gap: 12,
  },
  dayCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.8,
  },
  workoutCard: {
    backgroundColor: '#FFFBFB',
    borderColor: 'rgba(254, 46, 49, 0.18)',
  },
  restCard: {
    backgroundColor: '#FAFAFA',
    borderColor: '#EEEEEE',
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  workoutBadge: {
    backgroundColor: '#FFF0F0',
  },
  restBadge: {
    backgroundColor: '#EEEEEE',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  workoutText: {
    color: '#FE2E31',
  },
  restText: {
    color: '#777777',
  },
  restDescription: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
  },
  workoutBody: {},
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  workoutPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: '#F0F0F0',
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#111111',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  previewBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  startBtn: {
    flex: 1.2,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FE2E31',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  startBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
