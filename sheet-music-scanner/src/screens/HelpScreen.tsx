import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';

interface HelpScreenProps {
  navigation: any;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ navigation }) => {
  React.useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const FAQItem: React.FC<{ question: string; answer: string }> = ({
    question,
    answer,
  }) => {
    const [expanded, setExpanded] = React.useState(false);

    return (
      <TouchableOpacity
        style={styles.faqItem}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.faqQuestion}>
          <Text style={styles.faqQuestionText}>{question}</Text>
          <MaterialIcons
            name={expanded ? 'expand-less' : 'expand-more'}
            size={24}
            color={COLORS.primary}
          />
        </View>
        {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Getting Started */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="start" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Getting Started</Text>
          </View>

          <View style={styles.faqContainer}>
            <FAQItem
              question="How do I scan sheet music?"
              answer="Open the app and tap 'Scan from Camera'. Position the sheet music in the frame, ensure good lighting, and press the capture button. You can then adjust the image before processing."
            />
            <FAQItem
              question="Can I import existing photos?"
              answer="Yes! Use 'Scan from Photos' to import images from your device's photo library, or 'Scan from Files' to open PDF documents or other music files."
            />
            <FAQItem
              question="How long does recognition take?"
              answer="Recognition typically takes 10-30 seconds depending on the complexity of the sheet music. Processing time varies based on image quality and the number of pages."
            />
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="lightbulb-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Features</Text>
          </View>

          <View style={styles.faqContainer}>
            <FAQItem
              question="What audio formats are supported?"
              answer="Tsali Scanner supports MIDI playback with various instrument soundfonts including Piano, Electric Piano, Strings, and more."
            />
            <FAQItem
              question="Can I edit playback speed?"
              answer="Yes! You can adjust playback speed from 0.5x to 2x during playback. This is useful for learning difficult passages at a slower speed."
            />
            <FAQItem
              question="Is there a metronome?"
              answer="Yes, there's a built-in metronome that can be enabled during playback. You can adjust the tempo to match the piece."
            />
          </View>
        </View>

        {/* Troubleshooting */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="build" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Troubleshooting</Text>
          </View>

          <View style={styles.faqContainer}>
            <FAQItem
              question="Recognition quality is poor"
              answer="Ensure good lighting, clear images without shadows, and that the sheet music is straight and fully within the frame. Higher quality images produce better results."
            />
            <FAQItem
              question="Audio playback is choppy"
              answer="Try closing other apps to free up memory. You can also reduce other apps running in the background."
            />
            <FAQItem
              question="Camera permission denied"
              answer="Go to your device settings, find Tsali Scanner, and enable Camera permission. Then restart the app."
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need More Help?</Text>

          <TouchableOpacity
            style={styles.supportOption}
            onPress={() => Linking.openURL('mailto:support@pezkin.dev')}
          >
            <MaterialIcons name="email" size={24} color={COLORS.primary} />
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Email Support</Text>
              <Text style={styles.supportSubtitle}>support@pezkin.dev</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportOption}
            onPress={() => Linking.openURL('https://pezkin.dev')}
          >
            <MaterialIcons name="language" size={24} color={COLORS.primary} />
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Visit Our Website</Text>
              <Text style={styles.supportSubtitle}>pezkin.dev</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportOption}
            onPress={() => Linking.openURL('https://github.com/pezkin-dev/tsali-scanner')}
          >
            <MaterialIcons name="code" size={24} color={COLORS.primary} />
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>GitHub Repository</Text>
              <Text style={styles.supportSubtitle}>Report issues & request features</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pro Tips</Text>

          <View style={styles.tipsList}>
            <TipItem icon="info" text="Use good lighting to improve recognition accuracy" />
            <TipItem icon="photo-camera" text="Keep the camera straight and parallel to the sheet" />
            <TipItem icon="speed" text="Process one page at a time for best results" />
            <TipItem icon="library-music" text="Organize your scans with custom titles and notes" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const TipItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.tipItem}>
    <View style={styles.tipIcon}>
      <MaterialIcons name={icon} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.tipText}>{text}</Text>
  </View>
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
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  faqContainer: {
    gap: SPACING.md,
  },
  faqItem: {
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  faqQuestionText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    flex: 1,
    fontWeight: '600',
  },
  faqAnswer: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    lineHeight: 20,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '600',
  },
  supportSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tipsList: {
    gap: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(26, 115, 232, 0.08)',
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    flex: 1,
  },
});

export default HelpScreen;
