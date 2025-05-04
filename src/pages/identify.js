import React, { useState } from 'react';
import Head from 'next/head';
import ImageUpload from '../components/ImageUpload';
import AnalysisResults from '../components/AnalysisResults';
import CropInformation from '../components/CropInformation';
import Recommendations from '../components/Recommendations';
import { identifyCrop } from '../services/aiService';
import CropInfo from '../components/CropInfo';
import TreatmentPlan from '../components/TreatmentPlan';

const IdentifyPage = () => {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      setAnalysisProgress('Initializing analysis...');
      const analysisResults = await identifyCrop(image);
      
      setAnalysisProgress('Processing results...');
      setResults(analysisResults);
      
      setAnalysisProgress('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setAnalysisProgress('');
    }
  };

  return (
    <>
      <Head>
        <title>Crop Disease Detection | KrushiMind</title>
        <meta name="description" content="Detect crop diseases using AI-powered image analysis" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Crop Identification & Disease Detection</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Upload Plant Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-sm text-gray-500 mt-1">Supported formats: JPG, PNG, JPEG. Max size: 5MB</p>
          </div>

          {image && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Preview</h3>
              <img
                src={image}
                alt="Uploaded plant"
                className="max-w-full h-auto rounded-lg border border-gray-200"
              />
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!image || loading}
            className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${
              !image || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {analysisProgress || 'Analyzing...'}
              </div>
            ) : 'Analyze Image'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
              {error.includes('API configuration error') && (
                <div className="mt-2 text-sm">
                  <p>To fix this error:</p>
                  <ol className="list-decimal pl-5 mt-1">
                    <li>Create a <code>.env.local</code> file in your project root</li>
                    <li>Add your Gemini API key: <code>NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here</code></li>
                    <li>Restart your development server</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
        
        {results && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-2">Analysis Results</h2>
              <p className="text-green-700">Crop identified: <span className="font-medium">{results.cropName}</span></p>
              <p className="text-green-700">Health Status: <span className="font-medium">{results.healthStatus}</span></p>
              <p className="text-green-700">Confidence: <span className="font-medium">{Math.round(results.confidence * 100)}%</span></p>
            </div>

            <CropInfo cropData={results} />
            <TreatmentPlan treatmentPlan={results.treatmentPlan} />
            <Recommendations recommendations={results.recommendations} />
          </div>
        )}
      </div>
    </>
  );
};

export default IdentifyPage;