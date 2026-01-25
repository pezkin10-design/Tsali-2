const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Extend resolver to handle TFLite model files
const { resolver } = config;
resolver.assetExts = [...(resolver.assetExts || []), 'tflite'];
resolver.sourceExts = [...(resolver.sourceExts || []), 'ts', 'tsx', 'js', 'jsx'];

module.exports = config;
