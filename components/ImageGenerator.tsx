// components/ImageGenerator.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AspectRatio, ImageSize } from '../types';
import { generateImageWithGemini } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { ASPECT_RATIO_OPTIONS, IMAGE_SIZE_OPTIONS } from '../constants';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.K1);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleGenerateImage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() === '') {
      setError('Please enter a prompt for the image.');
      return;
    }
    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const imageUrl = await generateImageWithGemini(prompt, aspectRatio, imageSize);
      if (isMounted.current) {
        setGeneratedImage(imageUrl);
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      if (isMounted.current) {
        setError(`Failed to generate image: ${err.message || 'Unknown error'}`);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [prompt, aspectRatio, imageSize]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center text-indigo-600 dark:text-indigo-400">
        Generate Images
      </h2>

      <form onSubmit={handleGenerateImage} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Image Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            placeholder="e.g., A futuristic city at sunset with flying cars and neon lights"
            disabled={isLoading}
            title="Describe the image you want to generate."
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Aspect Ratio
            </label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              disabled={isLoading}
              title="Select the desired aspect ratio for your generated image."
            >
              {ASPECT_RATIO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="imageSize" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Image Size
            </label>
            <select
              id="imageSize"
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value as ImageSize)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              disabled={isLoading}
              title="Choose the output resolution for your generated image."
            >
              {IMAGE_SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || prompt.trim() === ''}
          title="Click to generate an image based on your prompt and selected options."
        >
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      {generatedImage && (
        <div className="mt-6 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 p-4 border-b dark:border-gray-700">
            Generated Image
          </h3>
          <div className="flex justify-center items-center p-4 bg-gray-100 dark:bg-gray-900">
            <img src={generatedImage} alt="Generated" className="max-w-full h-auto rounded-md shadow-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;