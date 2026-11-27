import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { resolveMediaUrl } from '../../services/api';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: number;
  variant?: 'primary' | 'soft';
  maxInitials?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Displays the user's profile picture when available and falls back cleanly to initials.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  name,
  size = 60,
  variant = 'primary',
  maxInitials = 2,
  style,
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const resolvedUri = resolveMediaUrl(avatarUrl);
  const showImage = Boolean(resolvedUri && !imageError);

  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, maxInitials)
    : maxInitials === 1
      ? 'P'
      : 'PF';

  const isSoft = variant === 'soft';

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isSoft ? '#FFF0F0' : '#FE2E31',
          borderWidth: isSoft ? 2 : 0,
          borderColor: isSoft ? '#FE2E31' : 'transparent',
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: resolvedUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              fontSize: Math.round(size * (maxInitials === 1 ? 0.42 : 0.35)),
              color: isSoft ? '#FE2E31' : '#FFFFFF',
            },
          ]}
        >
          {initials}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '700',
  },
});
