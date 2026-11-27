import { Platform, TurboModuleRegistry } from 'react-native';
import type * as GoogleSignInModuleType from '@react-native-google-signin/google-signin';

export type GoogleSignInResult =
  | {
      status: 'success';
      idToken: string;
      name?: string;
      avatarUrl?: string;
    }
  | {
      status: 'cancelled';
    };

let isConfigured = false;

const loadGoogleSigninModule = (): typeof GoogleSignInModuleType | null => {
  if (Platform.OS === 'web') return null;

  // Guard against Expo Go or missing native module before requiring index.js, which uses TurboModuleRegistry.getEnforcing
  const nativeModule = TurboModuleRegistry.get('RNGoogleSignin');
  if (!nativeModule) return null;

  try {
    return require('@react-native-google-signin/google-signin') as typeof GoogleSignInModuleType;
  } catch {
    return null;
  }
};

const getGoogleConfig = () => {
  const webClientId = (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '').trim();
  const iosClientId = (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '').trim();
  const validWebClientId =
    webClientId && !webClientId.startsWith('your_') && !webClientId.includes('REPLACE_WITH_')
      ? webClientId
      : '';
  const validIosClientId =
    iosClientId && !iosClientId.startsWith('your_') && !iosClientId.includes('REPLACE_WITH_')
      ? iosClientId
      : '';

  return { webClientId: validWebClientId, iosClientId: validIosClientId };
};

/**
 * Signs the user in with the native Google Sign-In dialog and returns the verified OIDC idToken.
 */
export const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
  if (Platform.OS === 'web') {
    throw new Error(
      'Native Google Sign-In works on Android and iOS development builds. Please use email sign-in on web.'
    );
  }

  const googleModule = loadGoogleSigninModule();
  if (!googleModule) {
    throw new Error(
      'Google Sign-In native module is not available in Expo Go. Run an Expo Development Build (npx expo run:android or npx expo run:ios) to use Google Sign-In.'
    );
  }

  const { webClientId, iosClientId } = getGoogleConfig();
  if (!webClientId) {
    throw new Error(
      'Google Sign-In is not configured yet. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to pfrontend/.env.local (and GOOGLE_WEB_CLIENT_ID to pbackend/.env) and restart Metro.'
    );
  }

  const {
    GoogleSignin,
    statusCodes,
    isSuccessResponse,
    isCancelledResponse,
    isErrorWithCode,
  } = googleModule;

  if (!isConfigured) {
    GoogleSignin.configure({
      webClientId,
      ...(iosClientId ? { iosClientId } : {}),
    });
    isConfigured = true;
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    if (isCancelledResponse(response)) {
      return { status: 'cancelled' };
    }

    if (!isSuccessResponse(response)) {
      return { status: 'cancelled' };
    }

    let idToken = response.data.idToken;
    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens.idToken;
    }

    if (!idToken) {
      throw new Error(
        'Google did not return an ID token. Verify that EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is your Web Client ID in Google Cloud Console.'
      );
    }

    return {
      status: 'success',
      idToken,
      name: response.data.user.name || undefined,
      avatarUrl: response.data.user.photo || undefined,
    };
  } catch (error: any) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { status: 'cancelled' };
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google Sign-In is already in progress.');
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services is unavailable or needs to be updated on this device.');
      }
      if (String(error.code) === '10') {
        throw new Error(
          'Google Sign-In configuration mismatch (DEVELOPER_ERROR). Verify your Android package (com.pulsefit.app), SHA-1 fingerprint, and Web Client ID in Google Cloud Console.'
        );
      }
    }

    throw new Error(error?.message || 'Google Sign-In failed. Please try again.');
  }
};

/**
 * Clears cached Google session if native Google Sign-In module is present.
 */
export const signOutFromGoogle = async (): Promise<void> => {
  const googleModule = loadGoogleSigninModule();
  if (!googleModule || !isConfigured) return;

  try {
    if (googleModule.GoogleSignin.hasPreviousSignIn()) {
      await googleModule.GoogleSignin.signOut();
    }
  } catch {
    // Ignore errors during sign-out cleanup
  }
};
