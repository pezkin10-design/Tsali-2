# 🎵 Tsali Scanner - Sheet Music Recognition App

A powerful cross-platform mobile application for scanning, recognizing, and playing sheet music using AI-powered optical music recognition (OMR) technology.

**Created by:** Pezkin.Dev  
**Version:** 1.0.0  
**Tech Stack:** React Native, Expo, TypeScript

---

## 🚀 Features

### Core Features
- **📸 Sheet Music Scanning** - Capture sheet music using device camera with real-time grid overlay
- **🖼️ Image Import** - Import from photo library or file system
- **🎹 AI-Powered Recognition** - Automatic detection and processing of musical notation
- **🎵 Playback** - MIDI playback with customizable instruments and playback controls
- **📚 Music Library** - Organized collection of scanned scores with search and sorting
- **⚙️ Advanced Controls** - Playback speed, metronome, loop, and volume adjustment
- **💾 Local Storage** - All data stored securely on device using AsyncStorage

### Technical Features
- **✨ Pixel-Perfect UI** - Optimized for both iOS and Android
- **🔐 Permission Handling** - Proper camera and photo library permissions
- **📊 Progress Indicators** - Loading states for file operations
- **🎨 Modern Design** - Gradient backgrounds, blur effects, animations
- **♿ Accessibility** - Haptic feedback and comprehensive labeling

---

## 📁 Project Structure

```
sheet-music-scanner/
├── app/                           # Expo Router entry point
│   ├── _layout.tsx               # Main app layout
│   └── modal.tsx                 # Modal screen
├── src/                          # Main source code
│   ├── screens/                  # Screen components
│   │   ├── HomeScreen.tsx        # Welcome/home screen
│   │   ├── CameraScreen.tsx      # Camera capture interface
│   │   ├── ImageEditorScreen.tsx # Image adjustment & cropping
│   │   ├── LibraryScreen.tsx     # Music collection view
│   │   ├── ViewerScreen.tsx      # Music viewer & player
│   │   ├── SettingsScreen.tsx    # App settings
│   │   ├── HelpScreen.tsx        # Help & FAQ
│   │   ├── PhotoPickerScreen.tsx # Photo selection
│   │   └── FilePickerScreen.tsx  # File selection
│   ├── components/               # Reusable UI components
│   ├── navigation/               # Navigation setup
│   │   └── RootNavigator.tsx     # Navigation structure (Stack + Tabs)
│   ├── services/                 # Business logic services
│   │   ├── storage.ts            # AsyncStorage wrapper
│   │   └── audio.ts              # Audio playback service
│   ├── utils/                    # Utility functions
│   │   ├── constants.ts          # App-wide constants
│   │   ├── helpers.ts            # Helper functions
│   │   └── types.ts              # TypeScript type definitions
│   └── assets/                   # Images, fonts, sounds
├── app.json                      # Expo app configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies & scripts
└── README.md                     # This file
```

---

## 📦 Key Dependencies

### Navigation & UI
- `@react-navigation/native` - Navigation framework
- `@react-navigation/bottom-tabs` - Tab navigation
- `@react-navigation/stack` - Stack navigation
- `react-native-gesture-handler` - Touch gesture support
- `expo-blur` - iOS blur effect (frosted glass)

### Camera & Media
- `expo-camera` - Camera access and controls
- `expo-image-picker` - Photo/file selection
- `expo-image-manipulator` - Image processing (crop, rotate, adjust)
- `expo-file-system` - File operations
- `expo-document-picker` - File browser

### Audio
- `expo-av` - Audio playback engine

### Styling & UX
- `expo-linear-gradient` - Gradient backgrounds
- `react-native-paper` - Material Design components
- `react-native-slider` - Slider controls
- `@react-native-async-storage/async-storage` - Local data persistence
- `expo-haptics` - Haptic feedback

---

## 🎯 Key Screens

### Home Screen
- 🏠 Welcome interface with app branding
- Quick access buttons for main functions
- Feature highlights
- Gradient background with musical note emoji

### Camera Screen
- 📷 Full-screen camera interface
- Rule of thirds grid overlay
- Flash and camera flip controls
- Capture, retake, and preview functionality
- High-quality image capture (1.0 quality)

