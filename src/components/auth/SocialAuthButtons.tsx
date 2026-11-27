import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle } from '../../services/googleAuth.service';
import { colors } from '../../theme';

interface SocialAuthButtonsProps {
  disabled?: boolean;
}

/**
 * Shared Apple and Google OAuth action row used across SignUpScreen and SignInScreen.
 */
export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ disabled = false }) => {
  const { oauthLogin } = useAuth();
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const handleGoogleAuth = async () => {
    try {
      setOauthLoading('google');
      const result = await signInWithGoogle();
      if (result.status !== 'success') return;

      await oauthLogin({
        provider: 'google',
        idToken: result.idToken,
        name: result.name,
        avatarUrl: result.avatarUrl,
      });
    } catch (err: any) {
      Alert.alert('Google Sign-In', err?.message || 'Unable to continue with Google.');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleAppleAuth = () => {
    Alert.alert(
      'Apple Sign-In',
      'Sign in with Apple requires configuring your Apple Developer Bundle ID capability first.'
    );
  };

  const isBusy = disabled || oauthLoading !== null;

  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialGroup}>
        <TouchableOpacity
          style={styles.socialButton}
          activeOpacity={0.85}
          disabled={isBusy}
          onPress={handleAppleAuth}
        >
          <Text style={styles.socialButtonText}> Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          activeOpacity={0.85}
          disabled={isBusy}
          onPress={handleGoogleAuth}
        >
          {oauthLoading === 'google' ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <Text style={styles.socialButtonText}>Google</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
  socialGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
