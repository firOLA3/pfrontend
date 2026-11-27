import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../theme';
import { UserAvatar } from '../../components/common/UserAvatar';
import { ArrowRightIcon } from '../../components/icons';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, deleteAccount } = useAuth();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      Alert.alert('Confirmation required', 'You must type DELETE in all caps to confirm.');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAccount('DELETE');
      setDeleteModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* User Card */}
        <TouchableOpacity
          style={styles.userCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <UserAvatar avatarUrl={user?.avatarUrl} name={user?.name} size={60} variant="primary" />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'PulseFit Member'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Level 1 · Free Tier</Text>
            </View>
          </View>
          <ArrowRightIcon size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Settings & Menu List */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeading}>Preferences</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.menuItemLabel}>Notifications & Reminders</Text>
            <ArrowRightIcon size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ConnectedDevices')}
          >
            <Text style={styles.menuItemLabel}>Connected Devices (Apple Health)</Text>
            <ArrowRightIcon size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert('Appearance', 'PulseFit uses modern Light mode by default.')
            }
          >
            <Text style={styles.menuItemLabel}>Appearance (Light Mode)</Text>
            <ArrowRightIcon size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionHeading}>Support & Legal</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(
                'Help & Support',
                'Need assistance with your workouts or account? Email support@pulsefit.app'
              )
            }
          >
            <Text style={styles.menuItemLabel}>Help & Support</Text>
            <ArrowRightIcon size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemLabel}>Terms of Service</Text>
            <ArrowRightIcon size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemLabel}>Privacy Policy</Text>
            <ArrowRightIcon size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setLogoutModalVisible(true)}
          >
            <Text style={[styles.menuItemLabel, { color: colors.textPrimary }]}>Log Out</Text>
            <ArrowRightIcon size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text style={[styles.menuItemLabel, { color: colors.error }]}>Delete Account</Text>
            <ArrowRightIcon size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal (Figma #2423:392) */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log out?</Text>
            <Text style={styles.modalSubtitle}>
              You can sign back in any time. Your workouts and progress stay saved.
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleLogout}>
                <Text style={styles.modalConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal (Figma #2420:1296 - "type DELETE") */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: colors.error }]}>Delete your account?</Text>
            <Text style={styles.modalSubtitle}>
              This permanently removes your profile, workout history, and saved plans. You cannot undo this.
            </Text>

            <Text style={styles.deletePrompt}>Type DELETE to confirm:</Text>
            <TextInput
              style={styles.deleteInput}
              placeholder="DELETE"
              placeholderTextColor={colors.textMuted}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              autoCapitalize="characters"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeleteConfirmText('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: colors.error },
                  deleteConfirmText !== 'DELETE' && { opacity: 0.5 },
                ]}
                onPress={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              >
                <Text style={styles.modalConfirmText}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Text>
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
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    gap: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDark,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 12,
    gap: 4,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  menuItemArrow: {
    fontSize: 20,
    color: colors.textMuted,
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
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  deletePrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  deleteInput: {
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});

