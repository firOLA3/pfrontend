import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation.types';
import { workoutService } from '../../services/workout.service';
import { IWorkout, IProgram } from '../../types/workout.types';
import { colors, spacing } from '../../theme';
import {
  SearchIcon,
  CloseIcon,
  TimeIcon,
  ArrowRightIcon,
} from '../../components/icons';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Explore'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CATEGORIES = ['All', 'Strength', 'Cardio', 'HIIT', 'Flexibility', 'Core'];

const FALLBACK_WORKOUTS: IWorkout[] = [
  {
    slug: 'full-body-burn',
    title: 'Full Body Burn',
    description: 'High-energy total body workout targeting major muscle groups.',
    category: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 45,
    estimatedCalories: 380,
    badge: 'Popular',
    bannerImage: '',
    primaryMuscles: ['quads', 'chest', 'back', 'abs'],
    equipment: ['dumbbells', 'pull-up bar', 'mat'],
    steps: [],
    isFeatured: true,
    tags: ['full-body'],
  },
  {
    slug: 'upper-body-strength',
    title: 'Upper Body Strength',
    description: 'Focused hypertrophy and power for chest, back, shoulders, and arms.',
    category: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 35,
    estimatedCalories: 280,
    badge: 'Strength',
    bannerImage: '',
    primaryMuscles: ['chest', 'lats', 'shoulders', 'biceps', 'triceps'],
    equipment: ['dumbbells', 'cable machine'],
    steps: [],
    isFeatured: true,
    tags: ['upper-body'],
  },
  {
    slug: 'lower-body-strength',
    title: 'Lower Body Strength',
    description: 'Build powerful legs and glutes through compound squats and lunges.',
    category: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 35,
    estimatedCalories: 310,
    badge: 'Legs',
    bannerImage: '',
    primaryMuscles: ['quads', 'glutes', 'hamstrings'],
    equipment: ['barbell', 'dumbbells'],
    steps: [],
    isFeatured: true,
    tags: ['legs'],
  },
  {
    slug: 'hiit-cardio',
    title: 'HIIT Cardio Blast',
    category: 'hiit',
    difficulty: 'beginner',
    description: 'Fast-paced interval session designed to spike heart rate.',
    durationMinutes: 25,
    estimatedCalories: 260,
    badge: 'High Energy',
    bannerImage: '',
    primaryMuscles: ['cardiovascular', 'quads', 'abs'],
    equipment: ['dumbbells', 'mat'],
    steps: [],
    isFeatured: true,
    tags: ['hiit', 'cardio'],
  },
  {
    slug: 'core-and-stability',
    title: 'Core & Stability Flow',
    category: 'core',
    difficulty: 'intermediate',
    description: 'Strengthen deep core stabilizers and lower back support.',
    durationMinutes: 20,
    estimatedCalories: 150,
    badge: 'Core',
    bannerImage: '',
    primaryMuscles: ['abs', 'obliques', 'lower back'],
    equipment: ['ab wheel', 'mat'],
    steps: [],
    isFeatured: false,
    tags: ['core'],
  },
];

