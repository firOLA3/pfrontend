import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import { PulseFitLogoIcon } from '../../components/icons';

const { width } = Dimensions.get('window');

type Props = Partial<NativeStackScreenProps<AuthStackParamList, 'Splash'>> & {
  isInitialLoading?: boolean;
};

/**
 * PulseFit Splash Screen (Figma Frame #2294:225)
 * First screen containing brand logo, pulse cardiogram line, and tagline on solid brand red.
 */
export const SplashScreen: React.FC<Props> = ({ navigation, isInitialLoading = false }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const navigateToNext = () => {
    if (!isInitialLoading && navigation) {
      navigation.replace('Welcome');
    }
  };

  useEffect(() => {
    // Smooth entry animation
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance after 2 seconds if inside AuthNavigator
    if (!isInitialLoading && navigation) {
      const timer = setTimeout(() => {
        navigateToNext();
      }, 2100);

      return () => clearTimeout(timer);
    }
  }, [isInitialLoading, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <TouchableOpacity
        style={styles.touchArea}
        activeOpacity={1}
        onPress={navigateToNext}
      >
        <Animated.View
          style={[
            styles.contentBox,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo Icon and Brand Wordmark */}
          <View style={styles.logoGroup}>
            <PulseFitLogoIcon width={72} height={44} color="#FFFFFF" />

            <View style={styles.brandRow}>
              <Text style={styles.brandPulse}>Pulse</Text>
              <Text style={styles.brandFit}>Fit</Text>
            </View>
          </View>

          {/* Tagline */}
          <Text style={styles.tagline}>Stronger Body. Better You.</Text>
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FE2E31',
  },
  touchArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBox: {
    alignItems: 'center',
    gap: 24,
    width: Math.min(width * 0.85, 320),
  },
  logoGroup: {
    alignItems: 'center',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandPulse: {
    fontFamily: 'System',
    fontSize: 44,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandFit: {
    fontFamily: 'System',
    fontSize: 44,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: 'System',
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
