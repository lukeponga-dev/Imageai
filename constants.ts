// constants.ts
import { AspectRatio, ImageSize, Feature } from './types';

export const ASPECT_RATIO_OPTIONS = [
  { value: AspectRatio.SQUARE, label: '1:1 (Square)' },
  { value: AspectRatio.PORTRAIT_3_4, label: '3:4 (Portrait)' },
  { value: AspectRatio.LANDSCAPE_4_3, label: '4:3 (Landscape)' },
  { value: AspectRatio.PORTRAIT_9_16, label: '9:16 (Tall Portrait)' },
  { value: AspectRatio.LANDSCAPE_16_9, label: '16:9 (Wide Landscape)' },
];

export const IMAGE_SIZE_OPTIONS = [
  { value: ImageSize.K1, label: '1024x1024 (1K)' },
  { value: ImageSize.K2, label: '2048x2048 (2K)' },
  { value: ImageSize.K4, label: '4096x4096 (4K)' },
];

export const FEATURES = [
  { name: Feature.Chat, icon: '💬' },
  { name: Feature.ImageGeneration, icon: '🖼️' },
  { name: Feature.ImageAnalysis, icon: '🔍' },
];

export const GEMINI_CHAT_MODEL = 'gemini-3-pro-preview';
export const GEMINI_IMAGE_GEN_MODEL = 'gemini-3-pro-image-preview';
export const GEMINI_IMAGE_ANALYSIS_MODEL = 'gemini-3-pro-preview';
