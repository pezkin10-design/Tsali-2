# Phase 2 Integration Guide - UI Screens

**Objective**: Integrate TFLite OMRService into existing React Native screens  
**Estimated Time**: 3-4 days  
**Status**: Ready to implement

---

## Overview

This guide shows exactly how to integrate the new OMRService into:
1. ✅ CameraScreen.tsx - Add OMR processing after photo capture
2. ✅ ViewerScreen.tsx - Display OMR results with playback
3. ✅ LibraryScreen.tsx - Show offline badges and optimize performance
4. ✅ Create MIDIService.ts - Audio playback

---

## 4️⃣ CameraScreen.tsx Integration

**Current File**: `src/screens/CameraScreen.tsx` (342 lines)  
**Status**: Camera ✅ - Needs OMR integration  
**Time**: 2-3 hours

### Changes Required

```typescript
// ADD these imports at top
import OMRService from '@services/omr-tflite';
import { ActivityIndicator, Modal } from 'react-native';

// ADD state management
const [omrProcessing, setOmrProcessing] = useState(false);
const [omrProgress, setOmrProgress] = useState(0);
const [omrMessage, setOmrMessage] = useState('');
const [omrResult, setOmrResult] = useState<any>(null);

// ADD initialization
useEffect(() => {
  const initOMR = async () => {
    try {
      await OMRService.initialize((message) => {
        console.log('OMR Init:', message);
      });
    } catch (error) {
      console.error('OMR init failed:', error);
      Alert.alert('Setup Error', 'Failed to initialize music recognition');
    }
  };
  
  initOMR();
  
  return () => {
    OMRService.close();
  };
}, []);

// UPDATE: After "Use Photo" button pressed
const handleUsePhoto = async () => {
  if (!previewImage) return;
  
  setOmrProcessing(true);
  setOmrProgress(0);
  setOmrMessage('Preparing image...');
  
  try {
    const result = await OMRService.scanSheetMusic(previewImage, {
      onProgress: (message: string, progress: number) => {
        setOmrMessage(message);
        setOmrProgress(progress);
      },
      returnDetails: true,
    });
    
    if (result.success && result.musicData) {
      // Save to storage before navigating
      const scanData = {
        id: Date.now().toString(),
        imageUri: previewImage,
        musicData: result.musicData,
        confidence: result.confidence || 0.75,
        dateScanned: Date.now(),
        processingTime: result.processingTime || 0,
        metadata: {
          noteCount: result.musicData.measures?.reduce(
            (sum, m) => sum + (m.notes?.length || 0), 0
          ) || 0,
          timeSignature: result.musicData.timeSignature,
          keySignature: result.musicData.key,
        },
      };
      
      // Store and navigate
      await StorageService.addScannedItem(scanData);
      navigation.navigate('Viewer', { scanId: scanData.id });
    } else {
      Alert.alert(
        'Recognition Failed',
        result.error || 'Could not recognize sheet music. Try another image.',
        [{ text: 'Retry', onPress: () => setPreviewImage(null) }]
      );
    }
  } catch (error) {
    console.error('OMR error:', error);
    Alert.alert('Error', 'Processing failed. Please try again.');
  } finally {
    setOmrProcessing(false);
  }
};

// ADD: Processing overlay UI
<Modal visible={omrProcessing} transparent animationType="fade">
  <View style={styles.omrOverlay}>
    <View style={styles.omrCard}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.omrMessage}>{omrMessage}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${omrProgress * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.omrProgress}>
        {Math.round(omrProgress * 100)}%
      </Text>
      <Text style={styles.omrSubtext}>Working offline · No internet</Text>
    </View>
  </View>
</Modal>

// ADD styles
const styles = StyleSheet.create({
  omrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  omrCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  omrMessage: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  progressBar: {
    marginTop: 16,
    width: '100%',
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  omrProgress: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  omrSubtext: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
});
```

---

## 5️⃣ ViewerScreen.tsx Enhancement

**Current File**: `src/screens/ViewerScreen.tsx` (500+ lines)  
**Status**: Display ✅ - Needs OMR metadata + playback  
**Time**: 2-3 hours

### Changes Required

