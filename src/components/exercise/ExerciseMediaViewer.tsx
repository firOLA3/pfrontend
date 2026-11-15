import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../../theme';
import { API_BASE_URL } from '../../services/api';

interface ExerciseMediaViewerProps {
  videoUrl?: string;
  animationUrl?: string;
  posterUrl?: string;
  startImageUrl?: string;
  peakImageUrl?: string;
  exerciseName: string;
  isPaused?: boolean;
}

export const ExerciseMediaViewer: React.FC<ExerciseMediaViewerProps> = ({
  videoUrl,
  animationUrl,
  posterUrl,
  startImageUrl,
  peakImageUrl,
  exerciseName,
  isPaused = false,
}) => {
  const [mode, setMode] = useState<'motion' | 'form'>('motion');
  const [videoError, setVideoError] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Normalize absolute URL
  const resolveUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const resolvedVideo = resolveUrl(videoUrl);
  const resolvedPoster = resolveUrl(posterUrl || startImageUrl);
  const resolvedAnimation = resolveUrl(animationUrl);
  const resolvedStart = resolveUrl(startImageUrl);
  const resolvedPeak = resolveUrl(peakImageUrl);

  // Initialize expo-video player
  const player = useVideoPlayer(resolvedVideo || '', (p) => {
    p.loop = true;
    p.muted = true;
    if (!isPaused && resolvedVideo) {
      p.play();
    }
  });

  // Handle video source changes when current exercise changes
  useEffect(() => {
    setVideoError(false);
    setIsVideoReady(false);

    if (resolvedVideo && player) {
      try {
        player.replace(resolvedVideo);
        player.loop = true;
        player.muted = true;
        if (!isPaused) {
          player.play();
        }
      } catch {
        setVideoError(true);
      }
    }
  }, [resolvedVideo, player]);

  // Handle play / pause state
  useEffect(() => {
    if (!player) return;
    if (isPaused) {
      player.pause();
    } else if (resolvedVideo && !videoError) {
      player.play();
    }
  }, [isPaused, player, resolvedVideo, videoError]);

  const hasFormImages = Boolean(resolvedStart || resolvedPeak);
  const hasVideo = Boolean(resolvedVideo && !videoError);

  return (
    <View style={styles.container}>
      {/* Media Content Area */}
      <View style={styles.mediaContainer}>
        {mode === 'motion' ? (
          hasVideo ? (
            <View style={styles.videoWrapper}>
              <VideoView
                player={player}
                style={styles.video}
                contentFit="contain"
                nativeControls={false}
                allowsPictureInPicture={false}
              />
            </View>
          ) : resolvedAnimation || resolvedPoster ? (
            <Image
              source={{ uri: resolvedAnimation || resolvedPoster }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackEmoji}>🏋️‍♂️</Text>
            </View>
          )
        ) : (
          /* Form Guide: Side-by-side Start & Peak posture snapshot */
          <View style={styles.formContainer}>
            {resolvedStart && (
              <View style={styles.formSnapshot}>
                <Image
                  source={{ uri: resolvedStart }}
                  style={styles.formImage}
                  resizeMode="contain"
                />
                <View style={styles.formTag}>
                  <Text style={styles.formTagText}>START</Text>
                </View>
              </View>
            )}
            {resolvedPeak && (
              <View style={styles.formSnapshot}>
                <Image
                  source={{ uri: resolvedPeak }}
                  style={styles.formImage}
                  resizeMode="contain"
                />
                <View style={[styles.formTag, styles.formTagPeak]}>
                  <Text style={[styles.formTagText, styles.formTagPeakText]}>PEAK</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Mode Switcher Pill: Motion vs Form Guide */}
      {hasFormImages && (
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'motion' && styles.toggleBtnActive]}
            onPress={() => setMode('motion')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, mode === 'motion' && styles.toggleTextActive]}>
              Motion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'form' && styles.toggleBtnActive]}
            onPress={() => setMode('form')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, mode === 'form' && styles.toggleTextActive]}>
              Form Guide
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  mediaContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#0D121C',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackEmoji: {
    fontSize: 56,
  },
  formContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    padding: 10,
    gap: 8,
  },
  formSnapshot: {
    flex: 1,
    height: '100%',
    backgroundColor: '#151D2A',
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  formImage: {
    width: '90%',
    height: '80%',
  },
  formTag: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  formTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  formTagPeak: {
    backgroundColor: colors.primaryLight,
  },
  formTagPeakText: {
    color: colors.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    padding: 3,
    marginTop: 10,
    alignSelf: 'center',
  },
  toggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.primary,
  },
});
