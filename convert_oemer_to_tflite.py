#!/usr/bin/env python3
"""
Convert oemer pre-trained models to TensorFlow Lite format with quantization.

This script:
1. Loads oemer's staff detection and symbol recognition models
2. Applies dynamic range quantization (float16) to reduce size
3. Optimizes for mobile inference (512x512 input, NHWC format)
4. Exports as staff_detector.tflite and symbol_recognizer.tflite
5. Validates output models are <50MB total

Target: React Native app bundling at sheet-music-scanner/src/assets/models/

Author: GitHub Copilot
Date: January 24, 2026
"""

import os
import sys
import warnings
import argparse
from pathlib import Path
from typing import Tuple, Optional
import numpy as np

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
warnings.filterwarnings('ignore')

try:
    import tensorflow as tf
    from tensorflow.lite.python import lite_constants
except ImportError:
    print("❌ ERROR: TensorFlow not installed")
    print("Install it with: pip install tensorflow==2.14.0")
    sys.exit(1)

try:
    import torch
    import torchvision
except ImportError:
    print("❌ ERROR: PyTorch not installed")
    print("Install it with: pip install torch torchvision")
    sys.exit(1)

try:
    from oemer.models import Staff, Clef
except ImportError:
    print("❌ ERROR: oemer package not installed")
    print("Install it with: pip install oemer")
    sys.exit(1)


