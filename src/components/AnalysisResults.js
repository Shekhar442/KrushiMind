import React from 'react';
import PropTypes from 'prop-types';

const AnalysisResults = ({ results }) => {
  if (!results) return null;

  const { cropName, disease, confidence, healthStatus } = results;
  
  // Format confidence as percentage
  const confidencePercentage = Math.round(confidence * 100);
  
  // Determine health status color
  const getHealthStatusColor = () => {
    if (healthStatus === 'Healthy') {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Crop Information</h3>
          <p className="text-gray-700">
            <span className="font-medium">Crop:</span> {cropName}
          </p>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Disease Detection</h3>
          <p className="text-gray-700">
            <span className="font-medium">Disease:</span> {disease}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Confidence:</span> {confidencePercentage}%
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Health Status</h3>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor()}`}>
          {healthStatus}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Analysis completed at: {new Date(results.timestamp).toLocaleString()}</p>
        <p>Model: {results.metadata.model} v{results.metadata.version}</p>
      </div>
    </div>
  );
};

AnalysisResults.propTypes = {
  results: PropTypes.shape({
    cropName: PropTypes.string,
    disease: PropTypes.string,
    confidence: PropTypes.number,
    healthStatus: PropTypes.string,
    timestamp: PropTypes.string,
    metadata: PropTypes.object
  })
};

export default AnalysisResults; 