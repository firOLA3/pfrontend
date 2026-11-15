import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { notificationService } from '../../services/notification.service';
import { INotification } from '../../types/notification.types';
import { BackArrowIcon, NotificationCategoryBadge, BellIcon } from '../../components/icons';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch {
      // Fallback: If network fails, use default design mockup notifications
      if (notifications.length === 0) {
        setNotifications([
          {
            _id: '1',
            userId: 'me',
            type: 'workout_reminder',
            title: 'Time for Full Body Burn',
            message: 'Your 7:00 AM workout is ready. 45 min · 320 kcal',
            timestampText: '7:00 AM',
            read: false,
            section: 'Today',
            data: { workoutSlug: 'full-body-burn' },
            createdAt: new Date().toISOString(),
          },
          {
            _id: '2',
            userId: 'me',
            type: 'badge_unlocked',
            title: 'New badge unlocked',
            message: 'You earned 7-Day Streak. Keep it up!',
            timestampText: '2h ago',
            read: false,
            section: 'Today',
            data: { badgeId: '7-day-streak' },
            createdAt: new Date().toISOString(),
          },
          {
            _id: '3',
            userId: 'me',
            type: 'challenge',
            title: 'SarahFit joined your challenge',
            message: '30-Day Pushup Challenge',
            timestampText: '4h ago',
            read: true,
            section: 'Today',
            data: { challengeId: 'pushup-30' },
            createdAt: new Date().toISOString(),
          },
          {
            _id: '4',
            userId: 'me',
            type: 'goal_progress',
            title: 'You’re 2 workouts away',
            message: 'Finish them to hit this week’s goal.',
            timestampText: 'Yesterday',
            read: true,
            section: 'Earlier',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '5',
            userId: 'me',
            type: 'social_like',
            title: 'Mike_Trainer liked your post',
            message: 'Small progress is still progress.',
            timestampText: '2d ago',
            read: true,
            section: 'Earlier',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '6',
            userId: 'me',
            type: 'weekly_summary',
            title: 'Your weekly summary is ready',
            message: '5 workouts and 3,400 kcal burned.',
            timestampText: 'Mon',
            read: true,
            section: 'Earlier',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [notifications.length]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await notificationService.markAllRead();
    } catch {
      // Silent error fallback
    }
  };

  const handleNotificationPress = (item: INotification) => {
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
      );
      notificationService.markAsRead(item._id).catch(() => {});
    }

    // Action navigation
    if (item.data?.workoutSlug) {
      navigation.navigate('WorkoutPlayer', {
        workoutSlug: item.data.workoutSlug,
        workoutTitle: item.title,
      });
    }
  };

  const todayItems = notifications.filter(
    (n) => n.section === 'Today' || (!n.section && n.timestampText.includes('AM'))
  );
  const earlierItems = notifications.filter(
    (n) => n.section === 'Earlier' || (!n.section && !n.timestampText.includes('AM'))
  );

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header Bar (Figma #2425:872) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <BackArrowIcon size={24} color="#111111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {hasUnread && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <BellIcon size={36} color="#999999" />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>
            We’ll keep you posted on your workout reminders, badges, and weekly summaries here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Section 1: Today */}
          {todayItems.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Today</Text>
              <View style={styles.itemsCard}>
                {todayItems.map((item, idx) => (
                  <View key={item._id || idx}>
                    <TouchableOpacity
                      style={styles.itemRow}
                      activeOpacity={0.8}
                      onPress={() => handleNotificationPress(item)}
                    >
                      {/* Left Badge Icon */}
                      <NotificationCategoryBadge type={item.type} size={46} />

                      {/* Content Column */}
                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemMessage} numberOfLines={2}>
                          {item.message}
                        </Text>
                        <Text style={styles.itemTimestamp}>{item.timestampText}</Text>
                      </View>

                      {/* Unread Red Dot (Figma #2425:907 dt1, dt2) */}
                      {!item.read && <View style={styles.unreadDot} />}
                    </TouchableOpacity>

                    {/* Divider Line */}
                    {idx < todayItems.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Section 2: Earlier */}
          {earlierItems.length > 0 && (
            <View style={[styles.sectionBlock, { marginTop: 22 }]}>
              <Text style={styles.sectionTitle}>Earlier</Text>
              <View style={styles.itemsCard}>
                {earlierItems.map((item, idx) => (
                  <View key={item._id || idx}>
                    <TouchableOpacity
                      style={styles.itemRow}
                      activeOpacity={0.8}
                      onPress={() => handleNotificationPress(item)}
                    >
                      {/* Left Badge Icon */}
                      <NotificationCategoryBadge type={item.type} size={46} />

                      {/* Content Column */}
                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemMessage} numberOfLines={2}>
                          {item.message}
                        </Text>
                        <Text style={styles.itemTimestamp}>{item.timestampText}</Text>
                      </View>

                      {/* Unread Red Dot */}
                      {!item.read && <View style={styles.unreadDot} />}
                    </TouchableOpacity>

                    {/* Divider Line */}
                    {idx < earlierItems.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
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
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#111111',
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  markAllText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#D4161A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  sectionBlock: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111111',
    marginBottom: 12,
  },
  itemsCard: {
    width: '100%',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  itemContent: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 10,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111111',
    marginBottom: 3,
  },
  itemMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: '#5C5C5C',
    lineHeight: 19,
    marginBottom: 4,
  },
  itemTimestamp: {
    fontSize: 13,
    fontWeight: '400',
    color: '#5C5C5C',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FE2E31',
    marginLeft: 8,
  },
  divider: {
    height: 0.8,
    backgroundColor: '#F0F0F0',
    width: '100%',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 21,
  },
});

