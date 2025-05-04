import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, ArrowPathIcon, InformationCircleIcon, ExclamationTriangleIcon, LightBulbIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { geminiService } from '../services/geminiService';

const PlantDiseaseDetector = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        setError(null);
        setResult(null);
        setDetailedAnalysis(null);
        setTreatmentPlan(null);

        // Convert image to base64
        const base64Image = e.target.result.split(',')[1];
        
        // Detect disease using Gemma API
        const detectionResult = await geminiService.detectDisease(base64Image);
        setResult(detectionResult);
        
        // Get detailed analysis and treatment plan
        setIsAnalyzing(true);
        try {
          const [analysis, plan] = await Promise.all([
            geminiService.getDetailedAnalysis(detectionResult),
            geminiService.getTreatmentPlan(detectionResult)
          ]);
          
          setDetailedAnalysis(analysis);
          setTreatmentPlan(plan);
        } catch (error) {
          console.error('Error getting analysis:', error);
        } finally {
          setIsAnalyzing(false);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Failed to process image. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'mild':
        return 'bg-yellow-50 text-yellow-800';
      case 'moderate':
        return 'bg-orange-50 text-orange-800';
      case 'severe':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-50 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-50 text-yellow-800';
    return 'bg-red-50 text-red-800';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Plant Disease Detection</h2>
        
        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          {loading || isAnalyzing ? (
            <div className="flex flex-col items-center">
              <ArrowPathIcon className="h-12 w-12 text-primary-500 animate-spin" />
              <p className="mt-2 text-gray-600">
                {loading ? 'Processing image...' : 'Analyzing disease...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <PhotoIcon className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">
                {isDragActive
                  ? 'Drop the image here'
                  : 'Drag and drop an image here, or click to select'}
              </p>
            </div>
          )}
        </div>

        {result && (
          <div className="mt-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Detection Results</h3>
              <div className="space-y-2">
                <p className="text-gray-800">
                  <span className="font-medium">Crop Type:</span>{' '}
                  {result.cropType}
                </p>
                <p className="text-gray-800">
                  <span className="font-medium">Detected Disease:</span>{' '}
                  {result.disease}
                </p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                  <InformationCircleIcon className="h-4 w-4 mr-1" />
                  Confidence: {(result.confidence * 100).toFixed(2)}%
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.severity)}`}>
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  {result.severity} Severity
                </div>
                <div className="mt-2">
                  <p className="font-medium text-gray-800">Observed Symptoms:</p>
                  <ul className="list-disc list-inside text-gray-700">
                    {result.symptoms.map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-gray-800">Initial Analysis:</p>
                  <p className="text-gray-700">{result.analysis}</p>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-gray-800">Immediate Action:</p>
                  <p className="text-gray-700">{result.immediateAction}</p>
                </div>
                {result.potentialConfusions && result.potentialConfusions.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-gray-800 flex items-center">
                      <QuestionMarkCircleIcon className="h-5 w-5 mr-1 text-gray-500" />
                      Similar Diseases to Consider:
                    </p>
                    <ul className="list-disc list-inside text-gray-700">
                      {result.potentialConfusions.map((disease, index) => (
                        <li key={index}>{disease}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {detailedAnalysis && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Detailed Disease Analysis
                </h3>
                <div className="prose max-w-none">
                  {detailedAnalysis.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-800 mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {treatmentPlan && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <LightBulbIcon className="h-5 w-5 mr-2 text-green-500" />
                  Treatment Plan
                </h3>
                <div className="prose max-w-none">
                  {treatmentPlan.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-800 mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantDiseaseDetector; 