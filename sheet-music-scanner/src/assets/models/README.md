# TensorFlow Lite Models

This directory contains the pre-trained TensorFlow Lite models for on-device music recognition.

## Required Files

Place these two files in this directory after conversion:

```
src/assets/models/
├── staff_detector.tflite          (12-15 MB) - Staff line detection model
└── symbol_recognizer.tflite       (15-20 MB) - Symbol classification model
```

## How to Get the Models

### Option 1: Automatic Conversion (Recommended)

Run the conversion script from the repository root:

```bash
cd /path/to/Tsali
python convert_oemer_simple.py \
  -o ./tflite_models \
  --target-dir ./sheet-music-scanner/src/assets/models/
```

This will automatically place the models here.

### Option 2: Manual Placement

1. Run the conversion script to generate `.tflite` files:
   ```bash
   python convert_oemer_to_tflite.py -o ./tflite_models
   ```

2. Copy the generated files to this directory:
   ```bash
   cp tflite_models/*.tflite sheet-music-scanner/src/assets/models/
   ```

### Option 3: Using Mock Models (Testing Only)

For development/testing without real models:

```bash
python convert_oemer_simple.py --mock -o ./tflite_models
cp tflite_models/*.tflite sheet-music-scanner/src/assets/models/
```

## Model Specifications

### Staff Detector (`staff_detector.tflite`)
- **Input**: 512×512 RGB image (float32, normalized to [0, 1])
- **Output**: 512×512 probability heatmap
- **Purpose**: Detects staff line positions in sheet music
- **Size**: ~12-15 MB (float16 quantization)
- **Latency**: 150-400ms on mobile

### Symbol Recognizer (`symbol_recognizer.tflite`)
- **Input**: 128×128 RGB symbol patch (float32, normalized to [0, 1])
- **Output**: 128-class probabilities
- **Purpose**: Classifies music symbols (notes, rests, accidentals, etc.)
- **Size**: ~15-20 MB (float16 quantization)
- **Latency**: 20-100ms per symbol on mobile

## Usage in Code

Import and load models in OMRService:

```typescript
import { TensorflowLite } from 'react-native-fast-tflite';

class OMRService {
  private tflite: TensorflowLite;
  
  async initialize() {
    this.tflite = new TensorflowLite();
    
    // Load models from this directory
    await this.tflite.loadModel(
      require('./staff_detector.tflite')
    );
    
    await this.tflite.loadModel(
      require('./symbol_recognizer.tflite')
    );
  }
  
  async scanSheetMusic(imageUri: string) {
    // Run inference using loaded models
    // ... implementation
  }
}
```

## File Size Budget

Total budget: **< 50 MB**

| Model | Size | Percentage |
|-------|------|-----------|
| Staff Detector | 12-15 MB | 30-35% |
| Symbol Recognizer | 15-20 MB | 40-50% |
| Overhead | < 5 MB | < 10% |
| **Total** | **~30-40 MB** | **< 50 MB** ✅ |

## Asset Bundling

The models are bundled with the app through Metro bundler configuration. Metro is configured to recognize `.tflite` files as assets:

**metro.config.js** includes:
```javascript
resolver.assetExts = [...(resolver.assetExts || []), 'tflite'];
```

This ensures `.tflite` files are copied to the app bundle during build.

## Troubleshooting

### Models Not Loading

**Error**: "Cannot find module './staff_detector.tflite'"

**Solutions**:
1. Ensure files are in this exact directory
2. Verify filenames match exactly (case-sensitive on Linux/macOS)
3. Rebuild the app: `npm run ios` or `npm run android`
4. Clear cache: `rm -rf node_modules/.cache`

### Performance Issues

If models are slow on device:

1. **Check file integrity**:
   ```bash
   file staff_detector.tflite
   # Should output: data
   ```

2. **Monitor size**:
   ```bash
   du -h *.tflite
   ```

3. **Enable GPU acceleration** in OMRService (Android):
   ```typescript
   const options = {
     useGPU: true,  // Enable GPU on compatible devices
   };
   ```

## Next Steps

1. ✅ Place `.tflite` files in this directory
2. ✅ Verify metro.config.js includes TFLite support
3. ✅ Install react-native-fast-tflite: `npm install react-native-fast-tflite`
4. ✅ Update OMRService.ts to load and use models
5. ✅ Test on device

## References

- [Model Conversion Guide](../../TFLITE_CONVERSION_GUIDE.md)
- [OMR Service Documentation](../../src/services/omr.ts)
- [React Native TFLite Integration](../../docs/TFLITE_INTEGRATION.md)

---

**Status**: Models required for app to function  
**Last updated**: January 24, 2026
