import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types/navigation.types';
import { colors, spacing } from '../../theme';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Schedule'>;

const DAYS = [
  { key: 'Mon', label: 'Mon' },
  { key: 'Tue', label: 'Tue' },
  { key: 'Wed', label: 'Wed' },
  { key: 'Thu', label: 'Thu' },
  { key: 'Fri', label: 'Fri' },
  { key: 'Sat', label: 'Sat' },
  { key: 'Sun', label: 'Sun' },
];

const HOURS = ['05', '06', '07', '08', '09', '10', '11', '12', '01', '02', '03', '04'];
const MINUTES = ['00', '15', '30', '45'];
const QUICK_TIMES = [
  '06:00 AM',
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
];

export const ScheduleScreen: React.FC<Props> = ({ navigation }) => {
  const { updateUser } = useAuth();
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [preferredTime, setPreferredTime] = useState('07:00 AM');
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  // Time Picker Modal State
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState('07');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  const openTimeModal = () => {
    const match = preferredTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      setSelectedHour(match[1].padStart(2, '0'));
      setSelectedMinute(match[2]);
      setSelectedPeriod(match[3].toUpperCase() as 'AM' | 'PM');
    }
    setShowTimeModal(true);
  };

  const handleQuickSelect = (time: string) => {
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      setSelectedHour(match[1].padStart(2, '0'));
      setSelectedMinute(match[2]);
      setSelectedPeriod(match[3].toUpperCase() as 'AM' | 'PM');
    }
  };

  const confirmTime = () => {
    setPreferredTime(`${selectedHour}:${selectedMinute} ${selectedPeriod}`);
    setShowTimeModal(false);
  };

  const toggleDay = (key: string) => {
    setSelectedDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const handleContinue = () => {
    userService
      .updateOnboarding({
        step: 4,
        weeklyDays: selectedDays,
        preferredTime,
        remindersEnabled,
      })
      .then((res) => {
        if (res.data) updateUser(res.data);
      })
      .catch(() => {});
    navigation.navigate('AboutYou');
  };

  const handleSkip = () => {
    userService
      .updateOnboarding({ step: 4 })
      .then((res) => {
        if (res.data) updateUser(res.data);
      })
      .catch(() => {});
    navigation.navigate('AboutYou');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        {/* Progress: Step 3 of 5 */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '60%' }]} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Set your{'\n'}weekly workout</Text>
          <Text style={styles.subtitle}>Choose the days you want to workout</Text>
        </View>

        {/* Days of the Week Selection Card (Figma style) */}
        <View style={styles.daysCard}>
          <Text style={styles.sectionLabel}>Days of Week</Text>
          <View style={styles.daysRow}>
            {DAYS.map((day) => {
              const isSelected = selectedDays.includes(day.key);
              return (
                <TouchableOpacity
                  key={day.key}
                  style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                  onPress={() => toggleDay(day.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {day.label}
                  </Text>
                  {isSelected && <Text style={styles.dayDot}>•</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferred Time Card */}
        <View style={styles.timeCard}>
          <View>
            <Text style={styles.cardHeaderTitle}>Preferred Time</Text>
            <Text style={styles.cardHeaderSubtitle}>We’ll schedule workouts at this time</Text>
          </View>
          <TouchableOpacity
            style={styles.timePill}
            activeOpacity={0.8}
            onPress={openTimeModal}
          >
            <Text style={styles.timePillText}>{preferredTime}</Text>
          </TouchableOpacity>
        </View>

        {/* Reminders Toggle Card (Figma #2170:1260) */}
        <View style={styles.toggleCard}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.cardHeaderTitle}>Reminders</Text>
            <Text style={styles.cardHeaderSubtitle}>
              We’ll remind you before your workout starts
            </Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={setRemindersEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTimeModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Preferred Time</Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <Text style={styles.modalSubtitle}>Popular Workout Times</Text>
            <View style={styles.quickTimesGrid}>
              {QUICK_TIMES.map((time) => {
                const isSelected =
                  `${selectedHour}:${selectedMinute} ${selectedPeriod}` === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.quickTimeChip,
                      isSelected && styles.quickTimeChipSelected,
                    ]}
                    onPress={() => handleQuickSelect(time)}
                  >
                    <Text
                      style={[
                        styles.quickTimeText,
                        isSelected && styles.quickTimeTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Time Selectors */}
            <Text style={[styles.modalSubtitle, { marginTop: 16 }]}>Or Customize</Text>
            <View style={styles.pickerRow}>
              {/* Hour Scroll / Pills */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColLabel}>Hour</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pickerPillsRow}
                >
                  {HOURS.map((hr) => (
                    <TouchableOpacity
                      key={hr}
                      style={[
                        styles.timeUnitChip,
                        selectedHour === hr && styles.timeUnitChipSelected,
                      ]}
                      onPress={() => setSelectedHour(hr)}
                    >
                      <Text
                        style={[
                          styles.timeUnitText,
                          selectedHour === hr && styles.timeUnitTextSelected,
                        ]}
                      >
                        {hr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={[styles.pickerRow, { marginTop: 12, flexDirection: 'row', gap: 12 }]}>
              {/* Minute */}
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerColLabel}>Minute</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {MINUTES.map((mn) => (
                    <TouchableOpacity
                      key={mn}
                      style={[
                        styles.timeUnitChip,
                        { flex: 1 },
                        selectedMinute === mn && styles.timeUnitChipSelected,
                      ]}
                      onPress={() => setSelectedMinute(mn)}
                    >
                      <Text
                        style={[
                          styles.timeUnitText,
                          selectedMinute === mn && styles.timeUnitTextSelected,
                        ]}
                      >
                        :{mn}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* AM / PM */}
              <View style={{ width: 110 }}>
                <Text style={styles.pickerColLabel}>Period</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['AM', 'PM'] as const).map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.timeUnitChip,
                        { flex: 1 },
                        selectedPeriod === period && styles.timeUnitChipSelected,
                      ]}
                      onPress={() => setSelectedPeriod(period)}
                    >
                      <Text
                        style={[
                          styles.timeUnitText,
                          selectedPeriod === period && styles.timeUnitTextSelected,
                        ]}
                      >
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Selected Preview & Save */}
            <View style={styles.modalPreviewBar}>
              <Text style={styles.modalPreviewLabel}>Selected Time:</Text>
              <Text style={styles.modalPreviewValue}>
                {selectedHour}:{selectedMinute} {selectedPeriod}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalConfirmButton}
              activeOpacity={0.85}
              onPress={confirmTime}
            >
              <Text style={styles.modalConfirmButtonText}>Set Time</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 3,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 18,
  },
  titleBlock: {
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 32,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  daysCard: {
    padding: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    width: 42,
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dayTextSelected: {
    color: colors.white,
  },
  dayDot: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 14,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardHeaderSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  timePill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  timePillText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
  },
  bottomBar: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 20,
    gap: 12,
  },
  continueButton: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.textSecondary,
    padding: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTimeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickTimeChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  quickTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  quickTimeTextSelected: {
    color: colors.primary,
  },
  pickerRow: {
    width: '100%',
  },
  pickerColumn: {
    width: '100%',
  },
  pickerColLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  pickerPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  timeUnitChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeUnitChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeUnitText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timeUnitTextSelected: {
    color: colors.white,
  },
  modalPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 16,
  },
  modalPreviewLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modalPreviewValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  modalConfirmButton: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

