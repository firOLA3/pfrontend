import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { workoutService, ISessionRecord } from '../../services/workout.service';
import { colors } from '../../theme';
import {
  BackArrowIcon,
  FlameIcon,
  ProgressTabIcon,
  ArrowRightIcon,
} from '../../components/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutHistory'>;

interface MonthSection {
  title: string;
  data: ISessionRecord[];
}

export const WorkoutHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [sections, setSections] = useState<MonthSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await workoutService.getSessions(1, 50);
      if (res.success && Array.isArray(res.data)) {
        setTotalCount(res.total || res.data.length);

        // Group by Month Year (e.g., "November 2026")
        const groupMap: { [key: string]: ISessionRecord[] } = {};
        for (const session of res.data) {
          const date = new Date(session.completedAt || Date.now());
          const monthYear = date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          });

          if (!groupMap[monthYear]) {
            groupMap[monthYear] = [];
          }
          groupMap[monthYear].push(session);
        }

        const sectionArray: MonthSection[] = Object.keys(groupMap).map((monthYear) => ({
          title: monthYear,
          data: groupMap[monthYear],
        }));

        setSections(sectionArray);
      }
    } catch {
      // Quiet fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatSessionDate = (dateString?: string, durationSeconds: number = 0) => {
    const date = new Date(dateString || Date.now());
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
    const mins = Math.max(1, Math.round(durationSeconds / 60));

    return `${dayName} ${dayNum} ${monthShort} · ${mins} min`;
  };

  const handleSessionPress = (session: ISessionRecord) => {
    navigation.navigate('WorkoutPreview', {
      workoutSlug: session.workoutSlug,
      workoutTitle: session.workoutTitle,
    });
  };

  const renderSectionHeader = ({ section: { title } }: { section: MonthSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderSessionItem = ({ item }: { item: ISessionRecord }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => handleSessionPress(item)}
    >
      <View style={styles.cardThumbnail}>
        <FlameIcon size={22} />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.workoutTitle} numberOfLines={1}>
          {item.workoutTitle}
        </Text>
        <Text style={styles.workoutSubtitle}>
          {formatSessionDate(item.completedAt, item.durationSeconds)}
        </Text>
      </View>

      <View style={styles.calorieBadge}>
        <Text style={styles.calorieText}>{item.caloriesBurned} kcal</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
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
        activeOpacity={0.88}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.emptyCtaText}>Start your first workout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header (Figma #2353:1810) */}
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
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <BackArrowIcon size={24} color="#111111" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Workout history</Text>
          {totalCount > 0 ? (
            <Text style={styles.headerSubtitle}>
              {totalCount} {totalCount === 1 ? 'workout' : 'workouts'} logged
            </Text>
          ) : null}
        </View>

        <View style={{ width: 38 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.clientSessionId || item._id}
          renderItem={renderSessionItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          stickySectionHeadersEnabled={false}
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
    paddingTop: 10,
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  sectionHeaderText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBFB',
    borderWidth: 1,
    borderColor: '#F5ECEC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardThumbnail: {
    width: 48,
    height: 48,
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
  workoutSubtitle: {
    fontSize: 13,
    color: '#666666',
  },
  calorieBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
  },
  calorieText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FE2E31',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
});
