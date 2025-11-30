// types.ts

export enum Feature {
  Chat = 'Chat',
  ImageGeneration = 'Image Generation',
  ImageAnalysis = 'Image Analysis',
}

export enum ImageSize {
  K1 = '1K',
  K2 = '2K',
  K4 = '4K',
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  PORTRAIT_9_16 = '9:16',
  LANDSCAPE_16_9 = '16:9',
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ImageGeneratorOptions {
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
}