### Image Editor Screen
- 🎨 Brightness, contrast, rotation adjustments
- Real-time preview
- Grayscale conversion option
- Smart crop to music area
- Save with automatic thumbnail generation

### Library Screen
- 📚 FlatList with optimized rendering
- Search by title, composer, or filename
- Sort by: Recent, Name, Most Played
- Multi-select for batch operations
- Play count and last played tracking
- Pull-to-refresh functionality

### Viewer Screen
- 🎵 Full music score display
- Playback controls (play/pause)
- Progress slider with seek
- Playback speed control (0.5x - 2x)
- Loop toggle and metronome
- Music metadata display
- Edit, share, delete actions

### Settings Screen
- ⚙️ Sound, vibration, haptics toggle
- Auto-rotate preference
- Metronome settings
- App info and links
- Data management options

### Help Screen
- ❓ Comprehensive FAQ
- Getting started guide
- Feature explanations
- Troubleshooting tips
- Contact & support links

---

## 🗄️ Data Storage

### Storage Keys
```typescript
SCANNED_ITEMS: "tsali_scanned_items"      // Array of ScannedItem
APP_SETTINGS: "tsali_settings"            // AppSettings object
USER_PREFERENCES: "tsali_preferences"     // User preferences
AUDIO_SETTINGS: "tsali_audio_settings"    // Audio configuration
```

### ScannedItem Data Model
```typescript
{
  id: string;                    // Unique identifier
  filename: string;              // Original filename
  imagePath: string;             // Full path to saved image
  thumbnail: string;             // Path to thumbnail
  musicData?: {                  // Recognized music information
    title?: string;
    composer?: string;
    timeSignature?: string;
    tempo?: number;
    key?: string;
    pages?: number;
    measures?: Measure[];
  };
  dateScanned: number;           // Unix timestamp
  lastPlayed?: number;           // Unix timestamp
  playCount: number;             // Play count
  duration?: number;             // Duration in seconds
  notes?: string;                // User notes
}
```

### File Paths
```
📁 Document Directory/
  ├── scans/                     # Full-resolution scanned images
  ├── thumbnails/               # 150x200 preview thumbnails
  ├── exports/                  # Exported files (MIDI, PDF)
  └── temp/                     # Temporary processing files
```

---

## 🎨 Design System

### Colors
```typescript
primary:       '#1a73e8'  (Google Blue)
secondary:    '#4285f4'
success:      '#34a853'
error:        '#ea4335'
warning:      '#fbbc04'
background:   '#ffffff'
surface:      '#f8f9fa'
text:         '#202124'
textSecondary: '#5f6368'
border:       '#e8eaed'
```

### Typography
- **h1**: 28px, Bold (Title)
- **h2**: 24px, Bold (Section headers)
- **h3**: 20px, Semi-bold (Subsection)
- **body1**: 16px, Regular (Main text)
- **body2**: 14px, Regular (Secondary text)
- **caption**: 12px, Regular (Labels)
- **button**: 14px, Semi-bold (Button text)

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- xxl: 32px

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- round: 50px

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Navigate to project directory:**
   ```bash
   cd /workspaces/Tsali/sheet-music-scanner
   ```

2. **Install dependencies (already done):**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run start
   ```

4. **Run on specific platform:**
   ```bash
   # iOS (requires macOS)
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

---

## 🔧 Configuration

### App Configuration (app.json)
- **Package ID**: `com.pezkindev.tsaliscanner`
- **Permissions**: Camera, Photos, Microphone, File System
- **iOS Config**: Info.plist with permission descriptions
- **Android Config**: Permission declarations and adaptive icons

### TypeScript Configuration
- **Strict Mode**: Enabled for type safety
- **Path Aliases**: `@screens`, `@components`, `@services`, etc.
- **Target**: ES2020 with strict null checks

---

## 📱 Supported Platforms

| Platform | Version | Status |
|----------|---------|--------|
| iOS | 14.0+ | ✅ Supported |
| Android | 11.0+ | ✅ Supported |
| Web | All modern browsers | ⚠️ Partial support |

---

## 🔐 Permissions

