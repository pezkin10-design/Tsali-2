/**
 * Loading Screen Component
 * Displays a centered loading indicator with optional message
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Modal,
  SafeAreaView,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@utils/constants';
import { getLoadingAccessibility } from '@utils/accessibilityUtils';

interface LoadingScreenProps {
  visible: boolean;
  message?: string;
  fullscreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  visible,
  message = 'Loading...',
  fullscreen = true,
}) => {
  if (!fullscreen) {
    return (
      <View style={styles.container} {...getLoadingAccessibility(message)}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <SafeAreaView
        style={styles.fullscreenOverlay}
        {...getLoadingAccessibility(message)}
      >
        <View style={styles.container}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

interface InlineLoadingProps {
  visible: boolean;
  message?: string;
}

/**
 * Inline loading indicator for use within screens
 */
export const InlineLoading: React.FC<InlineLoadingProps> = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <View style={styles.inlineContainer} {...getLoadingAccessibility(message)}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  fullscreenOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  message: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  inlineMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
  },
});

export default LoadingScreen;
