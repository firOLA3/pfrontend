import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { workoutService } from '../../services/workout.service';
import { IWorkout } from '../../types/workout.types';
import { colors } from '../../theme';
import {
  BackArrowIcon,
  BookmarkIcon,
  FlameIcon,
  TimeIcon,
} from '../../components/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedWorkouts'>;

export const SavedWorkoutsScreen: React.FC<Props> = ({ navigation }) => {
  const [savedWorkouts, setSavedWorkouts] = useState<IWorkout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchSavedWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await workoutService.getSavedWorkouts();
      if (res.success && Array.isArray(res.data)) {
        setSavedWorkouts(res.data);
      }
    } catch {
      // Quiet fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedWorkouts();
  }, [fetchSavedWorkouts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedWorkouts();
  };

  const handleUnsave = async (workout: IWorkout) => {
    const originalList = [...savedWorkouts];
    // Optimistic removal
    setSavedWorkouts((prev) => prev.filter((w) => w.slug !== workout.slug));

    try {
      await workoutService.unsaveWorkout(workout.slug);
    } catch {
      // Revert if API fails
      setSavedWorkouts(originalList);
      Alert.alert('Notice', 'Could not remove workout from saved. Please try again.');
    }
  };

  const handleWorkoutPress = (workout: IWorkout) => {
    navigation.navigate('WorkoutPreview', {
      workoutSlug: workout.slug,
      workoutTitle: workout.title,
    });
  };

  const capitalize = (str?: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const renderWorkoutItem = ({ item }: { item: IWorkout }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => handleWorkoutPress(item)}
    >
      {/* Category / Icon Block */}
      <View style={styles.thumbnail}>
        <FlameIcon size={24} />
      </View>

      {/* Info Block (Figma #2342:1303) */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardSubtitle}>
          {item.durationMinutes} min · {capitalize(item.difficulty)} · {item.estimatedCalories} kcal
        </Text>
      </View>

      {/* Bookmark Action (Figma #2342:1308) */}
      <TouchableOpacity
        style={styles.bookmarkAction}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.7}
        onPress={() => handleUnsave(item)}
      >
        <BookmarkIcon size={22} color="#FE2E31" filled={true} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyOrFooter = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Find more to save</Text>
        <Text style={styles.emptySubtitle}>
          Tap the bookmark on any workout to keep it here.
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          activeOpacity={0.8}
          onPress={() => {
            navigation.navigate('Main' as any);
          }}
        >
          <Text style={styles.browseButtonText}>Browse Explore</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header (Figma #2392:3911 & #2342:1274) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <BackArrowIcon size={24} color="#111111" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Saved</Text>
          <Text style={styles.headerSubtitle}>
            {savedWorkouts.length} {savedWorkouts.length === 1 ? 'saved workout' : 'saved workouts'}
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={savedWorkouts}
          keyExtractor={(item) => item.slug}
          renderItem={renderWorkoutItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={renderEmptyOrFooter}
        />
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  loaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBFB',
    borderWidth: 1,
    borderColor: '#F5ECEC',
    borderRadius: 18,
    padding: 14,
  },
  thumbnail: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666666',
  },
  bookmarkAction: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    marginTop: 24,
  },
  emptyCard: {
    backgroundColor: '#FFFBFB',
    borderWidth: 1,
    borderColor: '#F5ECEC',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  browseButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  browseButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FE2E31',
  },
});
