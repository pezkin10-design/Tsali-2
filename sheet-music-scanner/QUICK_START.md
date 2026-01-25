# 🚀 Tsali Scanner - Quick Start Guide

## Installation & Setup

### 1. Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Expo Go app on your mobile device (or iOS/Android simulator)

### 2. Project Navigation
```bash
cd /workspaces/Tsali/sheet-music-scanner
```

### 3. Install Dependencies
Dependencies are already installed, but you can reinstall if needed:
```bash
npm install
```

### 4. Start Development Server
```bash
npm run start
```

This will display a QR code and connection options.

### 5. Run on Your Device/Simulator

**Option A - iOS Simulator (macOS only):**
```bash
npm run ios
```

**Option B - Android Emulator:**
```bash
npm run android
```

**Option C - Physical Device with Expo Go:**
1. Install Expo Go app on your iPhone or Android device
2. Scan the QR code displayed in terminal
3. App will load on your device

**Option D - Web Browser:**
```bash
npm run web
```

---

## 📁 Project Structure Reference

```
src/
├── screens/          # All screen components
├── services/         # Business logic (storage, audio)
├── navigation/       # Navigation setup
├── utils/           # Helpers, constants, types
└── assets/          # Images, fonts, sounds

app/
└── _layout.tsx      # Main app entry point
```

---

## 🎯 Main Features

### Home Screen
- Start scanning sheet music
- Select scanning method:
  - 📸 **Camera** - Real-time scanning
  - 🖼️ **Photos** - Import from device
  - 📄 **Files** - Import PDF/images
- Access music library

### Camera Screen
- Full camera interface
- Grid overlay for alignment
- Flash/torch toggle
- Camera flip button
- Image preview after capture
- Edit options

### Image Editor
- Adjust brightness & contrast
- Rotate image
- Convert to grayscale
- Crop to music area
- Save with thumbnail

### Library
- View all scanned scores
- Search by title or composer
- Sort by: Recent, Name, Most Played
- Batch operations
- Play count tracking

### Viewer/Player
- Display music score
- Audio playback controls
- Playback speed (0.5x - 2x)
- Loop and metronome
- Music metadata

### Settings
- Sound & vibration controls
- Haptic feedback
- Display preferences
- App information
- Data management

---

## 🔑 Key Configuration Files

### app.json
- App name: "Tsali Scanner"
- Package ID: `com.pezkindev.tsaliscanner`
- Permissions for camera, photos, microphone
- iOS and Android specific configs

### tsconfig.json
- TypeScript strict mode enabled
- Path aliases for imports (`@screens`, `@utils`, etc.)
- ES2020 target

### package.json
- All dependencies already installed
- Scripts: `start`, `ios`, `android`, `web`
- Version: 1.0.0

---

## 📋 Available Scripts

```bash
npm run start       # Start Expo dev server
npm run ios        # Run on iOS simulator (macOS)
npm run android    # Run on Android emulator
npm run web        # Run in web browser
npm run lint       # Check for errors/warnings
npm run type-check # TypeScript type checking
```

---

## 🎨 Customization

### Colors
Edit `/src/utils/constants.ts` > `COLORS` object:
```typescript
primary: '#1a73e8',      // Main blue color
success: '#34a853',      // Green for success
error: '#ea4335',        // Red for errors
...
```

### Typography
Edit `/src/utils/constants.ts` > `TYPOGRAPHY` object to change font sizes and weights

### Spacing
Edit `/src/utils/constants.ts` > `SPACING` object to adjust layout spacing

---

## 🔐 Permissions

The app automatically requests permissions when needed:

### iOS
- Camera (NSCameraUsageDescription)
- Photo Library (NSPhotoLibraryUsageDescription)
- Microphone (NSMicrophoneUsageDescription)

### Android
- Camera
- Read/Write Storage
- Audio Recording

---

## 🗄️ Data Storage

All user data is stored locally using AsyncStorage:
- Scanned items metadata
- App settings
- User preferences
- Audio configuration

**Data Locations:**
- Scanned images: `Document Directory/scans/`
- Thumbnails: `Document Directory/thumbnails/`
- Exports: `Document Directory/exports/`

---

## 🐛 Troubleshooting

### App Won't Start
```bash
# Clear cache and reinstall
npm install --force
npm run start
```

### Connection Issues
```bash
# Reset Expo
npx expo-cli logout
npx expo-cli login
```

### Module Not Found
- Ensure all dependencies are installed: `npm install`
- Check path aliases in tsconfig.json
- Verify file paths in imports

### Camera Permission Denied
- iOS: Settings > Tsali Scanner > Camera > On
- Android: Settings > Apps > Tsali Scanner > Permissions > Camera

---

## 📚 Additional Resources

- **React Navigation Docs**: https://reactnavigation.org/
- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **TypeScript Guide**: https://www.typescriptlang.org/docs/

---

## 💻 Development Tips

1. **Hot Reload**: Changes auto-reload while dev server is running
2. **Chrome DevTools**: Press `d` in terminal for debugger options
3. **Network Inspection**: Use Flipper for network debugging
4. **Performance**: Check FlatList optimization in LibraryScreen
5. **Logging**: Use `console.log()` for debugging

---

## 📦 Managing Dependencies

### Install new package
```bash
npm install package-name
```

### Remove package
```bash
npm uninstall package-name
```

### Update all packages
```bash
npm update
```

---

## 🎯 Next Development Steps

1. **Implement OMR Engine**
   - Integrate actual sheet music recognition library
   - Process scanned images to extract music data

2. **Audio Generation**
   - Convert recognized notes to playable MIDI
   - Generate audio with proper instruments

3. **Cloud Features**
   - Add cloud backup/sync
   - Share scores with other users

4. **Testing**
   - Add unit tests
   - Create e2e test suite

5. **Performance**
   - Optimize image processing
   - Implement lazy loading for library

---

## 🆘 Getting Help

For issues or questions:
- Check [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) for detailed documentation
- Review existing code comments
- Check terminal output for error messages
- Consult dependency documentation

---

**Happy coding! 🎵**
