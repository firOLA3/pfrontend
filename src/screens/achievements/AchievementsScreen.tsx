import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import {
  achievementService,
  IAchievementsData,
  IBadge,
  IMilestone,
} from '../../services/achievement.service';
import {
  ArrowRightIcon,
  TrophyMenuIcon,
  FlameIcon,
} from '../../components/icons';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Achievements'>;

type TabType = 'Badges' | 'Milestones';

export const AchievementsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('Milestones');
  const [data, setData] = useState<IAchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await achievementService.getAchievements();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch {
      // Quiet fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAchievements();
  };

  const points = data?.points ?? (user?.points || 0);
  const level = data?.level ?? (user?.level || 1);
  const nextLevelPoints = data?.nextLevelPoints ?? (level * 500);
  const levelProgressRatio = Math.min(1, points / Math.max(1, nextLevelPoints));

  const milestones: IMilestone[] = data?.milestones || [];
  const badges: IBadge[] = data?.badges || [];

  const completedCount = data?.completedMilestones ?? milestones.filter((m) => m.completed).length;
  const inProgressCount = data?.inProgressMilestones ?? (milestones.length - completedCount);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
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
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading && !refreshing && !data ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FE2E31" />
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
          {/* Level & Points Banner */}
          <View style={styles.levelCard}>
            <View style={styles.levelRow}>
              <View style={styles.levelBadgeCircle}>
                <Text style={styles.levelNumberText}>L{level}</Text>
              </View>
              <View style={styles.levelTextCol}>
                <Text style={styles.levelTitle}>Level {level} Athlete</Text>
                <Text style={styles.levelSub}>
                  {points.toLocaleString()} / {nextLevelPoints.toLocaleString()} points to Level {level + 1}
                </Text>
              </View>
            </View>
            <View style={styles.levelTrack}>
              <View
                style={[
                  styles.levelFill,
                  { width: `${Math.round(levelProgressRatio * 100)}%` },
                ]}
              />
            </View>
          </View>

          {/* Tab Toggle Row (Figma #2353:1624) */}
          <View style={styles.tabContainer}>
            {(['Badges', 'Milestones'] as TabType[]).map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      isSelected && styles.tabButtonTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Status Subtitle (Figma #2353:1635) */}
          <Text style={styles.subtitle}>
            {completedCount} completed · {inProgressCount} in progress
          </Text>

          {activeTab === 'Milestones' ? (
            /* Milestones List (Figma #2353:1637) */
            <View style={styles.milestonesList}>
              {milestones.map((item) => (
                <View key={item.id} style={styles.milestoneCard}>
                  <View style={styles.milestoneTopRow}>
                    <View
                      style={[
                        styles.milestoneIconCircle,
                        item.completed && styles.milestoneIconCompleted,
                      ]}
                    >
                      {item.id.includes('streak') ? (
                        <FlameIcon size={18} />
                      ) : (
                        <TrophyMenuIcon
                          size={18}
                          color={item.completed ? '#FE2E31' : '#888888'}
                        />
                      )}
                    </View>

                    <View style={styles.milestoneTextCol}>
                      <View style={styles.milestoneTitleRow}>
                        <Text style={styles.milestoneTitle}>{item.title}</Text>
                        <Text style={styles.progressFraction}>
                          {item.current.toLocaleString()} / {item.target.toLocaleString()}{' '}
                          {item.unit || ''}
                        </Text>
                      </View>

                      {/* Progress Track */}
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.round((item.progressRatio || 0) * 100)}%` },
                            item.completed && styles.progressFillDone,
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            /* Badges 3x3 Grid */
            <View style={styles.badgeGrid}>
              {badges.map((b) => (
                <View
                  key={b.id}
                  style={[
                    styles.badgeCard,
                    b.unlocked ? styles.badgeUnlocked : styles.badgeLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.badgeCircle,
                      b.unlocked ? styles.badgeCircleUnlocked : styles.badgeCircleLocked,
                    ]}
                  >
                    <TrophyMenuIcon
                      size={24}
                      color={b.unlocked ? '#FE2E31' : '#AAAAAA'}
                    />
                  </View>
                  <Text style={styles.badgeName}>{b.title}</Text>
                  <Text style={styles.badgeDesc} numberOfLines={2}>
                    {b.description}
                  </Text>
                  {b.unlocked && (
                    <Text style={styles.unlockedDate}>Unlocked</Text>
                  )}
                </View>
              ))}
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  levelCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.22)',
    padding: 16,
    marginBottom: 20,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FE2E31',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelNumberText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelTextCol: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 2,
  },
  levelSub: {
    fontSize: 12,
    color: '#666666',
  },
  levelTrack: {
    height: 6,
    backgroundColor: 'rgba(254, 46, 49, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    backgroundColor: '#FE2E31',
    borderRadius: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  tabButtonTextActive: {
    color: '#111111',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 16,
  },
  milestonesList: {
    gap: 14,
  },
  milestoneCard: {
    backgroundColor: '#FFFBFB',
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.16)',
    padding: 14,
  },
  milestoneTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneIconCompleted: {
    backgroundColor: '#FFF0F0',
  },
  milestoneTextCol: {
    flex: 1,
  },
  milestoneTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  progressFraction: {
    fontSize: 11,
    fontWeight: '500',
    color: '#777777',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FE2E31',
    borderRadius: 3,
  },
  progressFillDone: {
    backgroundColor: '#36C25F',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '30.5%',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 0.8,
  },
  badgeUnlocked: {
    backgroundColor: '#FFF5F5',
    borderColor: 'rgba(254, 46, 49, 0.22)',
  },
  badgeLocked: {
    backgroundColor: '#F9F9F9',
    borderColor: '#EEEEEE',
    opacity: 0.65,
  },
  badgeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeCircleUnlocked: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#FE2E31',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeCircleLocked: {
    backgroundColor: '#EAEAEA',
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 3,
  },
  badgeDesc: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 12,
    marginBottom: 4,
  },
  unlockedDate: {
    fontSize: 9,
    fontWeight: '600',
    color: '#2E7D32',
  },
});