```typescript
// ADD imports
import { ExportService } from '@services/export';
import MIDIService from '@services/MIDIService';

// ADD state
const [midiService] = useState(() => new MIDIService());
const [isPlaying, setIsPlaying] = useState(false);
const [playbackPosition, setPlaybackPosition] = useState(0);
const [playbackDuration, setPlaybackDuration] = useState(0);
const [playbackSpeed, setPlaybackSpeed] = useState(1);

// ADD: Display detected metadata
<View style={styles.metadataSection}>
  <Text style={styles.sectionTitle}>Detected Information</Text>
  
  {/* Confidence Score */}
  <View style={styles.metadataRow}>
    <Text style={styles.label}>Confidence:</Text>
    <View style={styles.confidenceBar}>
      <View
        style={[
          styles.confidenceFill,
          {
            width: `${(scan.confidence || 0) * 100}%`,
            backgroundColor:
              (scan.confidence || 0) > 0.8
                ? '#4CAF50'
                : (scan.confidence || 0) > 0.6
                ? '#FFC107'
                : '#F44336',
          },
        ]}
      />
    </View>
    <Text style={styles.value}>{((scan.confidence || 0) * 100).toFixed(0)}%</Text>
  </View>
  
  {/* Metadata Grid */}
  <View style={styles.metadataGrid}>
    <MetadataItem
      label="Time Signature"
      value={scan.metadata?.timeSignature || 'N/A'}
      icon="music-note"
    />
    <MetadataItem
      label="Key Signature"
      value={scan.metadata?.keySignature || 'N/A'}
      icon="music-note"
    />
    <MetadataItem
      label="Note Count"
      value={String(scan.metadata?.noteCount || 0)}
      icon="format-list-numbered"
    />
    <MetadataItem
      label="Processing Time"
      value={`${scan.processingTime || 0}ms`}
      icon="clock-outline"
    />
  </View>
</View>

// ADD: MIDI Playback Controls
<View style={styles.playbackSection}>
  <Text style={styles.sectionTitle}>Playback</Text>
  
  {/* Play/Pause Button */}
  <TouchableOpacity
    style={[styles.button, styles.playButton]}
    onPress={() => {
      if (isPlaying) {
        midiService.pause();
      } else {
        midiService.play();
      }
      setIsPlaying(!isPlaying);
    }}
  >
    <MaterialIcons
      name={isPlaying ? 'pause' : 'play-arrow'}
      size={32}
      color="#fff"
    />
  </TouchableOpacity>
  
  {/* Progress Slider */}
  <View style={styles.progressSection}>
    <Slider
      style={styles.slider}
      minimumValue={0}
      maximumValue={playbackDuration}
      value={playbackPosition}
      onValueChange={(value) => {
        midiService.seek(value);
        setPlaybackPosition(value);
      }}
      minimumTrackTintColor={COLORS.primary}
      maximumTrackTintColor="#ddd"
    />
    <Text style={styles.timeText}>
      {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
    </Text>
  </View>
  
  {/* Speed Control */}
  <View style={styles.speedControl}>
    {[0.5, 1, 1.5, 2].map((speed) => (
      <TouchableOpacity
        key={speed}
        style={[
          styles.speedButton,
          playbackSpeed === speed && styles.speedButtonActive,
        ]}
        onPress={() => {
          setPlaybackSpeed(speed);
          midiService.setPlaybackSpeed(speed);
        }}
      >
        <Text
          style={[
            styles.speedText,
            playbackSpeed === speed && styles.speedTextActive,
          ]}
        >
          {speed}x
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

// ADD: Export Options
<View style={styles.exportSection}>
  <Text style={styles.sectionTitle}>Export</Text>
  
  <View style={styles.exportButtons}>
    <TouchableOpacity
      style={styles.exportButton}
      onPress={async () => {
        try {
          const midi = await ExportService.exportToMIDI(scan.musicData);
          // Handle download/save
        } catch (error) {
          Alert.alert('Export Failed', String(error));
        }
      }}
    >
      <MaterialIcons name="download" size={20} color="#fff" />
      <Text style={styles.exportButtonText}>MIDI</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={styles.exportButton}
      onPress={async () => {
        try {
          const xml = await ExportService.exportToMusicXML(scan.musicData);
          // Handle download/save
        } catch (error) {
          Alert.alert('Export Failed', String(error));
        }
      }}
    >
      <MaterialIcons name="download" size={20} color="#fff" />
      <Text style={styles.exportButtonText}>MusicXML</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={styles.exportButton}
      onPress={async () => {
        try {
          const json = JSON.stringify(scan.musicData, null, 2);
          await Share.share({
            message: json,
            title: 'Music Data',
          });
        } catch (error) {
          Alert.alert('Share Failed', String(error));
        }
      }}
    >
      <MaterialIcons name="share" size={20} color="#fff" />
      <Text style={styles.exportButtonText}>Share</Text>
    </TouchableOpacity>
  </View>
</View>

// ADD: MetadataItem component
const MetadataItem = ({ label, value, icon }: any) => (
  <View style={styles.metadataItem}>
    <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} />
    <View style={styles.metadataText}>
      <Text style={styles.metadataLabel}>{label}</Text>
      <Text style={styles.metadataValue}>{value}</Text>
    </View>
  </View>
);

// ADD: Time formatter
const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// ADD: Styles
const styles = StyleSheet.create({
  metadataSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 0.4,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  confidenceFill: {
    height: '100%',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 50,
    textAlign: 'right',
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metadataItem: {
    flex: 0.48,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    marginLeft: 12,
    flex: 1,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#666',
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  playbackSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  speedControl: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  speedButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  speedText: {
    fontSize: 14,
    color: '#666',
  },
  speedTextActive: {
    color: '#fff',
  },
  exportSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
```

---

## 6️⃣ LibraryScreen.tsx Enhancement