class OemerToTFLiteConverter:
    """Convert oemer PyTorch models to TensorFlow Lite format."""

    def __init__(self, output_dir: str = "./tflite_models", verbose: bool = True):
        """
        Initialize converter.
        
        Args:
            output_dir: Directory to save .tflite files
            verbose: Print progress messages
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.verbose = verbose
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def log(self, message: str) -> None:
        """Log message if verbose mode enabled."""
        if self.verbose:
            print(message)

    def load_oemer_staff_detection_model(self) -> torch.nn.Module:
        """
        Load oemer's pre-trained staff detection model.
        
        Returns:
            PyTorch model (UNet-based staff detector)
            
        Raises:
            RuntimeError: If model cannot be loaded
        """
        try:
            self.log("📦 Loading oemer staff detection model...")
            # Load oemer's Staff model (pre-trained UNet for staff line detection)
            model = Staff.load_from_checkpoint(
                checkpoint_path=Staff.download_pretrained_model(),
                map_location=self.device
            )
            model.eval()
            self.log("✅ Staff detection model loaded successfully")
            return model
        except Exception as e:
            raise RuntimeError(f"Failed to load staff detection model: {e}")

    def load_oemer_symbol_recognition_model(self) -> torch.nn.Module:
        """
        Load oemer's pre-trained symbol recognition model.
        
        Returns:
            PyTorch model (classifier for music symbols)
            
        Raises:
            RuntimeError: If model cannot be loaded
        """
        try:
            self.log("📦 Loading oemer symbol recognition model...")
            # Load oemer's Clef model (symbol classifier - can be extended for all symbols)
            model = Clef.load_from_checkpoint(
                checkpoint_path=Clef.download_pretrained_model(),
                map_location=self.device
            )
            model.eval()
            self.log("✅ Symbol recognition model loaded successfully")
            return model
        except Exception as e:
            raise RuntimeError(f"Failed to load symbol recognition model: {e}")

    def pytorch_to_tflite(
        self,
        pytorch_model: torch.nn.Module,
        input_shape: Tuple[int, ...],
        model_name: str,
        quantization_type: str = "float16"
    ) -> Tuple[str, float]:
        """
        Convert PyTorch model to TensorFlow Lite format.
        
        Args:
            pytorch_model: PyTorch model to convert
            input_shape: Input tensor shape (batch, channels, height, width)
            model_name: Name for output .tflite file (without extension)
            quantization_type: "float16", "int8", or "none"
            
        Returns:
            Tuple of (output_file_path, file_size_mb)
            
        Raises:
            RuntimeError: If conversion fails
        """
        try:
            self.log(f"\n🔄 Converting {model_name} to TFLite...")
            
            # Create dummy input for tracing
            dummy_input = torch.randn(input_shape, device=self.device)
            
            # Trace PyTorch model to TorchScript
            self.log(f"   ├─ Step 1/4: Tracing PyTorch model...")
            traced_model = torch.jit.trace(pytorch_model, dummy_input)
            
            # Convert TorchScript to TensorFlow SavedModel
            self.log(f"   ├─ Step 2/4: Converting to TensorFlow SavedModel...")
            concrete_func = tf.function(
                lambda x: torch.onnx._export(
                    pytorch_model, dummy_input, None, 
                    input_names=["input"], output_names=["output"],
                    opset_version=13
                )
            )
            
            # Use tf2onnx for better compatibility
            # Alternative: Use torch.onnx export then onnx-tf
            saved_model_dir = self.output_dir / f"{model_name}_saved_model"
            
            # Create TF Lite converter from ONNX via intermediate format
            # For simplicity, we'll use PyTorch → ONNX → TFLite via converter
            import onnx
            import onnx_tf
            
            onnx_model_path = str(self.output_dir / f"{model_name}.onnx")
            self.log(f"   ├─ Exporting to ONNX at {onnx_model_path}...")
            
            torch.onnx.export(
                pytorch_model,
                dummy_input,
                onnx_model_path,
                input_names=["input"],
                output_names=["output"],
                opset_version=13,
                do_constant_folding=True,
                export_params=True,
                verbose=False
            )
            
            # Convert ONNX to TensorFlow SavedModel
            self.log(f"   ├─ Step 3/4: Converting ONNX to TensorFlow...")
            onnx_model = onnx.load(onnx_model_path)
            
            # Create TensorFlow graph from ONNX
            tf_rep = onnx_tf.backend.prepare(onnx_model)
            tf_rep.export_graph(str(saved_model_dir))
            
            # Convert SavedModel to TFLite
            self.log(f"   ├─ Step 4/4: Converting to TensorFlow Lite with {quantization_type} quantization...")
            converter = tf.lite.TFLiteConverter.from_saved_model(str(saved_model_dir))
            
            # Apply quantization
            if quantization_type == "float16":
                converter.target_spec.supported_types = [tf.float16]
                converter.optimizations = [tf.lite.Optimize.DEFAULT]
            elif quantization_type == "int8":
                converter.optimizations = [tf.lite.Optimize.DEFAULT]
                converter.target_spec.supported_ops = [
                    tf.lite.OpsSet.TFLITE_BUILTINS_INT8
                ]
                # Note: int8 requires quantization dataset
            elif quantization_type != "none":
                raise ValueError(f"Unknown quantization type: {quantization_type}")
            
            # Set optimization for mobile
            converter.target_spec.supported_ops = [
                tf.lite.OpsSet.TFLITE_BUILTINS
            ]
            converter.allow_custom_ops = False
            
            # Convert
            tflite_model = converter.convert()
            
            # Save to file
            output_path = self.output_dir / f"{model_name}.tflite"
            with open(output_path, "wb") as f:
                f.write(tflite_model)
            
            file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            self.log(f"✅ Saved: {output_path}")
            self.log(f"   Size: {file_size_mb:.2f} MB")
            
            # Clean up temporary files
            os.remove(onnx_model_path)
            import shutil
            shutil.rmtree(saved_model_dir, ignore_errors=True)
            
            return str(output_path), file_size_mb
            
        except Exception as e:
            raise RuntimeError(f"Conversion failed for {model_name}: {e}")

    def convert_and_validate(self) -> bool:
        """
        Execute full conversion pipeline.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self.log("=" * 70)
            self.log("🎵 oemer → TensorFlow Lite Model Converter")
            self.log("=" * 70)
            self.log(f"Output directory: {self.output_dir}")
            self.log(f"Device: {self.device}")
            self.log("")
            
            # Load models
            staff_model = self.load_oemer_staff_detection_model()
            symbol_model = self.load_oemer_symbol_recognition_model()
            
            # Convert staff detection model
            staff_path, staff_size = self.pytorch_to_tflite(
                staff_model,
                input_shape=(1, 3, 512, 512),  # batch=1, RGB, 512x512
                model_name="staff_detector",
                quantization_type="float16"
            )
            
            # Convert symbol recognition model
            symbol_path, symbol_size = self.pytorch_to_tflite(
                symbol_model,
                input_shape=(1, 3, 128, 128),  # batch=1, RGB, 128x128 (symbol patches)
                model_name="symbol_recognizer",
                quantization_type="float16"
            )
            
            # Validate total size
            total_size = staff_size + symbol_size
            self.log("")
            self.log("=" * 70)
            self.log("📊 Conversion Summary")
            self.log("=" * 70)
            self.log(f"Staff Detector:    {staff_size:.2f} MB")
            self.log(f"Symbol Recognizer: {symbol_size:.2f} MB")
            self.log(f"Total Size:        {total_size:.2f} MB")
            
            if total_size > 50:
                self.log(f"⚠️  WARNING: Total size ({total_size:.2f} MB) exceeds 50 MB target")
                self.log("   Consider applying int8 quantization or model pruning")
            else:
                self.log(f"✅ SUCCESS: Total size ({total_size:.2f} MB) within 50 MB budget")
            
            self.log("")
            self.log("📋 Next Steps:")
            self.log(f"1. Copy both .tflite files to:")
            self.log(f"   sheet-music-scanner/src/assets/models/")
            self.log("")
            self.log(f"2. Update metro.config.js to bundle .tflite assets")
            self.log("")
            self.log(f"3. Install react-native-fast-tflite:")
            self.log(f"   npm install react-native-fast-tflite")
            self.log("")
            self.log(f"4. Update OMRService.ts to load and use models locally")
            self.log("=" * 70)
            
            return total_size <= 50
            
        except Exception as e:
            self.log(f"\n❌ CONVERSION FAILED: {e}")
            import traceback
            traceback.print_exc()
            return False


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Convert oemer models to TensorFlow Lite format"
    )
    parser.add_argument(
        "-o", "--output",
        default="./tflite_models",
        help="Output directory for .tflite files (default: ./tflite_models)"
    )
    parser.add_argument(
        "-q", "--quiet",
        action="store_true",
        help="Suppress progress messages"
    )
    parser.add_argument(
        "--target-dir",
        default=None,
        help="Copy final .tflite files to this directory (e.g., sheet-music-scanner/src/assets/models/)"
    )
    
    args = parser.parse_args()
    
    # Create converter
    converter = OemerToTFLiteConverter(
        output_dir=args.output,
        verbose=not args.quiet
    )
    
    # Execute conversion
    success = converter.convert_and_validate()
    
    # Copy to target directory if specified
    if success and args.target_dir:
        import shutil
        target = Path(args.target_dir)
        target.mkdir(parents=True, exist_ok=True)
        
        for tflite_file in converter.output_dir.glob("*.tflite"):
            dest = target / tflite_file.name
            shutil.copy2(tflite_file, dest)
            if not args.quiet:
                print(f"Copied {tflite_file.name} to {dest}")
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
