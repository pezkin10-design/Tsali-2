/**
 * Empty State Component
 * Displays a centered message with icon when no data is available
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import { getButtonAccessibility } from '@utils/accessibilityUtils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
  backgroundColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline',
  title,
  message,
  buttonText,
  onButtonPress,
  backgroundColor = COLORS.surface,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <MaterialCommunityIcons
        name={icon as any}
        size={64}
        color={COLORS.primary}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {buttonText && onButtonPress && (
        <TouchableOpacity
          style={styles.button}
          onPress={onButtonPress}
          {...getButtonAccessibility(buttonText)}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface EmptyStateListProps {
  icon?: string;
  title: string;
  message: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

/**
 * Empty state for use in FlatLists
 */
export const EmptyStateList: React.FC<EmptyStateListProps> = ({
  icon,
  title,
  message,
  buttonText,
  onButtonPress,
}) => (
  <View style={styles.listContainer}>
    <EmptyState
      icon={icon}
      title={title}
      message={message}
      buttonText={buttonText}
      onButtonPress={onButtonPress}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    minHeight: 300,
  },
  listContainer: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  icon: {
    marginBottom: SPACING.lg,
    opacity: 0.6,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: 'white',
    fontWeight: '600',
  },
});

export default EmptyState;
