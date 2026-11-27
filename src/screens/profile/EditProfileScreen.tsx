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
  Modal,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { UserAvatar } from '../../components/common/UserAvatar';
import {
  ArrowRightIcon,
  CameraIcon,
  PhotoLibraryIcon,
  TrashIcon,
} from '../../components/icons';
import { colors, spacing } from '../../theme';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
  base64: true,
};

const assetToBase64Payload = async (
  asset: ImagePicker.ImagePickerAsset
): Promise<{ image: string; mimeType: string }> => {
  const mimeType = asset.mimeType || 'image/jpeg';
  if (asset.base64) {
    return { image: asset.base64, mimeType };
  }
  if (asset.uri.startsWith('data:')) {
    return { image: asset.uri, mimeType };
  }

  const response = await fetch(asset.uri);
  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read selected image data.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read selected image data.'));
    reader.readAsDataURL(blob);
  });

  return { image: dataUrl, mimeType: blob.type || mimeType };
};

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || (user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : ''));
  const [bio, setBio] = useState(user?.bio || '');
  const [email] = useState(user?.email || '');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(user?.avatarUrl);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const initialUsername = useRef(user?.username || '');
  const usernameCheckTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isUploadingPhoto) {
      setAvatarUri(user?.avatarUrl);
    }
  }, [user?.avatarUrl, isUploadingPhoto]);

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

  const processSelectedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    const previousUri = avatarUri;
    setAvatarUri(asset.uri);
    setIsUploadingPhoto(true);
    try {
      const { image, mimeType } = await assetToBase64Payload(asset);
      const res = await userService.uploadAvatar(image, mimeType as any);
      if (res.success && res.data) {
        updateUser(res.data);
        setAvatarUri(res.data.avatarUrl);
      }
    } catch (err: any) {
      setAvatarUri(previousUri);
      Alert.alert(
        'Upload Failed',
        err?.message || 'Could not upload profile photo. Please try a smaller image.'
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Recover Android activity result if OS reclaimed the activity while camera/gallery was open
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let isMounted = true;
    ImagePicker.getPendingResultAsync()
      .then((pending) => {
        if (!isMounted || !pending || 'code' in pending) return;
        if (!pending.canceled && pending.assets?.length) {
          processSelectedAsset(pending.assets[0]);
        }
      })
      .catch(() => null);
    return () => {
      isMounted = false;
    };
  }, []);

  const promptPermissionSettings = (label: string, feature: string) => {
    Alert.alert(
      `${label} Permission Needed`,
      `Please allow PulseFit to access your ${feature} to set a profile picture.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  const handlePickPhoto = async (source: 'camera' | 'library') => {
    setPhotoSheetVisible(false);

    // Wait for modal fade-out on native so UIKit doesn't block presenting the OS picker
    if (Platform.OS !== 'web') {
      await new Promise((resolve) => setTimeout(resolve, 260));
    }

    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        if (!permission.canAskAgain && Platform.OS !== 'web') {
          promptPermissionSettings(
            source === 'camera' ? 'Camera' : 'Photo Library',
            source === 'camera' ? 'camera' : 'photos'
          );
        } else {
          Alert.alert(
            'Permission Required',
            `Access to your ${source === 'camera' ? 'camera' : 'photo library'} is needed to set a profile picture.`
          );
        }
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
          : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processSelectedAsset(result.assets[0]);
      }
    } catch (err: any) {
      if (source === 'camera') {
        Alert.alert(
          'Camera Unavailable',
          'Could not open camera on this device. Please choose an existing photo from your library.'
        );
      } else {
        Alert.alert('Photo Selection Failed', err?.message || 'Could not open your photo library.');
      }
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoSheetVisible(false);
    try {
      setIsUploadingPhoto(true);
      const res = await userService.updateProfile({ avatarUrl: '' });
      if (res.success && res.data) {
        updateUser({ ...res.data, avatarUrl: undefined });
        setAvatarUri(undefined);
      }
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not remove profile photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

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
          {
            text: 'OK',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Main');
              }
            },
          },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar (Figma #2426:1469) */}
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
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setPhotoSheetVisible(true)}
                disabled={isUploadingPhoto}
              >
                <UserAvatar avatarUrl={avatarUri} name={name} size={90} variant="soft" />
                {isUploadingPhoto && (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cameraBadge}
                activeOpacity={0.8}
                disabled={isUploadingPhoto}
                onPress={() => setPhotoSheetVisible(true)}
              >
                <CameraIcon size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setPhotoSheetVisible(true)}
              disabled={isUploadingPhoto}
              activeOpacity={0.7}
            >
              <Text style={styles.changePhotoText}>
                {isUploadingPhoto ? 'Updating photo...' : 'Change photo'}
              </Text>
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

      {/* Profile Photo Action Sheet (Figma #2430:421) */}
      <Modal
        visible={photoSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoSheetVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPhotoSheetVisible(false)}>
          <View style={styles.sheetBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.sheetContainer}>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Profile photo</Text>

                <TouchableOpacity
                  style={styles.sheetRow}
                  activeOpacity={0.7}
                  onPress={() => handlePickPhoto('camera')}
                >
                  <CameraIcon size={22} color="#111111" />
                  <Text style={styles.sheetRowText}>Take photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetRow}
                  activeOpacity={0.7}
                  onPress={() => handlePickPhoto('library')}
                >
                  <PhotoLibraryIcon size={22} color="#111111" />
                  <Text style={styles.sheetRowText}>Choose from library</Text>
                </TouchableOpacity>

                {Boolean(avatarUri) && (
                  <TouchableOpacity
                    style={styles.sheetRow}
                    activeOpacity={0.7}
                    onPress={handleRemovePhoto}
                  >
                    <TrashIcon size={22} color="#D4161A" />
                    <Text style={[styles.sheetRowText, styles.sheetRowDestructive]}>
                      Remove current photo
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.sheetCancelBtn}
                  activeOpacity={0.8}
                  onPress={() => setPhotoSheetVisible(false)}
                >
                  <Text style={styles.sheetCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 45,
    backgroundColor: 'rgba(17, 17, 17, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
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
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DCDCDC',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 14,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 12,
  },
  sheetRowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  sheetRowDestructive: {
    color: '#D4161A',
  },
  sheetCancelBtn: {
    marginTop: 12,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetCancelText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
});
