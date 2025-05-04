import React from 'react';

const CropInfo = ({ cropData }) => {
  if (!cropData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Crop Information</h2>
        <p className="text-gray-600">No crop information available.</p>
      </div>
    );
  }

  const {
    cropName,
    variety,
    growthStage,
    healthStatus,
    confidence,
    characteristics,
    environmentalConditions,
    commonDiseases,
    pests,
    bestPractices
  } = cropData;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Crop Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-green-700 mb-2">Basic Information</h3>
          <ul className="space-y-2">
            <li><span className="font-medium">Crop Name:</span> {cropName}</li>
            <li><span className="font-medium">Variety:</span> {variety}</li>
            <li><span className="font-medium">Growth Stage:</span> {growthStage}</li>
            <li><span className="font-medium">Health Status:</span> {healthStatus}</li>
            <li><span className="font-medium">Confidence:</span> {confidence}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium text-green-700 mb-2">Characteristics</h3>
          <ul className="space-y-2">
            <li><span className="font-medium">Leaves:</span> {characteristics?.leaves?.join(', ')}</li>
            <li><span className="font-medium">Stems:</span> {characteristics?.stems?.join(', ')}</li>
            <li><span className="font-medium">Flowers:</span> {characteristics?.flowers?.join(', ')}</li>
            <li><span className="font-medium">Fruits:</span> {characteristics?.fruits?.join(', ')}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium text-green-700 mb-2">Environmental Conditions</h3>
          <ul className="space-y-2">
            <li><span className="font-medium">Soil Type:</span> {environmentalConditions?.soilType}</li>
            <li><span className="font-medium">Water Needs:</span> {environmentalConditions?.waterNeeds}</li>
            <li><span className="font-medium">Temperature Range:</span> {environmentalConditions?.temperatureRange}</li>
            <li><span className="font-medium">Sunlight Needs:</span> {environmentalConditions?.sunlightNeeds}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium text-green-700 mb-2">Potential Issues</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Common Diseases:</span>
              <ul className="list-disc pl-5 mt-1">
                {commonDiseases?.map((disease, index) => (
                  <li key={index}>{disease}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Pests:</span>
              <ul className="list-disc pl-5 mt-1">
                {pests?.map((pest, index) => (
                  <li key={index}>{pest}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-green-700 mb-2">Best Practices</h3>
          <ul className="list-disc pl-5 space-y-1">
            {bestPractices?.map((practice, index) => (
              <li key={index}>{practice}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CropInfo; 