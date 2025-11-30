// components/Navbar.tsx
import React from 'react';
import { Feature } from '../types';
import { FEATURES } from '../constants';

interface NavbarProps {
  currentFeature: Feature;
  onSelectFeature: (feature: Feature) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentFeature, onSelectFeature }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="container mx-auto flex flex-wrap justify-center sm:justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4 sm:mb-0">
          AI Image Enhancer
        </h1>
        <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
          {FEATURES.map((feature) => (
            <button
              key={feature.name}
              onClick={() => onSelectFeature(feature.name)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${currentFeature === feature.name
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
              `}
            >
              {feature.icon} {feature.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
