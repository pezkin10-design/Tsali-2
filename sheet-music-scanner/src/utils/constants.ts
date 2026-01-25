// App Constants
import { AppSettings } from './types';
export const COLORS = {
  primary: '#1a73e8',
  secondary: '#4285f4',
  success: '#34a853',
  error: '#ea4335',
  danger: '#d32f2f',
  warning: '#fbbc04',
  background: '#ffffff',
  surface: '#f8f9fa',
  text: '#202124',
  textSecondary: '#5f6368',
  border: '#e8eaed',
  shadow: 'rgba(32, 33, 36, 0.1)',
  card: '#ffffff',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

export const SCREEN_NAMES = {
  HOME: 'Home',
  SCANNER: 'Scanner',
  VIEWER: 'Viewer',
  LIBRARY: 'Library',
  SETTINGS: 'Settings',
  HELP: 'Help',
} as const;

export const FILE_PATHS = {
  SCANS: 'scans/',
  EXPORTS: 'exports/',
  TEMP: 'temp/',
  THUMBNAILS: 'thumbnails/',
};

export const STORAGE_KEYS = {
  SCANNED_ITEMS: 'tsali_scanned_items',
  APP_SETTINGS: 'tsali_settings',
  USER_PREFERENCES: 'tsali_preferences',
  AUDIO_SETTINGS: 'tsali_audio_settings',
};

export const DEFAULT_SETTINGS: AppSettings = {
  vibration: true,
  haptics: true,
  soundEnabled: true,
  autoRotate: true,
  theme: 'light',
  volume: 0.8,
  playbackSpeed: 1,
  metronomeEnabled: false,
  instrumentType: 'piano',
};

export const CAMERA_CONFIG = {
  quality: 1.0,
  ratio: '4:3',
  focusMode: 'on' as const,
  autoExposure: true,
  whiteBalance: 'auto' as const,
};

export const ANIMATION_DURATION = {
  fast: 100,
  normal: 300,
  slow: 500,
};
