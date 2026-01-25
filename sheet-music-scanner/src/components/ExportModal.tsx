import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';
import { MusicData } from '@utils/types';
import ExportService, { ExportFormat } from '@services/export';

interface ExportModalProps {
  isVisible: boolean;
  musicData: MusicData | null;
  onClose: () => void;
  onExportSuccess: (filepath: string, format: ExportFormat) => void;
}

interface ExportOption {
  id: ExportFormat;
  title: string;
  description: string;
  icon: string;
  fileSize: string;
  quality?: 'low' | 'medium' | 'high';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isVisible,
  musicData,
  onClose,
  onExportSuccess,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  if (!isVisible || !musicData) return null;

  const exportOptions: ExportOption[] = [
    {
      id: 'midi',
      title: 'MIDI',
      description: 'Standard music format for sequencers and DAWs',
      icon: 'music-note',
      fileSize: ExportService.getEstimatedFileSize(musicData, 'midi'),
      quality: 'high',
    },
    {
      id: 'musicxml',
      title: 'MusicXML',
      description: 'Editable sheet music format',
      icon: 'description',
      fileSize: ExportService.getEstimatedFileSize(musicData, 'musicxml'),
      quality: 'high',
    },
    {
      id: 'json',
      title: 'JSON',
      description: 'Raw music data for development',
      icon: 'code',
      fileSize: ExportService.getEstimatedFileSize(musicData, 'json'),
      quality: 'high',
    },
  ];

  const handleExport = async (format: ExportFormat) => {
    if (!musicData) return;

    try {
      setIsExporting(true);
      setExportProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + Math.random() * 30, 90));
      }, 300);

      const filepath = await ExportService.export(musicData, { format });

      clearInterval(progressInterval);
      setExportProgress(100);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert('Export Successful', `File saved: ${format.toUpperCase()}`, [
        {
          text: 'Share',
          onPress: () => shareFile(filepath),
        },
        {
          text: 'Done',
          onPress: () => {
            onExportSuccess(filepath, format);
            setTimeout(() => onClose(), 300);
          },
        },
      ]);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Export Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const shareFile = async (filepath: string) => {
    try {
      await ExportService.shareFile(filepath);
      onClose();
    } catch (error) {
      Alert.alert('Share Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const renderExportOption = ({ item }: { item: ExportOption }) => (
    <TouchableOpacity
      style={[
        styles.optionCard,
        selectedFormat === item.id && styles.optionCardSelected,
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        setSelectedFormat(item.id);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.optionHeader}>
        <View
          style={[
            styles.optionIconContainer,
            selectedFormat === item.id && styles.optionIconContainerSelected,
          ]}
        >
          <MaterialIcons name={item.icon as any} size={28} color={COLORS.primary} />
        </View>
        <View style={styles.optionTitleContainer}>
          <Text style={styles.optionTitle}>{item.title}</Text>
          <Text style={styles.optionDescription}>{item.description}</Text>
        </View>
      </View>

      <View style={styles.optionFooter}>
        <Text style={styles.fileSize}>{item.fileSize}</Text>
        {item.quality && (
          <View style={styles.qualityBadge}>
            <Text style={styles.qualityText}>{item.quality.toUpperCase()}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <BottomSheet snapPoints={[300, 600]} onClose={onClose} enablePanDownToClose>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Export Score</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {isExporting ? (
          <View style={styles.exportingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.exportingText}>Exporting...</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${exportProgress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(exportProgress)}%</Text>
          </View>
        ) : (
          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            <FlatList
              data={exportOptions}
              renderItem={renderExportOption}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {selectedFormat && (
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => handleExport(selectedFormat)}
              >
                <MaterialIcons name="file-download" size={20} color="white" />
                <Text style={styles.exportButtonText}>
                  Export as {selectedFormat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: SPACING.lg,
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
  closeButton: {
    padding: SPACING.sm,
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  optionCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionIconContainerSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  optionTitleContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  optionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  fileSize: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  qualityBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  qualityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    color: 'white',
  },
  separator: {
    height: SPACING.xs,
  },
  exportingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  exportingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  exportButtonText: {
    color: 'white',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default ExportModal;
