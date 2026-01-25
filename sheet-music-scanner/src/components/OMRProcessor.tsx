import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import { MusicData } from '@utils/types';
import OMRService, { OMRResponse, OMRProcessingOptions } from '@services/omr';

interface OMRProcessorProps {
  imagePath: string;
  onSuccess: (musicData: MusicData, confidence: number) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

interface ProcessingStep {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

export const OMRProcessor: React.FC<OMRProcessorProps> = ({
  imagePath,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'enhance', label: 'Enhancing image', completed: false, current: true },
    { id: 'detect', label: 'Detecting staff lines', completed: false, current: false },
    { id: 'recognize', label: 'Recognizing symbols', completed: false, current: false },
    { id: 'parse', label: 'Parsing music data', completed: false, current: false },
    { id: 'validate', label: 'Validating results', completed: false, current: false },
  ]);
  const [result, setResult] = useState<OMRResponse | null>(null);

  useEffect(() => {
    processImage();
  }, []);

  const processImage = async () => {
    try {
      // Simulate processing steps
      for (let i = 0; i < steps.length; i++) {
        await updateStep(i);
        await delay(1000); // Simulate processing time
      }

      const options: OMRProcessingOptions = {
        enhanceImage: true,
        language: 'en',
        returnConfidence: true,
      };

      const response = await OMRService.processImage(imagePath, options);

      if (response.success && response.musicData) {
        setResult(response);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Validate the results
        const validation = OMRService.validateMusicData(response.musicData);
        if (!validation.valid) {
          showValidationAlert(validation.errors, response.musicData, response.confidence || 0);
        } else {
          onSuccess(response.musicData, response.confidence || 0);
        }
      } else {
        throw new Error(response.error || 'OMR processing failed');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateStep = async (stepIndex: number) => {
    setSteps((prev) =>
      prev.map((step, index) => ({
        ...step,
        completed: index < stepIndex,
        current: index === stepIndex,
      }))
    );
    setProgress((stepIndex + 1) / steps.length * 100);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const showValidationAlert = (errors: string[], musicData: MusicData, confidence: number) => {
    Alert.alert(
      'Recognition Issues Found',
      `${errors.length} issue(s) detected. Confidence: ${(confidence * 100).toFixed(0)}%`,
      [
        {
          text: 'Review',
          onPress: () => onSuccess(musicData, confidence),
        },
        {
          text: 'Cancel',
          onPress: onCancel,
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Processing Music</Text>
        {isProcessing && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <MaterialIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>

      {isProcessing ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.animationContainer}>
            <View style={styles.scanningAnimation}>
              <View
                style={[
                  styles.scanLine,
                  { opacity: 0.3 + (progress / 100) * 0.7 },
                ]}
              />
            </View>
          </View>

          <Text style={styles.progressText}>
            {Math.round(progress)}% Complete
          </Text>

          <View style={styles.stepsContainer}>
            {steps.map((step) => (
              <View key={step.id} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepIcon,
                    step.completed && styles.stepIconCompleted,
                    step.current && styles.stepIconCurrent,
                  ]}
                >
                  {step.completed ? (
                    <MaterialIcons name="check" size={16} color="white" />
                  ) : (
                    <ActivityIndicator
                      size="small"
                      color={step.current ? COLORS.primary : COLORS.border}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    (step.completed || step.current) && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.estimatedTimeContainer}>
            <MaterialIcons name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={styles.estimatedTime}>
              Estimated time: {Math.round((5000 - progress * 50) / 1000)}s remaining
            </Text>
          </View>
        </ScrollView>
      ) : result?.success && result.musicData ? (
        <ScrollView style={styles.content}>
          <View style={styles.resultContainer}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={64} color={COLORS.primary} />
            </View>

            <Text style={styles.resultTitle}>Recognition Complete</Text>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Title</Text>
              <Text style={styles.resultValue}>{result.musicData.title || 'Untitled'}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Composer</Text>
              <Text style={styles.resultValue}>{result.musicData.composer || 'Unknown'}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Measures</Text>
              <Text style={styles.resultValue}>{result.musicData.measures?.length || 0}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Confidence</Text>
              <View style={styles.confidenceContainer}>
                <View
                  style={[
                    styles.confidenceBar,
                    { width: `${(result.confidence || 0) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.confidenceText}>
                {OMRService.getConfidenceExplanation(result.confidence || 0)}
              </Text>
            </View>

            {result.processingTime && (
              <Text style={styles.processingTime}>
                Processing time: {(result.processingTime / 1000).toFixed(1)}s
              </Text>
            )}

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => onSuccess(result.musicData!, result.confidence || 0)}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={COLORS.danger} />
          <Text style={styles.errorTitle}>Processing Failed</Text>
          <Text style={styles.errorMessage}>
            {result?.error || 'An unknown error occurred'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={processImage}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  cancelButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  animationContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  scanningAnimation: {
    width: '100%',
    height: 100,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  stepsContainer: {
    marginBottom: SPACING.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepIconCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepIconCurrent: {
    borderColor: COLORS.primary,
  },
  stepLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  stepLabelActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  estimatedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  estimatedTime: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  resultContainer: {
    paddingVertical: SPACING.lg,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resultTitle: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  resultLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  resultValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  confidenceContainer: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginVertical: SPACING.sm,
  },
  confidenceBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  confidenceText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  processingTime: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
  },
  continueButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sizes.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.danger,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: TYPOGRAPHY.sizes.md,
  },
});

export default OMRProcessor;
