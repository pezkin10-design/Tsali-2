import React, { useEffect } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@utils/constants';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleNavigation = (screen: string) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a73e8', '#4285f4', '#5b9ff5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="music-box" size={48} color="white" />
            <Text style={styles.title}>Tsali Scanner</Text>
            <Text style={styles.subtitle}>
              Transform sheet music into playable audio with AI-powered recognition
            </Text>
          </View>

          {/* Main Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Scan from Camera */}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => handleNavigation('Scanner')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#1a73e8', '#1557b0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <MaterialIcons name="camera-alt" size={28} color="white" />
                <Text style={styles.primaryButtonText}>SCAN FROM CAMERA</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Scan from Photos */}
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => handleNavigation('PhotoPicker')}
              activeOpacity={0.85}
            >
              <View style={styles.secondaryButtonContent}>
                <MaterialIcons name="photo-library" size={28} color={COLORS.primary} />
                <Text style={styles.secondaryButtonText}>SCAN FROM PHOTOS</Text>
              </View>
            </TouchableOpacity>

            {/* Scan from Files */}
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => handleNavigation('FilePicker')}
              activeOpacity={0.85}
            >
              <View style={styles.secondaryButtonContent}>
                <FontAwesome5 name="file-upload" size={24} color={COLORS.primary} />
                <Text style={styles.secondaryButtonText}>SCAN FROM FILES</Text>
              </View>
            </TouchableOpacity>

            {/* Browse Library */}
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => handleNavigation('Library')}
              activeOpacity={0.85}
            >
              <View style={styles.secondaryButtonContent}>
                <MaterialCommunityIcons name="folder-music" size={28} color={COLORS.primary} />
                <Text style={styles.secondaryButtonText}>BROWSE SCANNED MUSIC</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Feature Highlights */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Features</Text>
            <View style={styles.featuresList}>
              <FeatureItem icon="music-note" text="AI-Powered Music Recognition" />
              <FeatureItem icon="play-circle" text="Instant Playback" />
              <FeatureItem icon="save" text="Organize & Save" />
              <FeatureItem icon="share" text="Share & Export" />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: 'white',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.md,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
    lineHeight: 20,
  },
  buttonsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  button: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButton: {
    height: 60,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.button,
    color: 'white',
    fontWeight: '700',
  },
  secondaryButton: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  secondaryButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary,
    fontWeight: '700',
  },
  featuresContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  featuresTitle: {
    ...TYPOGRAPHY.h3,
    color: 'white',
    marginBottom: SPACING.md,
  },
  featuresList: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    backdropFilter: 'blur(10px)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureText: {
    ...TYPOGRAPHY.body2,
    color: 'white',
    fontWeight: '500',
  },
});

export default HomeScreen;
