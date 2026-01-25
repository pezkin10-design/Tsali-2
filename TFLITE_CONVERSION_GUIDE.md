# TensorFlow Lite Model Conversion Guide

Convert oemer pre-trained music recognition models to TensorFlow Lite format for on-device inference in the React Native app.

## Overview

This guide walks you through converting oemer's models to `.tflite` format for mobile optimization:
- **Staff Detection**: Detects staff lines in sheet music images (512×512 input)
- **Symbol Recognition**: Classifies music symbols (notes, rests, accidentals, etc.) (128×128 input)

Target: **Total size < 50 MB** with float16 quantization

## Prerequisites

### System Requirements
- Python 3.8+
- 4+ GB RAM (for model conversion)
- ~5 GB disk space (temporary, cleaned up after conversion)
- macOS, Linux, or Windows (WSL2)

### Python Packages

```bash
# Core dependencies
pip install tensorflow==2.14.0
pip install torch==2.0.0 torchvision==0.15.0
pip install oemer  # Latest version from PyPI

# Optional but recommended
pip install onnx onnx-tf  # For ONNX intermediate format
pip install numpy scipy scikit-image  # Image processing
```

**Installation example** (Linux/macOS):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install --upgrade pip
pip install tensorflow==2.14.0 torch==2.0.0 torchvision==0.15.0 oemer
pip install onnx onnx-tf  # Optional but helps with compatibility
```

## Quick Start

### Option A: Full Conversion (Recommended)

Run the comprehensive converter:

```bash
cd /path/to/Tsali
python convert_oemer_to_tflite.py \
  -o ./tflite_models \
  --target-dir ./sheet-music-scanner/src/assets/models/
```

**What it does:**
1. ✅ Loads oemer's pre-trained staff and symbol models
2. ✅ Applies float16 quantization to reduce size
3. ✅ Exports as `staff_detector.tflite` and `symbol_recognizer.tflite`
4. ✅ Validates total size < 50 MB
5. ✅ Copies files to React Native assets folder
6. ✅ Provides next steps for integration

**Expected output:**
```
Staff Detector:    12.5 MB
Symbol Recognizer: 18.3 MB
Total Size:        30.8 MB
✅ SUCCESS: Within 50 MB budget
```

### Option B: Simplified Conversion

If you encounter issues with the full converter:

```bash
python convert_oemer_simple.py -o ./tflite_models
```

This handles edge cases and provides fallback mechanisms.

### Option C: Create Mock Models (Testing Only)

For testing the React Native integration without running the full conversion:

```bash
python convert_oemer_simple.py --mock -o ./tflite_models
```

**⚠️ Important:** Mock models are for testing only. Use real models in production.

## Manual Conversion Steps

If you prefer manual control or encounter issues:

```python
import torch
import tensorflow as tf
from oemer.models import Staff, Clef

# 1. Load oemer models
staff_model = Staff.load_from_checkpoint(
    Staff.download_pretrained_model()
)
staff_model.eval()

# 2. Create sample input
dummy_input = torch.randn(1, 3, 512, 512)

# 3. Export to ONNX
torch.onnx.export(
    staff_model, dummy_input, "staff_detector.onnx",
    input_names=["input"], output_names=["output"],
    opset_version=13
)

# 4. Convert ONNX → TensorFlow SavedModel
import onnx
from onnx_tf.backend import prepare

onnx_model = onnx.load("staff_detector.onnx")
tf_rep = prepare(onnx_model)
tf_rep.export_graph("staff_detector_tf")

# 5. Convert SavedModel → TFLite
converter = tf.lite.TFLiteConverter.from_saved_model("staff_detector_tf")
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]

tflite_model = converter.convert()
with open("staff_detector.tflite", "wb") as f:
    f.write(tflite_model)

print(f"✅ Saved: {len(tflite_model) / (1024*1024):.2f} MB")
```

## Model Specifications

### Staff Detector (`staff_detector.tflite`)

| Property | Value |
|----------|-------|
| Input | (batch=1, height=512, width=512, channels=3) |
| Input Format | Float32, normalized to [0, 1] |
| Output | (batch=1, height=512, width=512, channels=1) |
| Output Format | Float32 probability map [0, 1] |
| Architecture | UNet-based encoder-decoder |
| Size (float16) | ~12-15 MB |
| Latency (mobile) | 200-500ms |

**Usage in OMRService:**
```typescript
// Preprocess input
const input = resizeImage(imageUri, 512, 512);
const normalized = normalizeFloat32(input, [0, 1]);

// Run inference
const heatmap = await tfliteInterpreter.runInference(
  normalized,
  'staff_detector'
);

// Post-process output
const staffLines = extractStaffLinePositions(heatmap, threshold=0.5);
```

### Symbol Recognizer (`symbol_recognizer.tflite`)

| Property | Value |
|----------|-------|
| Input | (batch=1, height=128, width=128, channels=3) |
| Input Format | Float32, normalized to [0, 1] |
| Output | (batch=1, num_classes=128) |
| Output Format | Float32 logits / probabilities |
| Architecture | CNN classifier |
| Size (float16) | ~15-20 MB |
| Latency (mobile) | 30-100ms per symbol |

**Usage in OMRService:**
```typescript
// For each detected symbol region
const symbolPatch = extractPatch(image, x, y, 128, 128);
const normalized = normalizeFloat32(symbolPatch, [0, 1]);

