import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { MainTabParamList, RootStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { workoutService } from '../../services/workout.service';
import { IWorkout } from '../../types/workout.types';
import {
  MenuIcon,
  BellIcon,
  CaloriesIcon,
  TimeIcon,
  LevelIcon,
  PlayIcon,
  ArrowRightIcon,
  CalRingIcon,
  TimeRingIcon,
  ActivityChartWave,
} from '../../components/icons';
import { colors, spacing } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface CircularRingProps {
  size?: number;
  strokeWidth?: number;
  percent: number;
  color: string;
  trackColor: string;
  valueText: string | number;
  subText: string;
  badge: React.ReactNode;
}

const CircularProgressRing: React.FC<CircularRingProps> = ({
  size = 120,
  strokeWidth = 7,
  percent = 78,
  color,
  trackColor,
  valueText,
  subText,
  badge,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (circumference * clamped) / 100;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      {/* Floating Badge at Top */}
      <View style={styles.ringBadgeWrapper}>{badge}</View>

      {/* Center Label */}
      <View style={styles.ringTextCenter}>
        <Text style={styles.ringNumberText}>{valueText}</Text>
        <Text style={styles.ringUnitText}>{subText}</Text>
      </View>
    </View>
  );
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [todayWorkout, setTodayWorkout] = useState<IWorkout | null>(null);

  // Time of day greeting
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const displayName = user?.name ? user.name.split(' ')[0] : 'Kaysolo';

  useEffect(() => {
    const fetchTodayWorkout = async () => {
      try {
        // 1. Personalized Plan
        const planRes = await workoutService.getMyPlan().catch(() => null);
        if (planRes?.success && planRes.data?.schedule?.length > 0) {
          const daysOfWeek = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
          ];
          const todayKey = daysOfWeek[new Date().getDay()];
          const todaySchedule = planRes.data.schedule.find((s) => s.dayOfWeek === todayKey);

          const activeWorkoutDay =
            todaySchedule && !todaySchedule.isRestDay && todaySchedule.workoutSlug
              ? todaySchedule
              : planRes.data.schedule.find((s) => !s.isRestDay && s.workoutSlug);

          if (activeWorkoutDay?.workoutSlug) {
            const workoutRes = await workoutService
              .getWorkoutBySlug(activeWorkoutDay.workoutSlug)
              .catch(() => null);
            if (workoutRes?.success && workoutRes.data) {
              setTodayWorkout(workoutRes.data);
              return;
            }
          }
        }

        // 2. Featured fallback
        const res = await workoutService.getWorkouts({ featured: true, limit: 1 });
        if (res.success && res.data.length > 0) {
          setTodayWorkout(res.data[0]);
        }
      } catch {
        // Silent fallback
      }
    };
    fetchTodayWorkout();
  }, []);

  // Stats
  const weeklyTarget = user?.onboarding?.weeklyDays?.length || 3;
  const totalCompleted = user?.stats?.totalWorkouts || 0;
  const workoutsLeft = Math.max(1, weeklyTarget - (totalCompleted % weeklyTarget));
  const goalSubtitle = `You’re ${workoutsLeft} workout${
    workoutsLeft === 1 ? '' : 's'
  } away from your weekly goal.`;

  const totalCalories = user?.stats?.totalCalories || 780;
  const calorieGoal = 1000;
  const caloriePercent = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));

  const totalMinutes = user?.stats?.totalMinutes || 82;
  const minuteGoal = 60;
  const minutePercent = Math.min(100, Math.round((totalMinutes / minuteGoal) * 100));

  const workoutSlug = todayWorkout?.slug || 'full-body-burn';
  const workoutTitle = todayWorkout?.title || 'Full Body Burn';
  const workoutDuration = todayWorkout?.durationMinutes || 45;
  const workoutCalories = todayWorkout?.estimatedCalories || 320;
  const workoutDifficulty = todayWorkout?.difficulty
    ? todayWorkout.difficulty.charAt(0).toUpperCase() + todayWorkout.difficulty.slice(1)
    : 'Intermediate';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Top Header Bar (Figma #2174:1993) */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Menu')}
            activeOpacity={0.7}
          >
            <MenuIcon size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <BellIcon size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* 2. Greeting Block (Figma #2172:1527) */}
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingTitle}>
            {timeGreeting}, {displayName}
          </Text>
          <Text style={styles.greetingSubtitle}>{goalSubtitle}</Text>
        </View>

        {/* 3. Today's Workout Card (Figma #2172:1581) */}
        <LinearGradient
          colors={['#FFF5F5', '#FFFFFF']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.todayCard}
        >
          <View style={styles.todayTopRow}>
            {/* Left Content Column */}
            <View style={styles.todayLeftCol}>
              <Text style={styles.todayLabel}>Today’s Workout</Text>
              <Text style={styles.todayTitle} numberOfLines={2}>
                {workoutTitle}
              </Text>

              {/* Tag Pills Row 1 */}
              <View style={styles.pillRow}>
                <View style={styles.pillBadge}>
                  <TimeIcon size={12} color="#FE2E31" style={{ marginRight: 3 }} />
                  <Text style={styles.pillText}>{workoutDuration} min</Text>
                </View>
                <View style={styles.pillBadge}>
                  <CaloriesIcon size={12} color="#FE2E31" style={{ marginRight: 3 }} />
                  <Text style={styles.pillText}>{workoutCalories} kcal</Text>
                </View>
              </View>

              {/* Tag Pills Row 2 */}
              <View style={[styles.pillRow, { marginTop: 6 }]}>
                <View style={styles.pillBadge}>
                  <LevelIcon size={12} color="#FE2E31" style={{ marginRight: 3 }} />
                  <Text style={styles.pillText}>{workoutDifficulty}</Text>
                </View>
              </View>
            </View>

            {/* Right Athlete Image (Figma #2172:1275) */}
            <View style={styles.todayImageContainer}>
              <Image
                source={require('../../../assets/figma/workout-runner.png')}
                style={styles.todayRunnerImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Start Workout Button (Figma #2172:1566) */}
          <TouchableOpacity
            style={styles.startWorkoutButton}
            activeOpacity={0.88}
            onPress={() =>
              navigation.navigate('WorkoutPlayer', {
                workoutSlug,
                workoutTitle,
                durationMinutes: workoutDuration,
              })
            }
          >
            <PlayIcon size={28} color="#FE2E31" />
            <Text style={styles.startWorkoutText}>Start Workout</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* 4. Circular Progress Cards Row (Figma #2175:2153) */}
        <View style={styles.statsRow}>
          {/* Card 1: Calories Burned (Figma #2174:1679) */}
          <View style={styles.statCard}>
            <Text style={styles.statCardTitle}>Calories Burned</Text>
            <CircularProgressRing
              size={120}
              strokeWidth={7}
              percent={caloriePercent}
              color="#FF6D00"
              trackColor="#FFF0E5"
              valueText={totalCalories}
              subText={`/${calorieGoal}kcal`}
              badge={<CalRingIcon size={32} />}
            />
          </View>

          {/* Card 2: Active Time (Figma #2174:1680) */}
          <View style={styles.statCard}>
            <Text style={styles.statCardTitle}>Active Time</Text>
            <CircularProgressRing
              size={120}
              strokeWidth={7}
              percent={minutePercent}
              color="#36C25F"
              trackColor="#EBF9EF"
              valueText={totalMinutes}
              subText={`/${minuteGoal}min`}
              badge={<TimeRingIcon size={32} />}
            />
          </View>
        </View>

        {/* 5. Activity Overview Section (Figma #2174:1991) */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeaderRow}>
            <Text style={styles.activityTitle}>Activity Overview</Text>
            <TouchableOpacity style={styles.todayPill} activeOpacity={0.8}>
              <Text style={styles.todayPillText}>Today</Text>
              <ArrowRightIcon size={14} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Activity Chart Card (Figma #2174:1990) */}
          <View style={styles.chartCard}>
            {/* Chart Graphic Area */}
            <View style={styles.chartBodyRow}>
              {/* Y-Axis Labels */}
              <View style={styles.yAxisCol}>
                <Text style={styles.axisLabel}>1000</Text>
                <Text style={styles.axisLabel}>750</Text>
                <Text style={styles.axisLabel}>500</Text>
                <Text style={styles.axisLabel}>250</Text>
                <Text style={styles.axisLabel}>0</Text>
              </View>

              {/* Red Area Wave Graph with grid lines */}
              <View style={styles.waveGraphContainer}>
                {/* Dotted horizontal guideline lines */}
                <View style={[styles.gridLine, { top: '0%' }]} />
                <View style={[styles.gridLine, { top: '25%' }]} />
                <View style={[styles.gridLine, { top: '50%' }]} />
                <View style={[styles.gridLine, { top: '75%' }]} />
                <View style={[styles.gridLine, { top: '100%' }]} />
                <ActivityChartWave height={85} />
              </View>
            </View>

            {/* X-Axis Days */}
            <View style={styles.xAxisRow}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <Text key={idx} style={styles.dayLabel}>
                  {day}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // 1. Top Header Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
  },

  // 2. Greeting Block
  greetingBlock: {
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },

  // 3. Today's Workout Card
  todayCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.22)',
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    marginBottom: 22,
    shadowColor: '#FE2E31',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  todayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  todayLeftCol: {
    flex: 1,
    paddingRight: 6,
  },
  todayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FE2E31',
    marginBottom: 4,
  },
  todayTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#000000',
  },
  todayImageContainer: {
    width: 145,
    height: 125,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayRunnerImage: {
    width: '100%',
    height: '100%',
  },
  startWorkoutButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FE2E31',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  startWorkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // 4. Circular Progress Cards Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFBFB',
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.18)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  ringBadgeWrapper: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  ringTextCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringNumberText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 28,
  },
  ringUnitText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
  },

  // 5. Activity Overview Section
  activitySection: {
    marginBottom: 20,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBFB',
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  todayPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  chartCard: {
    backgroundColor: '#FFFBFB',
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.18)',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  chartBodyRow: {
    flexDirection: 'row',
    height: 95,
    alignItems: 'center',
    marginBottom: 10,
  },
  yAxisCol: {
    width: 28,
    height: 85,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  axisLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 12,
  },
  waveGraphContainer: {
    flex: 1,
    height: 85,
    position: 'relative',
    justifyContent: 'center',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(254, 46, 49, 0.08)',
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 30,
    paddingRight: 6,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#000000',
  },
});
