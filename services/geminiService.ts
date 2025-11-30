// services/geminiService.ts
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { AspectRatio, ImageSize, ChatMessage } from '../types';
import { GEMINI_IMAGE_GEN_MODEL } from '../constants';

// Utility function to convert a File to a Base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // The result will be in the format "data:image/jpeg;base64,...",
      // we only need the base64 part after the comma.
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Function to ensure API key selection for models that require it
export const ensureApiKeySelected = async (): Promise<boolean> => {
  // Assume window.aistudio is available in the execution environment
  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function' && typeof window.aistudio.openSelectKey === 'function') {
    if (!(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      // Assume selection was successful and proceed.
      return true;
    }
    return true;
  } else {
    console.warn("window.aistudio not available. API key selection may not function as expected.");
    // In a local development environment without the AI Studio runtime,
    // we assume process.env.API_KEY is available.
    return !!process.env.API_KEY;
  }
};

const createGenAIInstance = () => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY environment variable is not set. Please select an API key or ensure it is configured.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const chatWithGemini = async (messages: ChatMessage[], model: string, onChunk: (chunk: string) => void): Promise<void> => {
  await ensureApiKeySelected(); // Ensure API key is selected for this model
  const ai = createGenAIInstance();

  try {
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    const latestUserMessage = messages[messages.length - 1].content;

    const chat = ai.chats.create({
      model: model,
      history: history,
    });

    const result = await chat.sendMessageStream({ message: latestUserMessage });

    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        onChunk(c.text);
      }
    }
  } catch (error: any) {
    console.error('Error during chat:', error);
    // Specific error handling for API key issues
    if (error.message && error.message.includes("Requested entity was not found.")) {
      alert("API key issue: Please ensure you have selected a valid paid API key for chat. Go to menu > AI API Key to select one.");
      window.aistudio?.openSelectKey();
    }
    throw error;
  }
};

export const generateImageWithGemini = async (prompt: string, aspectRatio: AspectRatio, imageSize: ImageSize): Promise<string> => {
  await ensureApiKeySelected(); // Ensure API key is selected for this model
  const ai = createGenAIInstance();

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_GEN_MODEL,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodedString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodedString}`;
      }
    }
    throw new Error('No image data found in the response.');
  } catch (error: any) {
    console.error('Error generating image:', error);
    // Specific error handling for API key issues
    if (error.message && error.message.includes("Requested entity was not found.")) {
      alert("API key issue: Please ensure you have selected a valid paid API key for image generation. Go to menu > AI API Key to select one.");
      // Optionally re-open the key selection dialog
      window.aistudio?.openSelectKey();
    }
    throw error;
  }
};

export const analyzeImageWithGemini = async (imageFile: File, prompt: string, model: string): Promise<string> => {
  await ensureApiKeySelected(); // Ensure API key is selected for this model
  const base64Image = await fileToBase64(imageFile);
  const ai = createGenAIInstance();

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: imageFile.type,
          },
        },
        { text: prompt },
      ],
    });
    return response.text || 'No analysis could be performed.';
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    // Specific error handling for API key issues
    if (error.message && error.message.includes("Requested entity was not found.")) {
      alert("API key issue: Please ensure you have selected a valid paid API key for image analysis. Go to menu > AI API Key to select one.");
      window.aistudio?.openSelectKey();
    }
    throw error;
  }
};