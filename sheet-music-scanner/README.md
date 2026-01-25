# 🎵 Tsali Scanner - Sheet Music Recognition App

A powerful cross-platform mobile application for scanning, recognizing, and playing sheet music using AI-powered optical music recognition (OMR) technology.

**Version**: 1.0.0  
**Tech Stack**: React Native, Expo, TypeScript  
**Status**: 🚀 In Active Development

---

## ✨ Features

### Core Features
- 📸 **Sheet Music Scanning** - Capture with real-time grid overlay
- 🖼️ **Image Import** - Photo library and file system support
- 🎹 **AI-Powered Recognition** - Automatic music detection
- 🎵 **Playback** - MIDI playback with controls
- 📚 **Music Library** - Organized score collection
- ⚙️ **Advanced Controls** - Speed, metronome, loop controls

### Tier 2 - Export & Recognition (New!)
- 📥 **Multi-Format Export**
  - MIDI (.mid) - For sequencers and DAWs
  - MusicXML (.musicxml) - For notation software
  - JSON - For developers and integration
- 🎯 **Optical Music Recognition**
  - Cloud-based processing
  - Confidence scoring
  - Validation system
  - Fallback mock data for development

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app (mobile testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/quantumtier/Tsali.git
cd Tsali/sheet-music-scanner

# Install dependencies
npm install

# Start development server
npm run start
```

### Running on Device

**Option A - Expo Go (Easiest)**
```bash
npm run start
# Scan QR code with Expo Go app
```

**Option B - iOS Simulator**
```bash
npm run ios
```

**Option C - Android Emulator**
```bash
npm run android
```

---

## 📁 Project Structure

```
sheet-music-scanner/
├── src/
│   ├── screens/           # App screens
│   ├── components/        # Reusable components
│   ├── services/          # Business logic
│   │   ├── export.ts     # Export functionality
│   │   ├── omr.ts        # Music recognition
│   │   ├── storage.ts    # Data persistence
│   │   └── audio.ts      # Audio playback
│   ├── navigation/        # Navigation setup
│   ├── utils/            # Utilities
│   └── assets/           # Images, fonts, sounds
├── index.js              # App entry point
└── package.json
```

---

## 🔧 Available Scripts

```bash
npm run start      # Start development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run on web browser
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

---

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - Setup and running guide
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Detailed project documentation
- [TIER2_COMPLETE.md](./TIER2_COMPLETE.md) - Export and OMR features
- [TIER2_SUMMARY.md](./TIER2_SUMMARY.md) - Implementation summary
- [FILE_MANIFEST.md](./FILE_MANIFEST.md) - File descriptions
- [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) - Build notes

---

## 🔑 API Configuration

### OMR API Setup

To enable cloud music recognition, set environment variables:

```bash
EXPO_PUBLIC_OMR_API_URL=https://your-omr-api.com/api/recognize
EXPO_PUBLIC_OMR_API_KEY=your-api-key
```

**Development Mode**: Uses mock data if API not configured

---

## 🏗️ Architecture

### Services
- **ExportService**: MIDI, MusicXML, JSON export
- **OMRService**: Cloud-based music recognition
- **StorageService**: Local data persistence
- **AudioService**: MIDI playback

### Navigation
- Bottom tab navigation (Home, Library, Settings, Help)
- Stack navigation for detailed screens
- Native navigation with animations

### State Management
- React hooks (useState, useContext)
- Async storage for persistence
- Local component state for UI

---

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Lint code
npm run lint

# Run tests (when available)
npm test
```

---

## 🔐 Permissions

The app requires the following permissions:
- **Camera**: For sheet music scanning
- **Photo Library**: For importing images
- **Microphone**: For audio playback
- **File System**: For document access

All permissions are properly handled with user prompts.

---

## 🎨 Design System

- **Colors**: Google's Material Design palette
- **Typography**: Structured font hierarchy
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable UI elements
- **Animations**: Smooth transitions and effects

---

## 📦 Dependencies

**Key Libraries**
- `react-native` - Mobile framework
- `expo` - Development platform
- `@react-navigation` - Navigation
- `expo-camera` - Camera access
- `expo-av` - Audio/video playback
- `react-native-gesture-handler` - Gestures
- `midi-file` - MIDI generation
- `@gorhom/bottom-sheet` - Modal sheets

---

## 🚀 Roadmap

### Tier 1 (Core)
- ✅ Camera scanning
- ✅ Image editing
- ✅ Music library
- ✅ Playback controls

### Tier 2 (Export & Recognition)
- ✅ MIDI export
- ✅ MusicXML export
- ✅ Cloud OMR
- ✅ Confidence scoring

### Tier 3 (Polish & Features)
- 🔄 Animations & gestures
- 🔄 Cloud sync (Google Drive, Dropbox)
- 🔄 Platform-specific features
- 🔄 On-device ML (TensorFlow Lite)

---

## 🤝 Contributing

This project is part of the Tsali Suite. For contributions:
1. Create a feature branch
2. Make your changes
3. Submit a pull request

---

## 📄 License

Proprietary - Created by Pezkin.Dev

---

## 👥 Authors

- **Pezkin.Dev** - Lead Developer

---

## 🆘 Support

For issues and questions:
- Check [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
- Review [QUICK_START.md](./QUICK_START.md)
- Check existing GitHub issues

---

## ✅ Status

**Current Version**: 1.0.0  
**Development Status**: Active  
**Last Updated**: January 2026

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
