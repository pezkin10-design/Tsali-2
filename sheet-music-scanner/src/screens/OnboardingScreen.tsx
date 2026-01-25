/**
 * Onboarding Screen
 * First-time user experience with feature walkthrough
 */

import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StorageService } from '@services/storage';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import { ErrorHandler, ErrorCategory } from '@utils/errorHandler';

interface OnboardingScreenProps {
  navigation: any;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Tsali Scanner',
    description:
      'Scan sheet music and get instant digital music recognition powered by AI. No internet required - everything works offline.',
    icon: 'music-box-outline',
    color: COLORS.primary,
  },
  {
    id: 'camera',
    title: 'Capture Sheet Music',
    description:
      'Use your camera or upload from your photo library. Position the sheet music clearly for best results.',
    icon: 'camera',
    color: COLORS.secondary,
  },
  {
    id: 'recognition',
    title: 'Instant Recognition',
    description:
      'TensorFlow Lite AI recognizes notes, rests, time signatures, and musical symbols in real-time, completely offline.',
    icon: 'brain',
    color: COLORS.success,
  },
  {
    id: 'export',
    title: 'Export & Share',
    description:
      'Export to MIDI, MusicXML, or JSON. Play back recognized music directly in the app or export to your favorite DAW.',
    icon: 'download',
    color: COLORS.warning,
  },
  {
    id: 'library',
    title: 'Organize Your Scans',
    description:
      'All your scanned music is saved locally. Search, sort, and manage your music library anytime.',
    icon: 'library-music',
    color: COLORS.primary,
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      // Mark onboarding as complete
      await StorageService.setPreference('onboardingComplete', true);
      // Pop the onboarding screen - RootNavigator will re-check and show main app
      navigation.goBack();
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      console.error('Error completing onboarding:', appError.userMessage);
      // Still navigate even if preference save fails
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      await StorageService.setPreference('onboardingComplete', true);
      navigation.goBack();
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      console.error('Error skipping onboarding:', appError.userMessage);
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const step = ONBOARDING_STEPS[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Skip */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {currentStep + 1} / {ONBOARDING_STEPS.length}
        </Text>
        <TouchableOpacity onPress={handleSkip} disabled={isLoading}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${step.color}20` },
          ]}
        >
          <MaterialCommunityIcons
            name={step.icon as any}
            size={80}
            color={step.color}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{step.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{step.description}</Text>

        {/* Features List (for certain steps) */}
        {step.id === 'welcome' && (
          <View style={styles.featuresList}>
            <FeatureItem
              icon="lightning-bolt"
              title="Fast Recognition"
              description="Real-time music notation detection"
            />
            <FeatureItem
              icon="wifi-off"
              title="Works Offline"
              description="No internet connection required"
            />
            <FeatureItem
              icon="lock"
              title="Private"
              description="All data stays on your device"
            />
          </View>
        )}

        {step.id === 'camera' && (
          <View style={styles.featuresList}>
            <FeatureItem
              icon="image"
              title="Multiple Sources"
              description="Camera, photo library, or file picker"
            />
            <FeatureItem
              icon="crop"
              title="Image Editor"
              description="Adjust and optimize before scanning"
            />
            <FeatureItem
              icon="check-circle"
              title="Preview"
              description="See results before saving"
            />
          </View>
        )}

        {step.id === 'export' && (
          <View style={styles.featuresList}>
            <FeatureItem
              icon="music-note"
              title="MIDI Format"
              description="Compatible with all DAWs"
            />
            <FeatureItem
              icon="file-music"
              title="MusicXML"
              description="Standard notation format"
            />
            <FeatureItem
              icon="code-json"
              title="JSON Data"
              description="Raw structured data"
            />
          </View>
        )}
      </ScrollView>

      {/* Progress Indicators */}
      <View style={styles.progressContainer}>
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handlePrevious}
          disabled={currentStep === 0 || isLoading}
        >
          <Text style={styles.secondaryButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={isLastStep ? handleComplete : handleNext}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLastStep ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/**
 * Feature Item Component
 */
const FeatureItem: React.FC<{
  icon: string;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <MaterialCommunityIcons
      name={icon as any}
      size={24}
      color={COLORS.primary}
      style={styles.featureIcon}
    />
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  skipButton: {
    ...TYPOGRAPHY.body1,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresList: {
    width: '100%',
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    gap: SPACING.md,
  },
  featureIcon: {
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    gap: SPACING.xs,
  },
  featureTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '600',
  },
  featureDescription: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.lg,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.button,
    color: 'white',
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
