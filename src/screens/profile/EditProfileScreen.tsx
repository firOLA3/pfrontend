import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { ArrowRightIcon, CameraIcon } from '../../components/icons';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || (user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : ''));
  const [bio, setBio] = useState(user?.bio || '');
  const [email] = useState(user?.email || '');

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialUsername = useRef(user?.username || '');
  const usernameCheckTimer = useRef<NodeJS.Timeout | null>(null);

  // Live username availability check with debounce
  useEffect(() => {
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername || cleanUsername === initialUsername.current) {
      setUsernameAvailable(null);
      return;
    }

    if (cleanUsername.length < 3) {
      setUsernameAvailable(false);
      return;
    }

    if (usernameCheckTimer.current) {
      clearTimeout(usernameCheckTimer.current);
    }

    setIsCheckingUsername(true);
    usernameCheckTimer.current = setTimeout(async () => {
      try {
        const res = await userService.checkUsername(cleanUsername);
        setUsernameAvailable(res.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 450);

    return () => {
      if (usernameCheckTimer.current) {
        clearTimeout(usernameCheckTimer.current);
      }
    };
  }, [username]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Full name cannot be empty.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (cleanUsername && usernameAvailable === false) {
      Alert.alert('Username Unavailable', 'Please choose a different username.');
      return;
    }

    try {
      setIsSaving(true);
      const res = await userService.updateProfile({
        name: name.trim(),
        username: cleanUsername,
        bio: bio.trim(),
      });

      if (res.success && res.data) {
        updateUser(res.data);
        Alert.alert('Profile Updated', 'Your profile details have been saved.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PF';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar (Figma #2426:1469) */}
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
        <Text style={styles.headerTitle}>Edit profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
          style={styles.headerSaveBtn}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FE2E31" />
          ) : (
            <Text style={styles.headerSaveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar & Change Photo (Figma #2426:1494) */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <TouchableOpacity
                style={styles.cameraBadge}
                activeOpacity={0.8}
                onPress={() =>
                  Alert.alert(
                    'Profile Photo',
                    'Choose an option',
                    [
                      { text: 'Take Photo', onPress: () => {} },
                      { text: 'Choose from Library', onPress: () => {} },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  )
                }
              >
                <CameraIcon size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Profile Photo', 'Photo options: Take new photo or Choose from library.')
              }
              activeOpacity={0.7}
            >
              <Text style={styles.changePhotoText}>Change photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields (Figma #2426:1503) */}
          <View style={styles.formSection}>
            {/* Field 1: Full name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Alex Johnson"
                placeholderTextColor="#999999"
                autoCapitalize="words"
              />
            </View>

            {/* Field 2: Username */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Username</Text>
                {isCheckingUsername && (
                  <Text style={styles.hintChecking}>Checking...</Text>
                )}
                {!isCheckingUsername && usernameAvailable === true && (
                  <Text style={styles.hintAvailable}>Available</Text>
                )}
                {!isCheckingUsername && usernameAvailable === false && (
                  <Text style={styles.hintUnavailable}>Unavailable</Text>
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  usernameAvailable === false && styles.inputError,
                  usernameAvailable === true && styles.inputSuccess,
                ]}
                value={username}
                onChangeText={(val) => setUsername(val.startsWith('@') ? val : `@${val}`)}
                placeholder="@alexfit"
                placeholderTextColor="#999999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Field 3: Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email address</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={email}
                editable={false}
                placeholder="alex.johnson@gmail.com"
                placeholderTextColor="#999999"
              />
            </View>

            {/* Field 4: Bio */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Fitness enthusiast. Always pushing for a better me."
                placeholderTextColor="#999999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Save Button CTA */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.88}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerSaveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FE2E31',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: '#FE2E31',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FE2E31',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FE2E31',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FE2E31',
  },
  formSection: {
    gap: 18,
    marginBottom: 32,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  hintChecking: {
    fontSize: 12,
    color: '#888888',
  },
  hintAvailable: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2E7D32',
  },
  hintUnavailable: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D32F2F',
  },
  input: {
    height: 48,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111111',
  },
  inputSuccess: {
    borderColor: '#4CAF50',
  },
  inputError: {
    borderColor: '#FE2E31',
  },
  inputDisabled: {
    backgroundColor: '#F2F2F2',
    color: '#888888',
  },
  bioInput: {
    height: 84,
    paddingTop: 12,
    paddingBottom: 12,
  },
  saveButton: {
    height: 52,
    backgroundColor: '#FE2E31',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FE2E31',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
