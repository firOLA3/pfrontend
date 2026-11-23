import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../theme';
import { apiRequest, API_BASE_URL } from '../../services/api';
import { workoutService } from '../../services/workout.service';
import { PauseIcon, CloseIcon, CheckIcon, FlameIcon } from '../../components/icons';
import { ExerciseMediaViewer } from '../../components/exercise/ExerciseMediaViewer';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutPlayer'>;

type PlayerState = 'get_ready' | 'exercise' | 'rest' | 'complete';

interface ExerciseStep {
  name: string;
  slug: string;
  targetMuscles: string;
  type: 'timed' | 'counted';
  durationSeconds?: number;
  reps?: number;
  sets?: number;
  restSeconds?: number;
  met: number;
  mediaUrl?: string;
  animationUrl?: string;
  videoUrl?: string;
  startImageUrl?: string;
  peakImageUrl?: string;
  instructions?: string[];
}

const SAMPLE_STEPS: ExerciseStep[] = [
  {
    name: 'Front Squat',
    slug: 'front-squat',
    targetMuscles: 'Quadriceps, Glutes',
    type: 'counted',
    sets: 3,
    reps: 10,
    met: 6.0,
    videoUrl: '/static/exercises/exports/front-squat.mp4',
    animationUrl: '/static/exercises/animations/front-squat.webp',
    mediaUrl: '/static/exercises/classic/front-squat-main.webp',
    startImageUrl: '/static/exercises/classic/front-squat-start.webp',
    peakImageUrl: '/static/exercises/classic/front-squat-peak.webp',
  },
  {
    name: 'Bent-Over Dumbbell Row',
    slug: 'bent-over-db-row',
    targetMuscles: 'Upper Back, Lats',
    type: 'counted',
    sets: 3,
    reps: 12,
    met: 5.5,
    videoUrl: '/static/exercises/exports/bent-over-db-row.mp4',
    animationUrl: '/static/exercises/animations/bent-over-db-row.webp',
    mediaUrl: '/static/exercises/classic/bent-over-db-row-main.webp',
    startImageUrl: '/static/exercises/classic/bent-over-db-row-start.webp',
    peakImageUrl: '/static/exercises/classic/bent-over-db-row-peak.webp',
  },
  {
    name: 'Mountain Climbers',
    slug: 'mountain-climbers',
    targetMuscles: 'Core, Cardio',
    type: 'timed',
    durationSeconds: 30,
    met: 8.0,
    videoUrl: '/static/exercises/exports/mountain-climbers.mp4',
    animationUrl: '/static/exercises/animations/mountain-climbers.webp',
    mediaUrl: '/static/exercises/classic/mountain-climbers-main.webp',
    startImageUrl: '/static/exercises/classic/mountain-climbers-start.webp',
    peakImageUrl: '/static/exercises/classic/mountain-climbers-peak.webp',
  },
  {
    name: 'Cat Cow',
    slug: 'cat-cow',
    targetMuscles: 'Spine, Mobility',
    type: 'timed',
    durationSeconds: 40,
    met: 3.5,
    videoUrl: '/static/exercises/exports/cat-cow.mp4',
    animationUrl: '/static/exercises/animations/cat-cow.webp',
    mediaUrl: '/static/exercises/classic/cat-cow-main.webp',
    startImageUrl: '/static/exercises/classic/cat-cow-start.webp',
    peakImageUrl: '/static/exercises/classic/cat-cow-peak.webp',
  },
  {
    name: 'Dumbbell Bicep Curl',
    slug: 'bicep-curl',
    targetMuscles: 'Biceps, Forearms',
    type: 'counted',
    sets: 3,
    reps: 12,
    met: 5.0,
    videoUrl: '/static/exercises/exports/bicep-curl.mp4',
    animationUrl: '/static/exercises/animations/bicep-curl.webp',
    mediaUrl: '/static/exercises/classic/bicep-curl-main.webp',
    startImageUrl: '/static/exercises/classic/bicep-curl-start.webp',
    peakImageUrl: '/static/exercises/classic/bicep-curl-peak.webp',
  },
];

