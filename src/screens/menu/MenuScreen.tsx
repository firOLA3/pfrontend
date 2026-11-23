import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import {
  CloseIcon,
  FlameIcon,
  PlanIcon,
  BookmarkIcon,
  TrophyMenuIcon,
  FlagChallengeIcon,
  DevicesIcon,
  InviteFriendsIcon,
  InfoCircleIcon,
  GearSettingsIcon,
  HelpCircleIcon,
  LogoutIcon,
  ArrowRightIcon,
} from '../../components/icons';
import { colors } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Menu'>;

export const MenuScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const displayName = user?.name || 'Kaysolo';
  const initial = displayName.charAt(0).toUpperCase();
  const username = user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : 'kaysolo58';
  const streakDays = (user as any)?.stats?.streakDays || 12;

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of PulseFit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleItemPress = (key: string) => {
    switch (key) {
      case 'plan':
        navigation.navigate('MyPlan');
        break;
      case 'saved':
        navigation.navigate('SavedWorkouts');
        break;
      case 'achievements':
        navigation.navigate('Achievements');
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'about':
        Alert.alert(
          'About PulseFit',
          'PulseFit v1.0.0\nTrain smarter with personalized plans, adaptive progression, and full-fidelity workouts.'
        );
        break;
      case 'connected-devices':
        Alert.alert(
          'Connected Devices',
          'Apple Health and device synchronization is enabled for automatic workout recording.'
        );
        break;
      case 'invite-friends':
        Alert.alert(
          'Invite Friends',
          'Share PulseFit with your workout buddies! Link copied to clipboard.'
        );
        break;
      case 'help':
        Alert.alert(
          'Help & Support',
          'Reach out anytime to support@pulsefit.app for questions, feedback, or coaching inquiries.'
        );
        break;
      default:
        // Feedback alert for future sub-screens
        Alert.alert(
          key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' '),
          'This section is coming soon in your next update!'
        );
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Close Button */}
      <View style={styles.header}>
        <Text style={styles.menuHeaderTitle}>Menu</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <CloseIcon size={24} color="#111111" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card (Figma #2425:1241) */}
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.8}
          onPress={() => {
            navigation.navigate('EditProfile');
          }}
        >
          {/* Avatar with initial */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>

          {/* User Details */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileHandle}>
              @{username} · Level 3
            </Text>
            <View style={styles.streakBadge}>
              <FlameIcon size={14} style={{ marginRight: 4 }} />
              <Text style={styles.streakText}>{streakDays} day streak</Text>
            </View>
          </View>

          <ArrowRightIcon size={16} color="#999999" />
        </TouchableOpacity>

        {/* Section 1: Main Navigation Items (Figma #2425:1255) */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleItemPress('plan')}
          >
            <View style={styles.menuItemLeft}>
              <PlanIcon size={22} color="#111111" />
              <Text style={styles.menuItemText}>My plan</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleItemPress('saved')}
          >
            <View style={styles.menuItemLeft}>
              <BookmarkIcon size={22} color="#111111" />
              <Text style={styles.menuItemText}>Saved workouts</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleItemPress('achievements')}
          >
            <View style={styles.menuItemLeft}>
              <TrophyMenuIcon size={22} color="#111111" />
              <Text style={styles.menuItemText}>Achievements</Text>
            </View>
            <Text style={styles.badgeCountText}>12 badges</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleItemPress('challenges')}
          >
            <View style={styles.menuItemLeft}>
              <FlagChallengeIcon size={22} color="#111111" />
              <Text style={styles.menuItemText}>Challenges</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleItemPress('connected-devices')}
          >
            <View style={styles.menuItemLeft}>
              <DevicesIcon size={22} color="#111111" />
              <Text style={styles.menuItemText}>Connected devices</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleItemPress('invite-friends')}
          >
            <View style={styles.menuItemLeft}>
              <InviteFriendsIcon size={22} color="#111111" />
              <Text style={styles.menuItemText}>Invite friends</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Divider (Figma #2425:1312) */}
        <View style={styles.divider} />

        {/* Section 2: Preferences & Support (Figma #2425:1311) */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleItemPress('about')}
          >
            <View style={styles.menuItemLeft}>
              <InfoCircleIcon size={22} color="#111111" />
              <Text style={styles.menuItemText}>About</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleItemPress('settings')}
          >
            <View style={styles.menuItemLeft}>
              <GearSettingsIcon size={22} color="#111111" />
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleItemPress('help')}
          >
            <View style={styles.menuItemLeft}>
              <HelpCircleIcon size={22} color="#111111" />
              <Text style={styles.menuItemText}>Help and support</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { marginTop: 4 }]}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <LogoutIcon size={22} color="#FE2E31" />
              <Text style={[styles.menuItemText, { color: '#FE2E31' }]}>Log out</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Version info footer */}
        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>PulseFit v1.0.0 (Build 42)</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  menuHeaderTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111111',
  },
  closeButton: {
    padding: 6,
    marginRight: -6,
    borderRadius: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // User Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFBFB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(254, 46, 49, 0.15)',
    marginBottom: 26,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FE2E31',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FE2E31',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 2,
  },
  profileHandle: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FE2E31',
  },

  // Menu Sections
  menuSection: {
    gap: 22,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111111',
  },
  badgeCountText: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '400',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 24,
  },

  versionFooter: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#AAAAAA',
  },
});
