import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import { colors, typography, spacing } from '../../theme';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Hero Image Section with Soft Background */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../../assets/figma/welcome-hero.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        {/* Figma Linear Gradient Fade to White */}
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)', '#FFFFFF']}
          style={styles.gradientOverlay}
        />
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Brand & Heading */}
        <View style={styles.headerBlock}>
          <Text style={styles.brandTitle}>
            Pulse<Text style={styles.brandTitleAccent}>Fit</Text>
          </Text>
          <Text style={styles.tagline}>Stronger Body.{'\n'}Better You</Text>
          <Text style={styles.subtitle}>
            Personalized workouts built for your lifestyle.
          </Text>
        </View>

        {/* Buttons (Figma specs: Get Started & Sign In) */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    height: height * 0.52,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    justifyContent: 'space-between',
    paddingBottom: 25,
  },
  headerBlock: {
    alignItems: 'center',
    marginTop: 10,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  brandTitleAccent: {
    color: colors.primary,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  buttonGroup: {
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.primaryLight,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

