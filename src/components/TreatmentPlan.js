import React from 'react';

const TreatmentPlan = ({ treatmentPlan }) => {
  if (!treatmentPlan) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Treatment Plan</h2>
        <p className="text-gray-600">No treatment plan available.</p>
      </div>
    );
  }

  const {
    immediateActions,
    preventiveMeasures,
    nutritionManagement,
    environmentalOptimization
  } = treatmentPlan;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Treatment Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-green-700 mb-2">Immediate Actions</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Priority:</span> {immediateActions?.priority}</p>
            <p><span className="font-medium">Timeline:</span> {immediateActions?.timeline}</p>
            <div>
              <span className="font-medium">Actions:</span>
              <ul className="list-disc pl-5 mt-1">
                {immediateActions?.actions?.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-green-700 mb-2">Preventive Measures</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Cultural Practices:</span>
              <ul className="list-disc pl-5 mt-1">
                {preventiveMeasures?.culturalPractices?.map((practice, index) => (
                  <li key={index}>{practice}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Biological Controls:</span>
              <ul className="list-disc pl-5 mt-1">
                {preventiveMeasures?.biologicalControls?.map((control, index) => (
                  <li key={index}>{control}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Chemical Controls:</span>
              <ul className="list-disc pl-5 mt-1">
                {preventiveMeasures?.chemicalControls?.map((control, index) => (
                  <li key={index}>{control}</li>
                ))}
              </ul>
            </div>
            <p><span className="font-medium">Monitoring Schedule:</span> {preventiveMeasures?.monitoringSchedule}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-green-700 mb-2">Nutrition Management</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Fertilizer Recommendations:</span>
              <ul className="list-disc pl-5 mt-1">
                {nutritionManagement?.fertilizerRecommendations?.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
            <p><span className="font-medium">Application Schedule:</span> {nutritionManagement?.applicationSchedule}</p>
            <div>
              <span className="font-medium">Soil Amendments:</span>
              <ul className="list-disc pl-5 mt-1">
                {nutritionManagement?.soilAmendments?.map((amendment, index) => (
                  <li key={index}>{amendment}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-green-700 mb-2">Environmental Optimization</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Water Management:</span>
              <ul className="list-disc pl-5 mt-1">
                {environmentalOptimization?.waterManagement?.map((practice, index) => (
                  <li key={index}>{practice}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Temperature Control:</span>
              <ul className="list-disc pl-5 mt-1">
                {environmentalOptimization?.temperatureControl?.map((strategy, index) => (
                  <li key={index}>{strategy}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Light Optimization:</span>
              <ul className="list-disc pl-5 mt-1">
                {environmentalOptimization?.lightOptimization?.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlan; 