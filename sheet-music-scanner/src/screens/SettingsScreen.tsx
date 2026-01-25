import React, { useEffect } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StorageService } from '@services/storage';
import { AppSettings } from '@utils/types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, DEFAULT_SETTINGS } from '@utils/constants';
import { ErrorHandler, ErrorCategory } from '@utils/errorHandler';
import * as Haptics from 'expo-haptics';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeModal, setActiveModal] = React.useState<'about' | 'privacy' | 'terms' | null>(null);

  useEffect(() => {
    loadSettings();
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const loadSettings = async () => {
    try {
      const loadedSettings = await StorageService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    try {
      setSettings((prev) => ({ ...prev, [key]: value }));
      await StorageService.updateSettings({ [key]: value });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const resetSettings = async () => {
    try {
      await StorageService.resetSettings();
      setSettings(DEFAULT_SETTINGS);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      console.error('Error resetting settings:', appError.userMessage);
    }
  };

  const deleteAllData = async () => {
    try {
      await StorageService.clearAllData();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'All data has been deleted.', [
        { text: 'OK' }
      ]);
      // Reset settings to default
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      const appError = ErrorHandler.handle(error, ErrorCategory.STORAGE);
      console.error('Error deleting data:', appError.userMessage);
      Alert.alert('Error', appError.userMessage);
    }
  };

  const confirmDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your scanned music, library, and preferences. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: deleteAllData,
          style: 'destructive',
        },
      ]
    );
  };

  const SettingToggle: React.FC<{
    icon: string;
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }> = ({ icon, label, value, onChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLabel}>
        <MaterialIcons name={icon as any} size={24} color={COLORS.primary} />
        <Text style={styles.settingLabelText}>{label}</Text>
      </View>
      <TouchableOpacity
        style={[styles.toggle, value && styles.toggleActive]}
        onPress={() => onChange(!value)}
      >
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>
          <SettingToggle
            icon="volume-up"
            label="Sound Enabled"
            value={settings.soundEnabled}
            onChange={(value) => updateSetting('soundEnabled', value)}
          />
          <SettingToggle
            icon="vibration"
            label="Vibration"
            value={settings.vibration}
            onChange={(value) => updateSetting('vibration', value)}
          />
          <SettingToggle
            icon="touch-app"
            label="Haptic Feedback"
            value={settings.haptics}
            onChange={(value) => updateSetting('haptics', value)}
          />
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          <SettingToggle
            icon="screen-lock-rotation"
            label="Auto Rotate"
            value={settings.autoRotate}
            onChange={(value) => updateSetting('autoRotate', value)}
          />
        </View>

        {/* Playback Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          <SettingToggle
            icon="music-note"
            label="Metronome"
            value={settings.metronomeEnabled}
            onChange={(value) => updateSetting('metronomeEnabled', value)}
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setActiveModal('about')}
          >
            <View style={styles.optionLabel}>
              <MaterialIcons name="info" size={24} color={COLORS.primary} />
              <Text style={styles.optionLabelText}>About Tsali Scanner</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setActiveModal('privacy')}
          >
            <View style={styles.optionLabel}>
              <MaterialIcons name="privacy-tip" size={24} color={COLORS.primary} />
              <Text style={styles.optionLabelText}>Privacy Policy</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setActiveModal('terms')}
          >
            <View style={styles.optionLabel}>
              <MaterialIcons name="description" size={24} color={COLORS.primary} />
              <Text style={styles.optionLabelText}>Terms of Service</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleDanger]}>Danger Zone</Text>
          <TouchableOpacity
            style={[styles.dangerButton, styles.resetButton]}
            onPress={resetSettings}
          >
            <MaterialIcons name="refresh" size={20} color={COLORS.warning} />
            <Text style={styles.dangerButtonText}>Reset All Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dangerButton, styles.deleteButton]}
            onPress={confirmDeleteAllData}
          >
            <MaterialIcons name="delete-forever" size={20} color={COLORS.error} />
            <Text style={[styles.dangerButtonText, styles.deleteButtonText]}>
              Delete All Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.footerContainer}>
          <Text style={styles.versionText}>Tsali Scanner v1.0.0</Text>
          <Text style={styles.createdByText}>Created by Pezkin.Dev</Text>
        </View>
      </ScrollView>

      {/* About Modal */}
      <SettingsModal
        visible={activeModal === 'about'}
        title="About Tsali Scanner"
        onClose={() => setActiveModal(null)}
      >
        <Text style={styles.modalText}>
          Tsali Scanner is an offline sheet music recognition application powered by TensorFlow Lite and AI.
        </Text>
        <Text style={styles.modalSubText}>Features:</Text>
        <Text style={styles.modalText}>
          • Real-time sheet music recognition{'\n'}
          • Offline processing - no internet required{'\n'}
          • Export to MIDI, MusicXML, and JSON{'\n'}
          • Built-in MIDI playback{'\n'}
          • Organize and manage your scans{'\n'}
          • Full privacy - all data stays on your device
        </Text>
        <Text style={styles.modalSubText}>Version:</Text>
        <Text style={styles.modalText}>1.0.0</Text>
        <Text style={styles.modalSubText}>© 2024 Pezkin.Dev</Text>
      </SettingsModal>

      {/* Privacy Policy Modal */}
      <SettingsModal
        visible={activeModal === 'privacy'}
        title="Privacy Policy"
        onClose={() => setActiveModal(null)}
      >
        <Text style={styles.modalText}>
          {`At Tsali Scanner, your privacy is our top priority. Here's what you should know:

Data Processing: All sheet music recognition happens locally on your device. We do not send any data to external servers.

Local Storage: Your scanned music, settings, and preferences are stored only on your device using secure local storage.

No Tracking: We do not track, collect, or share any personal information, usage data, or analytics.

Permissions: The app requests camera and photo library permissions only for scanning sheet music.

Data Control: You have complete control over your data. You can delete all data at any time using the "Delete All Data" option.

Contact: For privacy concerns, please contact us at privacy@pezkin.dev`}
        </Text>
      </SettingsModal>

      {/* Terms of Service Modal */}
      <SettingsModal
        visible={activeModal === 'terms'}
        title="Terms of Service"
        onClose={() => setActiveModal(null)}
      >
        <Text style={styles.modalText}>
          {`1. Use License
You are granted a non-exclusive, non-transferable license to use Tsali Scanner for personal, non-commercial purposes.

2. Disclaimer
Tsali Scanner is provided "as is" without warranty. AI-based sheet music recognition may not be 100% accurate. Always verify results before using in professional contexts.

3. User Responsibility
You are responsible for obtaining the necessary rights to scan sheet music and use the outputs.

4. Limitation of Liability
In no event shall Pezkin.Dev be liable for any damages arising from the use of Tsali Scanner.

5. Changes to Terms
We reserve the right to modify these terms. Continued use of the app constitutes acceptance of new terms.

6. Contact
For questions about these terms, contact legal@pezkin.dev`}
        </Text>
      </SettingsModal>
    </SafeAreaView>
  );
};

/**
 * Settings Modal Component
 */
const SettingsModal: React.FC<{
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ visible, title, onClose, children }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalBody}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingVertical: SPACING.lg,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionTitleDanger: {
    color: COLORS.error,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  settingLabelText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  optionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  optionLabelText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  resetButton: {
    backgroundColor: 'rgba(251, 188, 4, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  deleteButton: {
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  dangerButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.warning,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: COLORS.error,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  versionText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
  },
  createdByText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  modalText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  modalSubText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  modalButtonText: {
    ...TYPOGRAPHY.button,
    color: 'white',
    fontWeight: '600',
  },
});

export default SettingsScreen;