export const WorkoutPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user, updateUser } = useAuth();
  const { workoutTitle = 'Full Body Burn', workoutSlug } = route.params || {};

  const [steps, setSteps] = useState<ExerciseStep[]>(SAMPLE_STEPS);
  const [state, setState] = useState<PlayerState>('get_ready');
  const [getReadySeconds, setGetReadySeconds] = useState(3);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [exerciseSeconds, setExerciseSeconds] = useState(30);
  const [restSeconds, setRestSeconds] = useState(25);
  const [currentSet, setCurrentSet] = useState(1);

  // Stats tracking
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(0);
  const [feedback, setFeedback] = useState<'too_easy' | 'just_right' | 'too_hard' | null>(null);

  // Modals
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [endEarlyModalVisible, setEndEarlyModalVisible] = useState(false);

  const sessionIdRef = useRef<string>(
    `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  );

  useEffect(() => {
    workoutService.syncOfflineSessions();
  }, []);

  // Load real workout if slug provided
  useEffect(() => {
    const loadWorkoutData = async () => {
      if (!workoutSlug) return;
      try {
        const res = await workoutService.getWorkoutBySlug(workoutSlug);
        if (res.success && res.data?.steps?.length > 0) {
          const loadedSteps: ExerciseStep[] = res.data.steps.map((s) => ({
            name: s.exerciseDetails?.name || s.exerciseName,
            slug: s.exerciseSlug,
            targetMuscles:
              s.exerciseDetails?.primaryMuscles?.join(', ') ||
              res.data.primaryMuscles?.join(', ') ||
              'Target Muscles',
            type: s.stepType,
            durationSeconds: s.durationSeconds || 30,
            sets: s.sets || 3,
            reps: s.reps || 10,
            restSeconds: s.restSeconds || 30,
            met: s.exerciseDetails?.met || 6.0,
            mediaUrl: s.exerciseDetails?.mediaUrl,
            animationUrl: s.exerciseDetails?.animationUrl,
            videoUrl: s.exerciseDetails?.videoUrl,
            startImageUrl: s.exerciseDetails?.startImageUrl,
            peakImageUrl: s.exerciseDetails?.peakImageUrl,
            instructions: s.exerciseDetails?.instructions,
          }));
          setSteps(loadedSteps);
          if (loadedSteps[0]?.durationSeconds) {
            setExerciseSeconds(loadedSteps[0].durationSeconds);
          }
        }
      } catch {
        // Safe offline fallback: keep SAMPLE_STEPS
      }
    };
    loadWorkoutData();
  }, [workoutSlug]);

  const step = steps[currentStepIndex] || steps[0];
  const nextStep = steps[currentStepIndex + 1];

  const userWeight = user?.onboarding?.weightKg || 70; // fallback to 70kg estimate

  // Main real-time clock ticker
  useEffect(() => {
    if (pauseModalVisible || endEarlyModalVisible || state === 'complete') return;

    const interval = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);

      if (state === 'get_ready') {
        setGetReadySeconds((prev) => {
          if (prev <= 1) {
            setState('exercise');
            return 3;
          }
          return prev - 1;
        });
      } else if (state === 'exercise') {
        // Calorie calculation: MET * weightKg * (seconds / 3600)
        const burnPerSec = (step.met * userWeight) / 3600;
        setTotalCaloriesBurned((prev) => prev + burnPerSec);

        if (step.type === 'timed') {
          setExerciseSeconds((prev) => {
            if (prev <= 1) {
              handleExerciseDone();
              return step.durationSeconds || 30;
            }
            return prev - 1;
          });
        }
      } else if (state === 'rest') {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            startNextExercise();
            return step.restSeconds || 25;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state, pauseModalVisible, endEarlyModalVisible, currentStepIndex, currentSet, step, userWeight]);

  const handleExerciseDone = () => {
    if (step.type === 'counted' && currentSet < (step.sets || 3)) {
      setCurrentSet((s) => s + 1);
      setState('rest');
      setRestSeconds(step.restSeconds || 20);
    } else {
      if (currentStepIndex + 1 < steps.length) {
        setState('rest');
        setRestSeconds(step.restSeconds || 25);
      } else {
        finishWorkout();
      }
    }
  };

  const startNextExercise = () => {
    if (currentStepIndex + 1 < steps.length) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setCurrentSet(1);
      setExerciseSeconds(steps[nextIdx].durationSeconds || 30);
      setState('exercise');
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = async (isEarly = false) => {
    if (isEarly) {
      setEndEarlyModalVisible(false);
    }
    setState('complete');

    const sessionRecord = {
      clientSessionId: sessionIdRef.current,
      workoutSlug: route.params.workoutSlug || 'workout',
      workoutTitle,
      durationSeconds: totalElapsedSeconds,
      caloriesBurned: Math.round(totalCaloriesBurned),
      exercisesCompleted: currentStepIndex + 1,
      totalExercises: steps.length,
      feedback: feedback || undefined,
      status: (isEarly ? 'abandoned' : 'completed') as 'completed' | 'abandoned',
      completedAt: new Date().toISOString(),
    };

    try {
      // 1. Live server synchronization
      const res = await workoutService.saveSession(sessionRecord);
      if (res.success && res.stats) {
        updateUser({ stats: res.stats });
      }
    } catch {
      // 2. Offline queue backup for automatic sync when network restores
      try {
        const existing = await AsyncStorage.getItem('@pulsefit_offline_sessions');
        const list = existing ? JSON.parse(existing) : [];
        list.push(sessionRecord);
        await AsyncStorage.setItem('@pulsefit_offline_sessions', JSON.stringify(list));
      } catch {}

      // Optimistic in-memory update
      if (user) {
        updateUser({
          stats: {
            totalWorkouts: (user.stats?.totalWorkouts || 0) + 1,
            totalCalories: (user.stats?.totalCalories || 0) + Math.round(totalCaloriesBurned),
            totalMinutes: (user.stats?.totalMinutes || 0) + Math.round(totalElapsedSeconds / 60),
          },
        });
      }
    }
  };

  const handleFeedbackSelect = async (fId: 'too_easy' | 'just_right' | 'too_hard') => {
    setFeedback(fId);
    try {
      await workoutService.saveSession({
        clientSessionId: sessionIdRef.current,
        workoutSlug: route.params.workoutSlug || 'workout',
        workoutTitle,
        durationSeconds: totalElapsedSeconds,
        caloriesBurned: Math.round(totalCaloriesBurned),
        exercisesCompleted: currentStepIndex + 1,
        totalExercises: steps.length,
        feedback: fId,
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
    } catch {}
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // 1. GET READY STATE (Figma #2341:847)
  if (state === 'get_ready') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.getReadyLabel}>Get Ready</Text>
          <Text style={styles.workoutSubtitle}>{workoutTitle} starts in</Text>
          <View style={styles.countdownCircle}>
            <Text style={styles.countdownNumber}>{getReadySeconds}</Text>
          </View>
          <Text style={styles.firstExerciseText}>Up first: {step.name}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 2. WORKOUT COMPLETE STATE (Figma #2342:1147)
  if (state === 'complete') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContent}>
          <View style={{ marginBottom: 16 }}>
            <FlameIcon size={56} />
          </View>
          <Text style={styles.completeTitle}>Workout complete!</Text>
          <Text style={styles.completeSubtitle}>{workoutTitle}</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{formatTime(totalElapsedSeconds)}</Text>
                <Text style={styles.summaryLabel}>Total Time</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{Math.round(totalCaloriesBurned)}</Text>
                <Text style={styles.summaryLabel}>Calories (kcal)</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{currentStepIndex + 1}</Text>
                <Text style={styles.summaryLabel}>Exercises</Text>
              </View>
            </View>
          </View>

          {/* Feedback Section (too easy / just right / too hard) */}
          <Text style={styles.feedbackTitle}>How was the workout?</Text>
          <View style={styles.feedbackRow}>
            {[
              { id: 'too_easy', label: 'Too Easy', emoji: '😌' },
              { id: 'just_right', label: 'Just Right', emoji: '👌' },
              { id: 'too_hard', label: 'Too Hard', emoji: '🥵' },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.feedbackBtn, feedback === f.id && styles.feedbackBtnSelected]}
                onPress={() => handleFeedbackSelect(f.id as any)}
              >
                <Text style={styles.feedbackEmoji}>{f.emoji}</Text>
                <Text style={[styles.feedbackLabel, feedback === f.id && styles.feedbackLabelSelected]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneButtonText}>Finish & Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 3. REST STATE (Figma #2342:995)
  if (state === 'rest') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setPauseModalVisible(true)} style={styles.topIconBtn}>
            <PauseIcon size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Rest Time</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.restCenter}>
          <Text style={styles.restLabel}>Rest</Text>
          <Text style={styles.restCountdown}>{formatTime(restSeconds)}</Text>

          <View style={styles.restButtonsRow}>
            <TouchableOpacity
              style={styles.plusTimeBtn}
              onPress={() => setRestSeconds((s) => s + 15)}
            >
              <Text style={styles.plusTimeText}>+15 s</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipRestBtn} onPress={startNextExercise}>
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        </View>

        {nextStep && (
          <View style={styles.upNextCard}>
            <Text style={styles.upNextLabel}>UP NEXT</Text>
            <Text style={styles.upNextTitle}>{nextStep.name}</Text>
            <Text style={styles.upNextSubtitle}>{nextStep.targetMuscles}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // 4. EXERCISE STATE (Figma #2342:894)
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setPauseModalVisible(true)} style={styles.topIconBtn}>
          <PauseIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          Exercise {currentStepIndex + 1} of {steps.length}
        </Text>
        <TouchableOpacity onPress={() => setEndEarlyModalVisible(true)} style={styles.topIconBtn}>
          <CloseIcon size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Exercise Video / Animation / Form Media */}
      <View style={styles.exerciseMediaBox}>
        <ExerciseMediaViewer
          videoUrl={step.videoUrl}
          animationUrl={step.animationUrl}
          posterUrl={step.mediaUrl}
          startImageUrl={step.startImageUrl}
          peakImageUrl={step.peakImageUrl}
          exerciseName={step.name}
          isPaused={pauseModalVisible || endEarlyModalVisible || state !== 'exercise'}
        />
      </View>

      {/* Exercise Info */}
      <View style={styles.exerciseDetails}>
        <Text style={styles.exerciseName}>{step.name}</Text>
        <Text style={styles.exerciseMuscles}>{step.targetMuscles}</Text>

        {step.type === 'timed' ? (
          <View style={styles.timerBlock}>
            <Text style={styles.timerDisplay}>{formatTime(exerciseSeconds)}</Text>
            <Text style={styles.timerSubLabel}>Seconds Remaining</Text>
          </View>
        ) : (
          <View style={styles.setsRepsBlock}>
            <Text style={styles.setsRepsDisplay}>
              Set {currentSet} of {step.sets || 3}
            </Text>
            <Text style={styles.repsDisplay}>{step.reps || 12} reps</Text>
          </View>
        )}
      </View>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.85}
          onPress={handleExerciseDone}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {step.type !== 'timed' && <CheckIcon size={16} color="#FFFFFF" />}
            <Text style={styles.actionBtnText}>
              {step.type === 'timed' ? 'Next Exercise' : 'Done Set'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Pause Modal (Figma #2342:1049) */}
      <Modal visible={pauseModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Paused</Text>
            <Text style={styles.modalSubtitle}>
              {formatTime(totalElapsedSeconds)} elapsed · {currentStepIndex + 1} of {steps.length} exercises
            </Text>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => setPauseModalVisible(false)}
              >
                <Text style={styles.modalPrimaryBtnText}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => {
                  setPauseModalVisible(false);
                  setExerciseSeconds(step.durationSeconds || 30);
                  setCurrentSet(1);
                }}
              >
                <Text style={styles.modalSecondaryBtnText}>Restart Exercise</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDangerBtn}
                onPress={() => {
                  setPauseModalVisible(false);
                  setEndEarlyModalVisible(true);
                }}
              >
                <Text style={styles.modalDangerBtnText}>End Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* End Early Modal (Figma #2342:1097) */}
      <Modal visible={endEarlyModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>End workout early?</Text>
            <Text style={styles.modalSubtitle}>
              You’ve done {currentStepIndex + 1} of {steps.length} exercises.
            </Text>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => finishWorkout(true)}>
                <Text style={styles.modalPrimaryBtnText}>Save and Finish</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => {
                  setEndEarlyModalVisible(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalSecondaryBtnText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalGhostBtn}
                onPress={() => setEndEarlyModalVisible(false)}
              >
                <Text style={styles.modalGhostBtnText}>Keep Going</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
  },
  getReadyLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  workoutSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  countdownCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primarySoft,
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  countdownNumber: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.primary,
  },
  firstExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topIconText: {
    fontSize: 16,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  exerciseMediaBox: {
    marginHorizontal: spacing.screenPadding,
    marginBottom: 16,
  },
  exerciseMediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  mediaEmoji: {
    fontSize: 72,
  },
  exerciseDetails: {
    paddingHorizontal: spacing.screenPadding,
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  exerciseMuscles: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  timerBlock: {
    alignItems: 'center',
  },
  timerDisplay: {
    fontSize: 54,
    fontWeight: '700',
    color: colors.primary,
  },
  timerSubLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  setsRepsBlock: {
    alignItems: 'center',
  },
  setsRepsDisplay: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  repsDisplay: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bottomBar: {
    marginTop: 'auto',
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 24,
  },
  actionBtn: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  restCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  restCountdown: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 24,
  },
  restButtonsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  plusTimeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
  },
  plusTimeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  skipRestBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  skipRestText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  upNextCard: {
    marginHorizontal: spacing.screenPadding,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 24,
  },
  upNextLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  upNextTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  upNextSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  completeContent: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  completeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  completeSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  feedbackBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 6,
  },
  feedbackBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  feedbackEmoji: {
    fontSize: 20,
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  feedbackLabelSelected: {
    color: colors.primary,
  },
  doneButton: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonGroup: {
    width: '100%',
    gap: 10,
  },
  modalPrimaryBtn: {
    height: 46,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  modalSecondaryBtn: {
    height: 46,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  modalDangerBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDangerBtnText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
  modalGhostBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGhostBtnText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

