// App.tsx
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import ImageGenerator from './components/ImageGenerator';
import ImageAnalyzer from './components/ImageAnalyzer';
import { Feature } from './types';

const App: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState<Feature>(Feature.Chat);

  const renderFeatureComponent = () => {
    switch (currentFeature) {
      case Feature.Chat:
        return <Chatbot />;
      case Feature.ImageGeneration:
        return <ImageGenerator />;
      case Feature.ImageAnalysis:
        return <ImageAnalyzer />;
      default:
        return <Chatbot />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar currentFeature={currentFeature} onSelectFeature={setCurrentFeature} />
      <main className="flex-grow p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto h-full">
          {renderFeatureComponent()}
        </div>
      </main>
    </div>
  );
};

export default App;
