import React from 'react';

const Recommendations = ({ recommendations }) => {
  // Ensure recommendations is an object with the expected structure
  if (!recommendations || typeof recommendations !== 'object') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
        <p className="text-gray-600">No recommendations available at this time.</p>
      </div>
    );
  }

  const {
    immediateActions = [],
    longTermCare = [],
    pestManagement = [],
    diseasePrevention = [],
    yieldOptimization = [],
    marketStrategy = []
  } = recommendations;

  const renderRecommendationSection = (title, items) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-lg font-medium text-green-700 mb-2">{title}</h3>
        <ul className="list-disc pl-5 space-y-1">
          {items.map((item, index) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
      
      {renderRecommendationSection('Immediate Actions', immediateActions)}
      {renderRecommendationSection('Long-term Care', longTermCare)}
      {renderRecommendationSection('Pest Management', pestManagement)}
      {renderRecommendationSection('Disease Prevention', diseasePrevention)}
      {renderRecommendationSection('Yield Optimization', yieldOptimization)}
      {renderRecommendationSection('Market Strategy', marketStrategy)}

      {Object.keys(recommendations).length === 0 && (
        <p className="text-gray-600">No specific recommendations available for this crop.</p>
      )}
    </div>
  );
};

export default Recommendations; 