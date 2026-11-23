import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { workoutService } from '../../services/workout.service';
import { IProgram, IProgramWeek } from '../../types/workout.types';
import { colors } from '../../theme';
import { BackArrowIcon, ArrowRightIcon } from '../../components/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'ProgramPreview'>;

export const ProgramPreviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { programSlug, programTitle } = route.params;

  const [program, setProgram] = useState<IProgram | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolling, setEnrolling] = useState<boolean>(false);

  const fetchProgramDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await workoutService.getProgramBySlug(programSlug);
      if (res.success && res.data) {
        setProgram(res.data);
      }
    } catch {
      // Quiet fallback
    } finally {
      setLoading(false);
    }
  }, [programSlug]);

  useEffect(() => {
    fetchProgramDetails();
  }, [fetchProgramDetails]);

  const handleStartProgram = () => {
    setEnrolling(true);
    // Find the first scheduled workout from Week 1
    const firstWorkoutSlug =
      program?.weeks?.[0]?.schedule?.find((s) => !s.isRestDay)?.workoutSlug ||
      'full-body-burn';

    Alert.alert(
      'Program Started!',
      `You have enrolled in ${program?.title || 'this program'}. Workouts are now scheduled for you.`,
      [
        {
          text: 'Start Week 1 Workout',
          onPress: () => {
            navigation.navigate('WorkoutPreview', {
              workoutSlug: firstWorkoutSlug,
              workoutTitle: `${program?.title || 'Program'} - Week 1`,
            });
          },
        },
        {
          text: 'View Schedule',
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
      ]
    );
    setEnrolling(false);
  };

  const handleSelectWeekWorkout = (week: IProgramWeek) => {
    const activeWorkout = week.schedule.find((s) => !s.isRestDay);
    if (activeWorkout?.workoutSlug) {
      navigation.navigate('WorkoutPreview', {
        workoutSlug: activeWorkout.workoutSlug,
        workoutTitle: activeWorkout.workoutTitle || `Week ${week.weekNumber} Workout`,
      });
    } else {
      Alert.alert(
        `Week ${week.weekNumber}`,
        `${week.schedule.filter((s) => !s.isRestDay).length} workouts planned for this week.`
      );
    }
  };

  const capitalize = (str?: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header (Figma #2341:580) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <BackArrowIcon size={24} color="#111111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Program preview</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title (Figma #2341:623) */}
          <Text style={styles.programTitle}>
            {program?.title || programTitle || 'Goblet Squat Basics'}
          </Text>

          {/* Metric Pills Row (Figma #2360:2447) */}
          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{program?.durationWeeks || 4} weeks</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {program?.sessionsPerWeek || 4} workouts a week
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {capitalize(program?.level || 'Beginner')}
              </Text>
            </View>
          </View>

          {/* Description (Figma #2341:639) */}
          <Text style={styles.description}>
            {program?.description ||
              'Build a strong, stable foundation with short sessions that get a little harder each week. You only need a mat and light weights.'}
          </Text>

          {/* Weeks Curriculum Section (Figma #2341:642) */}
          <Text style={styles.sectionTitle}>
            Your {program?.weeks?.length || 4} weeks
          </Text>

          <View style={styles.weeksList}>
            {(program?.weeks || []).map((week) => {
              const activeCount = week.schedule?.filter((s) => !s.isRestDay).length || 4;
              return (
                <TouchableOpacity
                  key={week.weekNumber}
                  style={styles.weekCard}
                  activeOpacity={0.8}
                  onPress={() => handleSelectWeekWorkout(week)}
                >
                  <View style={styles.weekNumberBadge}>
                    <Text style={styles.weekNumberText}>{week.weekNumber}</Text>
                  </View>

                  <View style={styles.weekInfo}>
                    <Text style={styles.weekTitle}>
                      Week {week.weekNumber} · {week.title}
                    </Text>
                    <Text style={styles.weekSubtitle}>
                      {activeCount} workouts · 20 min each
                    </Text>
                  </View>

                  <ArrowRightIcon size={16} color="#999999" />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Sticky Bottom Action (Figma #2341:718 - 720) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.88}
          onPress={handleStartProgram}
          disabled={enrolling}
        >
          <Text style={styles.startButtonText}>Start program</Text>
        </TouchableOpacity>
        <Text style={styles.bottomNote}>
          Workouts are added to your weekly schedule.
        </Text>
      </View>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  loaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  programTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
    lineHeight: 32,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  pill: {
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
  },
  weeksList: {
    gap: 12,
  },
  weekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBFB',
    borderWidth: 1,
    borderColor: '#F5ECEC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  weekNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  weekNumberText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FE2E31',
  },
  weekInfo: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  weekSubtitle: {
    fontSize: 13,
    color: '#666666',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    backgroundColor: '#FE2E31',
    borderRadius: 28,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#FE2E31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomNote: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
  },
});
