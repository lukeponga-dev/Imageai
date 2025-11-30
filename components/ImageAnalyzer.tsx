// components/ImageAnalyzer.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeImageWithGemini } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { GEMINI_IMAGE_ANALYSIS_MODEL } from '../constants';

const ImageAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setAnalysisResult(null);
      setError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleAnalyzeImage = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select an image file to analyze.');
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    const prompt = "Describe this image in detail and point out any interesting features or objects. What is the subject and context? If there's text, transcribe it.";

    try {
      const result = await analyzeImageWithGemini(selectedFile, prompt, GEMINI_IMAGE_ANALYSIS_MODEL);
      if (isMounted.current) {
        setAnalysisResult(result);
      }
    } catch (err: any) {
      console.error('Image analysis error:', err);
      if (isMounted.current) {
        setError(`Failed to analyze image: ${err.message || 'Unknown error'}`);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [selectedFile]);

  const renderAnalysisResult = (content: string) => {
    // Simple Markdown to HTML conversion for displaying results
    const htmlContent = content
      .split('\n')
      .map(line => {
        if (line.startsWith('## ')) return `<h2 class="text-xl font-semibold mt-4 mb-2">${line.substring(3)}</h2>`;
        if (line.startsWith('### ')) return `<h3 class="text-lg font-semibold mt-3 mb-1">${line.substring(4)}</h3>`;
        if (line.startsWith('* ')) return `<li class="ml-4 list-disc">${line.substring(2)}</li>`;
        return `<p class="mb-1">${line}</p>`;
      })
      .join('');
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };


  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center text-indigo-600 dark:text-indigo-400">
        Analyze Images
      </h2>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          id="imageUpload"
          disabled={isLoading}
          title="Click to select an image file for analysis."
        />
        <label
          htmlFor="imageUpload"
          className="flex-grow flex justify-center items-center py-3 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer
                     bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
          title="Click or drag and drop an image file here to upload it for analysis."
        >
          {selectedFile ? (
            <span className="truncate">{selectedFile.name}</span>
          ) : (
            <span>Click to select an image or drag &amp; drop here</span>
          )}
        </label>
        <button
          onClick={handleAnalyzeImage}
          className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedFile || isLoading}
          title="Click to analyze the selected image using Gemini."
        >
          {isLoading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      {selectedFile && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Selected Image Preview:</h3>
          <div className="flex justify-center p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Preview"
              className="max-w-full h-auto max-h-64 object-contain rounded-md shadow-sm"
            />
          </div>
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      {analysisResult && (
        <div className="mt-6 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 p-4 border-b dark:border-gray-700">
            Analysis Result
          </h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 prose dark:prose-invert max-w-none">
            {renderAnalysisResult(analysisResult)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;