import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  FlameIcon,
  BookmarkIcon,
  ArrowRightIcon,
} from '../../components/icons';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Explore'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CATEGORIES = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Core'];

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
    title: 'HIIT Cardio',
    category: 'hiit',
    difficulty: 'intermediate',
    description: 'Fast-paced interval session designed to spike heart rate.',
    durationMinutes: 30,
    estimatedCalories: 300,
    badge: 'High Energy',
    bannerImage: '',
    primaryMuscles: ['cardiovascular', 'quads', 'abs'],
    equipment: ['dumbbells', 'mat'],
    steps: [],
    isFeatured: true,
    tags: ['hiit', 'cardio'],
  },
  {
    slug: 'morning-yoga-flow',
    title: 'Morning Yoga Flow',
    category: 'yoga',
    difficulty: 'beginner',
    description: 'Gentle opening flow for morning mobility and breathing.',
    durationMinutes: 25,
    estimatedCalories: 180,
    badge: 'Yoga',
    bannerImage: '',
    primaryMuscles: ['hamstrings', 'shoulders', 'spine'],
    equipment: ['mat'],
    steps: [],
    isFeatured: true,
    tags: ['yoga', 'flexibility'],
  },
  {
    slug: 'core-and-stability',
    title: 'Core & Stability',
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
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkoutsAndPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const [workoutsRes, programsRes, savedRes] = await Promise.allSettled([
        workoutService.getWorkouts({
          category: selectedCategory !== 'All' ? selectedCategory.toLowerCase() : undefined,
          search: searchQuery.trim() || undefined,
        }),
        workoutService.getPrograms({ featured: true }),
        workoutService.getSavedWorkouts(),
      ]);

      if (workoutsRes.status === 'fulfilled' && workoutsRes.value.success && workoutsRes.value.data.length > 0) {
        setWorkouts(workoutsRes.value.data);
      } else {
        // Fallback filter
        const filtered = FALLBACK_WORKOUTS.filter((w) => {
          const matchCat =
            selectedCategory === 'All' ||
            w.category.toLowerCase() === selectedCategory.toLowerCase();
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

      if (savedRes.status === 'fulfilled' && savedRes.value.success && Array.isArray(savedRes.value.data)) {
        setSavedSlugs(savedRes.value.data.map((w) => w.slug));
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

  const toggleSave = async (slug: string) => {
    const isSaved = savedSlugs.includes(slug);
    const nextSaved = isSaved ? savedSlugs.filter((s) => s !== slug) : [...savedSlugs, slug];
    setSavedSlugs(nextSaved); // Optimistic update

    try {
      if (isSaved) {
        await workoutService.unsaveWorkout(slug);
      } else {
        await workoutService.saveWorkout(slug);
      }
    } catch {
      // Revert if API fails
      setSavedSlugs(savedSlugs);
      Alert.alert('Notice', 'Could not update saved status.');
    }
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header (Figma #2333:736) */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>

        {/* Search Bar (Figma #2333:748) */}
        <View style={styles.searchBar}>
          <SearchIcon size={18} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts"
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <CloseIcon size={16} color="#999999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Categories Horizontal Pills (Figma #2333:783) */}
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

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Featured Program Banner (Figma #2333:786 - 798) */}
        <TouchableOpacity
          style={styles.programBanner}
          activeOpacity={0.9}
          onPress={() => {
            navigation.navigate('ProgramPreview', {
              programSlug: featuredProgram?.slug || 'core-starter',
              programTitle: featuredProgram?.title || 'Core Starter',
            });
          }}
        >
          <View style={styles.bannerTag}>
            <Text style={styles.bannerTagText}>PROGRAM · 4 WEEKS</Text>
          </View>
          <Text style={styles.bannerTitle}>
            {featuredProgram?.title || 'Core Starter'}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {featuredProgram?.description ||
              'Build a strong base with 4 short workouts a week. Beginner friendly.'}
          </Text>

          <View style={styles.bannerButtonRow}>
            <View style={styles.viewProgramButton}>
              <Text style={styles.viewProgramButtonText}>View program</Text>
              <ArrowRightIcon size={14} color="#111111" style={{ marginLeft: 6 }} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Section Header: Workouts for you (Figma #2333:801) */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionHeader}>Workouts for you</Text>
          {loading && !refreshing && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {/* Workouts List */}
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
              <Text style={styles.emptyText}>No workouts match your search</Text>
            </View>
          }
          renderItem={({ item }: { item: IWorkout }) => {
            const isSaved = savedSlugs.includes(item.slug);

            return (
              <TouchableOpacity
                style={styles.workoutCard}
                activeOpacity={0.88}
                onPress={() =>
                  navigation.navigate('WorkoutPreview', {
                    workoutSlug: item.slug,
                    workoutTitle: item.title,
                  })
                }
              >
                <View style={styles.cardThumbnail}>
                  <FlameIcon size={24} />
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.workoutTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.workoutMeta}>
                    {item.durationMinutes} min · {capitalize(item.difficulty)}
                  </Text>
                  <View style={styles.calorieRow}>
                    <FlameIcon size={12} style={{ marginRight: 4 }} />
                    <Text style={styles.calorieText}>{item.estimatedCalories} kcal</Text>
                  </View>
                </View>

                {/* Bookmark Toggle Action */}
                <TouchableOpacity
                  style={styles.bookmarkButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    toggleSave(item.slug);
                  }}
                >
                  <BookmarkIcon
                    size={22}
                    color={isSaved ? '#FE2E31' : '#999999'}
                    filled={isSaved}
                  />
                </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111111',
  },
  categoryContainer: {
    paddingVertical: 10,
  },
  categoryList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  categoryChipSelected: {
    backgroundColor: '#FE2E31',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  programBanner: {
    backgroundColor: '#1A1A1A',
    borderRadius: 22,
    padding: 20,
    marginVertical: 12,
  },
  bannerTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  bannerTagText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#CCCCCC',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  bannerButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewProgramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewProgramButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  workoutsList: {
    paddingBottom: 28,
    gap: 12,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBFB',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F5ECEC',
  },
  cardThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FE2E31',
  },
  bookmarkButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
  },
});