**Current File**: `src/screens/LibraryScreen.tsx` (400+ lines)  
**Status**: List ✅ - Needs offline badges + optimization  
**Time**: 1-2 hours

### Key Changes

```typescript
// ADD: Offline badge to each item
const renderItem = ({ item }: any) => (
  <View>
    <Text style={styles.offlineBadge}>✓ Offline Scan</Text>
    {/* existing item content */}
  </View>
);

// OPTIMIZE: FlatList performance
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  windowSize={10}                    // ADD
  maxToRenderPerBatch={5}           // ADD
  updateCellsBatchingPeriod={50}   // ADD
  removeClippedSubviews={true}     // ADD
  scrollIndicatorInsets={{ right: 1 }}
/>

// ADD: Swipe actions (via react-native-gesture-handler)
// Can be enhanced with Swipeable component
```

---

## 7️⃣ MIDIService.ts - New File

**File**: `src/services/MIDIService.ts` (NEW)  
**Time**: 2-3 hours

```typescript
import { Audio } from 'expo-av';

export class MIDIService {
  private sound: Audio.Sound | null = null;
  private isPlaying = false;
  private currentPosition = 0;
  private duration = 0;
  private speed = 1;

  async loadMIDI(base64MIDIData: string): Promise<void> {
    try {
      // Decode base64 to binary
      const binaryString = atob(base64MIDIData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Save to file (using expo-file-system)
      const tempPath = `${FileSystem.cacheDirectory}temp.mid`;
      const base64 = btoa(String.fromCharCode(...bytes));
      await FileSystem.writeAsStringAsync(tempPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Load audio
      const { sound } = await Audio.Sound.createAsync({ uri: tempPath });
      this.sound = sound;

      // Get duration
      const status = await sound.getStatusAsync();
      this.duration = status.durationMillis || 0;
    } catch (error) {
      console.error('MIDI loading failed:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.sound) throw new Error('No MIDI loaded');
    await this.sound.playAsync();
    this.isPlaying = true;
  }

  async pause(): Promise<void> {
    if (!this.sound) throw new Error('No MIDI loaded');
    await this.sound.pauseAsync();
    this.isPlaying = false;
  }

  async seek(positionMs: number): Promise<void> {
    if (!this.sound) throw new Error('No MIDI loaded');
    await this.sound.setPositionAsync(positionMs);
    this.currentPosition = positionMs;
  }

  async setPlaybackSpeed(speed: number): Promise<void> {
    if (!this.sound) throw new Error('No MIDI loaded');
    this.speed = speed;
    await this.sound.setRateAsync(speed, true);
  }

  async cleanup(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

export default MIDIService;
```

---

## Integration Checklist

- [ ] **CameraScreen.tsx**
  - [ ] Import OMRService
  - [ ] Add OMR initialization in useEffect
  - [ ] Add processing state management
  - [ ] Implement handleUsePhoto with OMR call
  - [ ] Add processing overlay UI
  - [ ] Test with sample image

- [ ] **ViewerScreen.tsx**
  - [ ] Add OMR metadata display
  - [ ] Add confidence visualization
  - [ ] Implement MIDI playback controls
  - [ ] Add export buttons
  - [ ] Style metadata section
  - [ ] Test playback and export

- [ ] **LibraryScreen.tsx**
  - [ ] Add offline badges
  - [ ] Optimize FlatList performance
  - [ ] Add swipe actions
  - [ ] Test scroll performance

- [ ] **MIDIService.ts**
  - [ ] Create service class
  - [ ] Implement MIDI loading
  - [ ] Implement playback controls
  - [ ] Test audio playback

- [ ] **Testing**
  - [ ] Full scan-to-playback flow
  - [ ] Export functionality
  - [ ] Library performance
  - [ ] Error handling

---

## Key Integration Points

### 1. OMRService Initialization
```typescript
// App.tsx or first screen
useEffect(() => {
  const init = async () => {
    await OMRService.initialize();
  };
  init();
}, []);
```

### 2. Scan Workflow
```typescript
const result = await OMRService.scanSheetMusic(imageUri, {
  onProgress: (msg, progress) => {
    // Update UI with progress
  },
});

// Save result
await StorageService.addScannedItem({
  id: ...,
  imageUri: imageUri,
  musicData: result.musicData,
  confidence: result.confidence,
  ...
});
```

### 3. Display Result
```typescript
// In ViewerScreen
const scan = await StorageService.getScannedItem(scanId);

// Display metadata
<MetadataItem label="Confidence" value={`${scan.confidence}%`} />

// Play MIDI
await midiService.loadMIDI(scan.midi);
await midiService.play();
```

---

## Expected Outcome

After Phase 2:
- ✅ Complete offline sheet music recognition
- ✅ Beautiful UI with progress feedback
- ✅ MIDI playback with controls
- ✅ Multiple export formats
- ✅ Library management with offline indicator
- ✅ Fully functional production app

---

**Status**: Ready for implementation  
**Estimated completion**: 3-4 days  
**Next**: Phase 3 - Polish, testing, deployment prep
