import React, { useState } from 'react';
import { useGemmaChat } from '../../hooks/useGemmaChat';
import { 
  SparklesIcon,
  XMarkIcon,
  ChartBarIcon,
  LightBulbIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const AIIntelligence = ({ isOpen, onClose, insights = null }) => {
  const { loading, error } = useGemmaChat();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">AI Insights</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {insights ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Analysis</h4>
              <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(insights, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No insights available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIIntelligence; 