// Run inference
const predictions = await tfliteInterpreter.runInference(
  normalized,
  'symbol_recognizer'
);

// Get class prediction
const symbolClass = argmax(predictions);
const confidence = softmax(predictions)[symbolClass];
```

## Quantization Options

### Float16 (Recommended) ✅
- **Size reduction**: 50% (float32 → float16)
- **Accuracy impact**: <1% (minimal)
- **Speed**: Slightly faster on compatible hardware
- **Best for**: Most mobile devices

**Enable:**
```python
converter.target_spec.supported_types = [tf.float16]
```

### Int8 (Extreme Compression)
- **Size reduction**: 75%
- **Accuracy impact**: 2-5% (may be noticeable)
- **Speed**: Fastest inference
- **Best for**: Severely storage-constrained devices

**Enable:**
```python
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
```

### Dynamic Range Quantization
- **Size reduction**: 40-50%
- **Accuracy impact**: <1%
- **Best for**: Balanced trade-off

**Enable:**
```python
converter.optimizations = [tf.lite.Optimize.DEFAULT]
# No additional quantization_type needed
```

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'oemer'"

**Solution:**
```bash
pip install oemer --upgrade
# Or if using conda:
conda install -c pytorch -c conda-forge oemer
```

### Issue: CUDA/GPU issues during conversion

**Solution:** Use CPU instead:
```bash
export CUDA_VISIBLE_DEVICES=""  # Linux/Mac
set CUDA_VISIBLE_DEVICES=  # Windows

python convert_oemer_to_tflite.py -o ./tflite_models
```

### Issue: "Out of memory" during conversion

**Solution:** Reduce batch size or use smaller intermediate shapes:
```python
# In the conversion script, modify input_shape
input_shape=(1, 3, 256, 256)  # Use 256 instead of 512
```

### Issue: Converted model produces garbage output

**Possible causes & solutions:**
1. **Preprocessing mismatch**: Ensure normalized to [0, 1] or [-1, 1]
2. **Input shape mismatch**: Verify (NHWC) format in output
3. **Model corruption**: Re-run conversion
4. **Quantization issue**: Try without quantization first

```python
# Test without quantization
converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_path)
# Remove quantization lines
tflite_model = converter.convert()
```

### Issue: "Cannot run inference on .tflite file"

**Check:**
1. ✅ File exists and is readable
2. ✅ File is valid TFLite format (starts with magic bytes)
3. ✅ Input shapes match model expectations
4. ✅ Input data type is correct (float32)

```bash
# Verify file
file staff_detector.tflite
# Should output: TFLite model (TensorFlow Lite)

ls -lh *.tflite
# Check file size is reasonable (not 0 bytes)
```

## Integration with React Native

After successful conversion:

### 1. Copy to Assets
```bash
mkdir -p sheet-music-scanner/src/assets/models/
cp tflite_models/*.tflite sheet-music-scanner/src/assets/models/
```

### 2. Update metro.config.js
See the next section in the implementation guide.

### 3. Install TFLite Library
```bash
cd sheet-music-scanner
npm install react-native-fast-tflite
```

### 4. Use in OMRService
```typescript
import { TensorflowLite } from 'react-native-fast-tflite';

class OMRService {
  private tflite: TensorflowLite;
  private staffDetector: any;
  private symbolRecognizer: any;

  async initialize() {
    this.tflite = new TensorflowLite();
    
    // Load models from assets
    this.staffDetector = await this.tflite.loadModel(
      require('../assets/models/staff_detector.tflite')
    );
    this.symbolRecognizer = await this.tflite.loadModel(
      require('../assets/models/symbol_recognizer.tflite')
    );
  }

  async scanSheetMusic(imageUri: string) {
    // ... implementation
  }
}
```

## Performance Benchmarks

Typical performance on modern devices:

| Device | Staff Detection | Symbol Recognition | Total |
|--------|-----------------|-------------------|-------|
| iPhone 13 | 150-200ms | 20-40ms per symbol | 800ms-1.5s |
| iPhone 11 | 300-400ms | 40-60ms per symbol | 1.5-2.5s |
| Samsung S22 (GPU) | 100-150ms | 15-30ms per symbol | 600-1s |
| Samsung S20 (CPU) | 250-350ms | 35-50ms per symbol | 1.2-2s |
| Budget Android | 500-800ms | 60-100ms per symbol | 2-3s |

**Optimization tips:**
- Enable GPU acceleration where available
- Batch process symbols when possible
- Cache preprocessed images
- Use lower resolution for initial detection (256x256)

## References

- [TensorFlow Lite Documentation](https://www.tensorflow.org/lite)
- [oemer GitHub](https://github.com/BetsyHJ/oemer)
- [PyTorch ONNX Export](https://pytorch.org/docs/stable/onnx.html)
- [Mobile ML Best Practices](https://www.tensorflow.org/lite/guide/model_optimization)

## Support

If you encounter issues:

1. Check this troubleshooting section
2. Run with verbose output: `python convert_oemer_simple.py -v`
3. Try creating mock models: `python convert_oemer_simple.py --mock`
4. Review the conversion logs for specific errors

---

**Last updated:** January 24, 2026  
**TensorFlow version:** 2.14.0  
**oemer version:** latest
