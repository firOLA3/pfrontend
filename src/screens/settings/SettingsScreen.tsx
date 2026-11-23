import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { ArrowRightIcon, CloseIcon } from '../../components/icons';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, deleteAccount } = useAuth();

  const [workoutReminders, setWorkoutReminders] = useState<boolean>(true);
  const [streakAlerts, setStreakAlerts] = useState<boolean>(true);
  const [challengeUpdates, setChallengeUpdates] = useState<boolean>(false);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
      ]
    );
  };

  const handleConfirmDelete = async () => {
    if (deleteInputText.trim() !== 'DELETE') {
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ArrowRightIcon size={20} color="#111111" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Notifications (Figma #2420:1006) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.card}>
            {/* Row 1 */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <Text style={styles.rowTitle}>Workout reminders</Text>
                <Text style={styles.rowSubtitle}>Before your scheduled workouts</Text>
              </View>
              <Switch
                value={workoutReminders}
                onValueChange={setWorkoutReminders}
                trackColor={{ false: '#E0E0E0', true: '#FE2E31' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Row 2 */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <Text style={styles.rowTitle}>Streak alerts</Text>
                <Text style={styles.rowSubtitle}>Daily reminders to protect your streak</Text>
              </View>
              <Switch
                value={streakAlerts}
                onValueChange={setStreakAlerts}
                trackColor={{ false: '#E0E0E0', true: '#FE2E31' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            {/* Row 3 */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <Text style={styles.rowTitle}>Community challenges</Text>
                <Text style={styles.rowSubtitle}>Updates on new challenges & milestones</Text>
              </View>
              <Switch
                value={challengeUpdates}
                onValueChange={setChallengeUpdates}
                trackColor={{ false: '#E0E0E0', true: '#FE2E31' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section 2: Units & Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextCol}>
                <Text style={styles.rowTitle}>Measurement Units</Text>
                <Text style={styles.rowSubtitle}>
                  {units === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, in)'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.unitToggleBtn}
                onPress={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
                activeOpacity={0.8}
              >
                <Text style={styles.unitToggleText}>
                  {units === 'metric' ? 'KG / CM' : 'LBS / IN'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section 3: Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}
            >
              <Text style={styles.rowTitle}>Edit Profile Information</Text>
              <ArrowRightIcon size={18} color="#999999" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={[styles.rowTitle, { color: '#FE2E31' }]}>Log Out</Text>
              <ArrowRightIcon size={18} color="#FE2E31" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone: Delete Account (Figma #2420:1296) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#D32F2F' }]}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteCardBtn}
            onPress={() => {
              setDeleteInputText('');
              setDeleteModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteCardBtnText}>Delete Account</Text>
            <Text style={styles.deleteCardBtnSub}>
              Permanently remove your profile and all workout history
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Account Modal (Figma #2420:1296) */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setDeleteModalVisible(false)}
              activeOpacity={0.7}
            >
              <CloseIcon size={20} color="#111111" />
            </TouchableOpacity>

            {/* Red Warning Circle */}
            <View style={styles.warningCircle}>
              <Text style={styles.warningExclamation}>!</Text>
            </View>

            {/* Modal Title & Body (Figma #2420:1329) */}
            <Text style={styles.modalTitle}>Delete your account?</Text>
            <Text style={styles.modalDescription}>
              This permanently removes your profile, workout history, streaks, badges and posts.
              You cannot undo this action.
            </Text>

            {/* Input Label (Figma #2420:1337) */}
            <Text style={styles.confirmLabel}>Type DELETE to confirm</Text>
            <TextInput
              style={styles.confirmInput}
              value={deleteInputText}
              onChangeText={setDeleteInputText}
              placeholder="DELETE"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <Text style={styles.subNote}>
              If you subscribed, cancel in your Apple ID settings first.
            </Text>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmDeleteBtn,
                deleteInputText.trim() !== 'DELETE' && styles.confirmDeleteBtnDisabled,
              ]}
              onPress={handleConfirmDelete}
              disabled={deleteInputText.trim() !== 'DELETE' || isDeleting}
              activeOpacity={0.88}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmDeleteBtnText}>Permanently delete account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setDeleteModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Keep my account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFBFB',
    borderRadius: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.16)',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111111',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#777777',
  },
  divider: {
    height: 0.8,
    backgroundColor: '#F0F0F0',
  },
  unitToggleBtn: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(254, 46, 49, 0.25)',
  },
  unitToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FE2E31',
  },
  deleteCardBtn: {
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.3)',
    padding: 16,
  },
  deleteCardBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 4,
  },
  deleteCardBtnSub: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: 'center',
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
  },
  warningCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#FE2E31',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningExclamation: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FE2E31',
    lineHeight: 36,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  confirmInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 10,
    letterSpacing: 1,
  },
  subNote: {
    fontSize: 11,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmDeleteBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#FE2E31',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmDeleteBtnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmDeleteBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
});