export const ExploreScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [workouts, setWorkouts] = useState<IWorkout[]>(FALLBACK_WORKOUTS);
  const [featuredProgram, setFeaturedProgram] = useState<IProgram | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkoutsAndPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const [workoutsRes, programsRes] = await Promise.allSettled([
        workoutService.getWorkouts({
          category: selectedCategory !== 'All' ? selectedCategory.toLowerCase() : undefined,
          search: searchQuery.trim() || undefined,
        }),
        workoutService.getPrograms({ featured: true }),
      ]);

      if (workoutsRes.status === 'fulfilled' && workoutsRes.value.success && workoutsRes.value.data.length > 0) {
        setWorkouts(workoutsRes.value.data);
      } else {
        // Fallback filter
        const filtered = FALLBACK_WORKOUTS.filter((w) => {
          const matchCat = selectedCategory === 'All' || w.category.toLowerCase() === selectedCategory.toLowerCase();
          const matchSearch =
            !searchQuery.trim() ||
            w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.primaryMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchCat && matchSearch;
        });
        setWorkouts(filtered);
      }

      if (programsRes.status === 'fulfilled' && programsRes.value.success && programsRes.value.data.length > 0) {
        setFeaturedProgram(programsRes.value.data[0]);
      }
    } catch {
      // Quietly use fallback on network error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchWorkoutsAndPrograms();
  }, [fetchWorkoutsAndPrograms]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkoutsAndPrograms();
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Find your next session</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <SearchIcon size={16} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts or muscles..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <CloseIcon size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Categories Horizontal Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item: string) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }: { item: string }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                onPress={() => setSelectedCategory(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Workouts & Program Content */}
      <View style={styles.content}>
        {/* Featured Program Banner */}
        <TouchableOpacity
          style={styles.programBanner}
          activeOpacity={0.9}
          onPress={() => {
            const firstWorkoutSlug =
              featuredProgram?.weeks?.[0]?.schedule?.find((s) => !s.isRestDay)?.workoutSlug || 'lower-body-strength';
            navigation.navigate('WorkoutPlayer', {
              workoutSlug: firstWorkoutSlug,
              workoutTitle: featuredProgram?.title || 'Goblet Squat Basics',
              durationMinutes: 35,
            });
          }}
        >
          <View style={styles.bannerTag}>
            <Text style={styles.bannerTagText}>FEATURED PROGRAM</Text>
          </View>
          <Text style={styles.bannerTitle}>
            {featuredProgram?.title || 'Goblet Squat Basics'}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {featuredProgram?.subtitle || `${featuredProgram?.durationWeeks || 4} Weeks · Build foundational strength`}
          </Text>
        </TouchableOpacity>

        {/* Workouts List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionHeader}>Featured Workouts</Text>
          {loading && !refreshing && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        <FlatList
          data={workouts}
          keyExtractor={(item: IWorkout) => item.slug}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.workoutsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <SearchIcon size={36} color={colors.textMuted} style={{ marginBottom: 10 }} />
              <Text style={styles.emptyText}>No workouts match your filter</Text>
            </View>
          }
          renderItem={({ item }: { item: IWorkout }) => {
            const musclesText =
              item.primaryMuscles && item.primaryMuscles.length > 0
                ? item.primaryMuscles.map(capitalize).join(' · ')
                : 'Full Body';
            const count = item.steps?.length || 8;

            return (
              <TouchableOpacity
                style={styles.workoutItem}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('WorkoutPlayer', {
                    workoutSlug: item.slug,
                    workoutTitle: item.title,
                    durationMinutes: item.durationMinutes,
                  })
                }
              >
                <View style={styles.workoutItemLeft}>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>{item.badge || capitalize(item.category)}</Text>
                  </View>
                  <Text style={styles.workoutItemTitle}>{item.title}</Text>
                  <Text style={styles.workoutItemMuscles}>{musclesText}</Text>
                  <View style={styles.workoutItemMetaRow}>
                    <TimeIcon size={13} color={colors.textMuted} style={{ marginRight: 5 }} />
                    <Text style={styles.workoutItemMeta}>
                      {item.durationMinutes} min · {count} exercises · {capitalize(item.difficulty)}
                    </Text>
                  </View>
                </View>
                <View style={styles.workoutItemArrow}>
                  <ArrowRightIcon size={16} color={colors.textPrimary} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
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
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearSearch: {
    fontSize: 14,
    color: colors.textMuted,
    padding: 4,
  },
  categoryContainer: {
    paddingVertical: 10,
  },
  categoryList: {
    paddingHorizontal: spacing.screenPadding,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextSelected: {
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  programBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
  },
  bannerTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  bannerTagText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  workoutsList: {
    paddingBottom: 24,
    gap: 12,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  workoutItemLeft: {
    flex: 1,
    paddingRight: 10,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  workoutItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  workoutItemMuscles: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  workoutItemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutItemMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  workoutItemArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
