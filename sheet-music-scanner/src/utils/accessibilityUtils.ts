/**
 * Accessibility Utilities
 * Provides helpers for adding accessible features to components
 */

import { AccessibilityRole, AccessibilityActionInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Accessibility label for a button action
 */
export const getButtonAccessibility = (label: string) => ({
  accessibilityRole: 'button' as AccessibilityRole,
  accessibilityLabel: label,
  accessible: true,
});

/**
 * Accessibility label for a text input
 */
export const getInputAccessibility = (label: string, hint?: string) => ({
  accessibilityRole: 'search' as AccessibilityRole,
  accessibilityLabel: label,
  accessibilityHint: hint || 'Enter text to search or filter',
  accessible: true,
});

/**
 * Accessibility label for an image with description
 */
export const getImageAccessibility = (description: string) => ({
  accessible: true,
  accessibilityRole: 'image' as AccessibilityRole,
  accessibilityLabel: description,
});

/**
 * Accessibility label for a list item
 */
export const getListItemAccessibility = (itemNumber: number, totalItems: number, itemDescription: string) => ({
  accessible: true,
  accessibilityLabel: `${itemDescription}, item ${itemNumber} of ${totalItems}`,
  accessibilityRole: 'listitem' as AccessibilityRole,
});

/**
 * Accessibility label for a switch/toggle
 */
export const getSwitchAccessibility = (label: string, isEnabled: boolean) => ({
  accessible: true,
  accessibilityRole: 'switch' as AccessibilityRole,
  accessibilityLabel: label,
  accessibilityState: { checked: isEnabled },
});

/**
 * Accessibility label for a modal
 */
export const getModalAccessibility = (title: string) => ({
  accessible: true,
  accessibilityRole: 'dialog' as AccessibilityRole,
  accessibilityLabel: `Modal: ${title}`,
});

/**
 * Accessibility label for a loading indicator
 */
export const getLoadingAccessibility = (message?: string) => ({
  accessible: true,
  accessibilityRole: 'progressbar' as AccessibilityRole,
  accessibilityLabel: message || 'Loading content, please wait',
  accessibilityLiveRegion: 'polite' as any,
});

/**
 * Accessibility label for an error message
 */
export const getErrorAccessibility = (message: string) => ({
  accessible: true,
  accessibilityRole: 'alert' as AccessibilityRole,
  accessibilityLabel: `Error: ${message}`,
  accessibilityLiveRegion: 'assertive' as any,
});

/**
 * Provide haptic feedback for button press
 */
export const hapticButtonPress = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

/**
 * Provide haptic feedback for success
 */
export const hapticSuccess = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

/**
 * Provide haptic feedback for error
 */
export const hapticError = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

/**
 * Provide haptic feedback for warning
 */
export const hapticWarning = async () => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

/**
 * Check if color meets WCAG AA standard contrast ratio (4.5:1 for normal text, 3:1 for large text)
 */
export const calculateContrastRatio = (rgb1: [number, number, number], rgb2: [number, number, number]): number => {
  const getLuminance = (rgb: [number, number, number]) => {
    const [r, g, b] = rgb.map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Format a duration in milliseconds as a readable string
 * Example: 5000 -> "5 seconds"
 */
export const formatDurationForAccessibility = (ms: number): string => {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  const minutes = Math.round(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

/**
 * Get keyboard accessible action handlers
 */
export const getKeyboardAccessibleActions = (): AccessibilityActionInfo[] => [
  { name: 'activate', label: 'activate' },
  { name: 'longpress', label: 'long press' },
];

/**
 * Generate test ID for component
 */
export const getTestID = (section: string, component: string): string => {
  return `${section}-${component}`;
};

export default {
  getButtonAccessibility,
  getInputAccessibility,
  getImageAccessibility,
  getListItemAccessibility,
  getSwitchAccessibility,
  getModalAccessibility,
  getLoadingAccessibility,
  getErrorAccessibility,
  hapticButtonPress,
  hapticSuccess,
  hapticError,
  hapticWarning,
  calculateContrastRatio,
  formatDurationForAccessibility,
  getKeyboardAccessibleActions,
  getTestID,
};
