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
import { IWorkout, IWorkoutStep } from '../../types/workout.types';
import { colors, spacing } from '../../theme';
import {
  BackArrowIcon,
  BookmarkIcon,
  FlameIcon,
  TimeIcon,
} from '../../components/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutPreview'>;

export const WorkoutPreviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { workoutSlug, workoutTitle } = route.params;

  const [workout, setWorkout] = useState<IWorkout | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showAllExercises, setShowAllExercises] = useState<boolean>(false);

  const fetchWorkoutDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [detailRes, savedRes] = await Promise.allSettled([
        workoutService.getWorkoutBySlug(workoutSlug),
        workoutService.getSavedWorkouts(),
      ]);

      if (detailRes.status === 'fulfilled' && detailRes.value.success && detailRes.value.data) {
        setWorkout(detailRes.value.data);
      }

      if (savedRes.status === 'fulfilled' && savedRes.value.success && Array.isArray(savedRes.value.data)) {
        const found = savedRes.value.data.some((w) => w.slug === workoutSlug);
        setIsSaved(found);
      }
    } catch {
      // Fallback display
    } finally {
      setLoading(false);
    }
  }, [workoutSlug]);

  useEffect(() => {
    fetchWorkoutDetails();
  }, [fetchWorkoutDetails]);

  const toggleSave = async () => {
    if (saving) return;
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState); // Optimistic UI update

    try {
      setSaving(true);
      if (nextSavedState) {
        await workoutService.saveWorkout(workoutSlug);
      } else {
        await workoutService.unsaveWorkout(workoutSlug);
      }
    } catch {
      // Revert if API fails
      setIsSaved(!nextSavedState);
      Alert.alert('Notice', 'Could not update saved status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartWorkout = () => {
    navigation.navigate('WorkoutPlayer', {
      workoutSlug,
      workoutTitle: workout?.title || workoutTitle || 'Workout',
      durationMinutes: workout?.durationMinutes || 20,
    });
  };

  const capitalize = (str?: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatStepMetric = (step: IWorkoutStep) => {
    if (step.stepType === 'timed' && step.durationSeconds) {
      return `${step.durationSeconds} sec`;
    }
    if (step.sets && step.reps) {
      return `${step.sets} × ${step.reps}`;
    }
    if (step.reps) {
      return `${step.reps} reps`;
    }
    if (step.durationSeconds) {
      return `${step.durationSeconds} sec`;
    }
    return '3 × 12';
  };

  const displayedSteps = showAllExercises
    ? workout?.steps || []
    : (workout?.steps || []).slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header (Figma #2382:3407) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <BackArrowIcon size={24} color="#111111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Workout preview</Text>

        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={toggleSave}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <BookmarkIcon
            size={22}
            color={isSaved ? '#FE2E31' : '#111111'}
            filled={isSaved}
          />
        </TouchableOpacity>
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
          {/* Workout Title & Heading (Figma #2341:764) */}
          <Text style={styles.workoutTitle}>
            {workout?.title || workoutTitle || 'Workout Session'}
          </Text>

          {/* Metric Pills Row (Figma #2341:766) */}
          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <TimeIcon size={14} color="#111111" style={{ marginRight: 6 }} />
              <Text style={styles.pillText}>{workout?.durationMinutes || 20} min</Text>
            </View>

            <View style={styles.pill}>
              <FlameIcon size={14} style={{ marginRight: 6 }} />
              <Text style={styles.pillText}>{workout?.estimatedCalories || 300} kcal</Text>
            </View>

            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {capitalize(workout?.difficulty || 'Beginner')}
              </Text>
            </View>
          </View>

          {/* Equipment & Targets (Figma #2341:779) */}
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>
              Equipment: {workout?.equipment?.join(', ') || 'mat, light dumbbells (optional)'}
            </Text>
            <Text style={styles.metaText}>
              Targets: {workout?.primaryMuscles?.join(', ') || 'full body'}
            </Text>
          </View>

          {/* Exercises Section Header (Figma #2341:782) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {workout?.steps?.length || 0} exercises
            </Text>
            {(workout?.steps?.length || 0) > 5 ? (
              <TouchableOpacity
                onPress={() => setShowAllExercises(!showAllExercises)}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>
                  {showAllExercises ? 'Show less' : 'See all'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Exercise Rows (Figma #2341:787 - 841) */}
          <View style={styles.exerciseList}>
            {displayedSteps.map((step, index) => (
              <View key={`${step.exerciseSlug}-${index}`} style={styles.exerciseRow}>
                {/* Number Badge */}
                <View style={styles.numberBadge}>
                  <Text style={styles.numberBadgeText}>{index + 1}</Text>
                </View>

                {/* Exercise Details */}
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName} numberOfLines={1}>
                    {step.exerciseName}
                  </Text>
                </View>

                {/* Reps / Time Metric */}
                <Text style={styles.exerciseMetric}>{formatStepMetric(step)}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Sticky Bottom Action Button (Figma #2362:3173) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.88}
          onPress={handleStartWorkout}
        >
          <Text style={styles.startButtonText}>Start workout</Text>
        </TouchableOpacity>
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
  bookmarkButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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
  workoutTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
    lineHeight: 32,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
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
  metaContainer: {
    marginBottom: 28,
  },
  metaText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FE2E31',
  },
  exerciseList: {
    gap: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBFB',
    borderWidth: 1,
    borderColor: '#F5ECEC',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FE2E31',
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  exerciseMetric: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  startButton: {
    backgroundColor: '#FE2E31',
    borderRadius: 28,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
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
});