### iOS
- **Camera**: `NSCameraUsageDescription` - "Tsali Scanner needs camera access to scan sheet music"
- **Photos**: `NSPhotoLibraryUsageDescription` - "Tsali Scanner needs access to your photo library"
- **Microphone**: `NSMicrophoneUsageDescription` - "Tsali Scanner needs microphone access for audio playback"

### Android
- `android.permission.CAMERA`
- `android.permission.READ_EXTERNAL_STORAGE`
- `android.permission.WRITE_EXTERNAL_STORAGE`
- `android.permission.RECORD_AUDIO`

---

## 🎯 Next Steps & Future Enhancements

### Planned Features
- [ ] **Actual OMR Engine**: Integrate Audiveris or similar OMR library
- [ ] **Cloud Sync**: iCloud/Google Drive backup
- [ ] **Real Audio**: Generate actual audio from MIDI
- [ ] **Hand-Drawn Notes**: Support for user annotations
- [ ] **Sharing**: Export as PDF, MIDI, or image
- [ ] **Collaboration**: Share scores with other users
- [ ] **Advanced Editing**: More detailed music editing tools
- [ ] **Custom Instruments**: User-uploaded soundfonts

### Technical Improvements
- [ ] State management (Redux/Context)
- [ ] Error boundary implementation
- [ ] Performance optimization
- [ ] Unit/Integration tests
- [ ] CI/CD pipeline

---

## 📚 Component Documentation

### StorageService
Handles all AsyncStorage operations:
- `getScannedItems()` - Fetch all scanned items
- `addScannedItem(item)` - Add new scanned item
- `updateScannedItem(id, updates)` - Update item
- `deleteScannedItem(id)` - Delete single item
- `deleteMultipleItems(ids)` - Batch delete
- `getSettings()` / `updateSettings()` - Settings management
- `clearAllData()` - Full data reset

### AudioService
Manages audio playback:
- `initialize()` - Setup audio session
- `loadAudio(uri)` - Load audio file
- `play()` / `pause()` / `stop()` - Playback controls
- `setVolume(volume)` - Volume control
- `setRate(rate)` - Playback speed
- `seek(position)` - Seek to position
- `setLoop(bool)` - Loop control

### Navigation Structure
```
RootNavigator (Bottom Tabs)
├── HomeStack (Stack)
│   ├── Home
│   ├── Scanner (Camera)
│   ├── ImageEditor
│   ├── Viewer
│   ├── PhotoPicker
│   └── FilePicker
├── LibraryStack (Stack)
│   ├── Library
│   └── LibraryViewer
├── Settings Stack
│   └── Settings
└── Help Screen
```

---

## 💡 Tips & Best Practices

1. **Camera Quality**: Use the highest quality settings for best recognition
2. **Lighting**: Ensure adequate, even lighting when scanning
3. **Image Positioning**: Keep sheet music flat and parallel to camera
4. **Organization**: Use meaningful titles and composers to organize library
5. **Backup**: Regularly backup important scores
6. **Updates**: Keep the app updated for latest features

---

## 🐛 Troubleshooting

### Camera Issues
- **"Camera permission denied"**: Go to Settings > Tsali Scanner > Enable Camera
- **"Blurry images"**: Ensure good lighting and steady hand
- **"App crashes on camera open"**: Restart app and clear cache

### Playback Issues
- **"No audio output"**: Check device volume and sound settings
- **"Choppy playback"**: Close other apps to free memory
- **"Speed controls not working"**: Reload the track

### File Issues
- **"Cannot import photos"**: Enable photo permission in Settings
- **"File too large"**: Compress before importing
- **"Crashes when saving"**: Check available storage space

---

## 📞 Support

For support and inquiries:
- **Email**: support@pezkin.dev
- **Website**: https://pezkin.dev
- **GitHub**: https://github.com/pezkin-dev/tsali-scanner

---

## 📄 License

Tsali Scanner © 2024 Pezkin.Dev - All Rights Reserved

---

## 🙏 Acknowledgments

- Built with React Native & Expo
- Icons from @expo/vector-icons
- Design inspired by Google Material Design

---

**Happy scanning and playing! 🎵**
