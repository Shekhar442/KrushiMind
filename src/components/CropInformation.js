import React, { useState } from 'react';
import PropTypes from 'prop-types';

const CropInformation = ({ cropInfo }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!cropInfo) return null;
  
  // Split the crop info into sections
  const sections = cropInfo.split('\n\n').filter(section => section.trim());
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Crop Information</h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[2000px]' : 'max-h-48'}`}>
        {sections.map((section, index) => {
          // Extract section title and content
          const lines = section.split('\n');
          const title = lines[0].replace(/^\d+\.\s*/, '');
          const content = lines.slice(1).join('\n');
          
          return (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-medium mb-2">{title}</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {content}
              </div>
            </div>
          );
        })}
      </div>
      
      {!expanded && (
        <div className="text-center mt-2">
          <div className="h-12 bg-gradient-to-t from-white to-transparent absolute bottom-0 left-0 right-0"></div>
        </div>
      )}
    </div>
  );
};

CropInformation.propTypes = {
  cropInfo: PropTypes.string
};

export default CropInformation; 