import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Helper function to clean and parse JSON response
const cleanAndParseJSON = (text) => {
  try {
    // Remove markdown code block syntax if present
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error('Invalid response format from AI model');
  }
};

const responseTemplate = `
1. Disease Name
2. Description
3. Symptoms
4. Causes
5. Treatment Options
6. Prevention Methods
7. Best Practices
8. Harvesting Guidelines
`;

const schema = {
  type: "object",
  properties: {
    diseaseName: { type: "string" },
    description: { type: "string" },
    symptoms: { type: "array", items: { type: "string" } },
    causes: { type: "array", items: { type: "string" } },
    treatmentOptions: { type: "array", items: { type: "string" } },
    preventionMethods: { type: "array", items: { type: "string" } },
    bestPractices: { type: "array", items: { type: "string" } },
    harvestingGuidelines: { type: "array", items: { type: "string" } }
  },
  required: ["diseaseName", "description", "symptoms", "treatmentOptions"]
};

export const cropIdentificationService = {
  async identifyCrop(imageData) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        You are an expert agricultural scientist. Analyze this plant image and provide the following information in JSON format.
        Do not include any markdown formatting or additional text, just the JSON object.
        
        Required information:
        1. Crop name and variety
        2. Growth stage
        3. Health status (healthy, diseased, stressed)
        4. Confidence level (0-1)
        5. Key characteristics (leaves, stems, flowers, fruits)
        6. Environmental conditions (soil type, water needs, temperature range, sunlight needs)
        7. Common diseases and pests
        8. Cultivation tips
        
        JSON format:
        {
          "cropName": "string",
          "variety": "string",
          "growthStage": "string",
          "healthStatus": "string",
          "confidence": number,
          "characteristics": {
            "leaves": ["string"],
            "stems": ["string"],
            "flowers": ["string"],
            "fruits": ["string"]
          },
          "environmentalConditions": {
            "soilType": "string",
            "waterNeeds": "string",
            "temperatureRange": "string",
            "sunlightNeeds": "string"
          },
          "commonDiseases": ["string"],
          "pests": ["string"],
          "cultivationTips": ["string"]
        }
      `;

      // Convert base64 to blob
      const base64Data = imageData.split(',')[1];
      const binaryData = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });

      const result = await model.generateContent([
        {
          text: prompt
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Clean and parse the JSON response
      const cropData = cleanAndParseJSON(text);
      
      // Validate the response
      if (!cropData.cropName || !cropData.healthStatus) {
        throw new Error('Invalid response from AI model');
      }
      
      return cropData;
    } catch (error) {
      console.error('Error in identifyCrop:', error);
      throw new Error('Failed to identify crop. Please try again.');
    }
  },

  async getCropRecommendations(data) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        You are an expert agricultural scientist. Based on the following crop information, provide detailed recommendations in JSON format.
        Do not include any markdown formatting or additional text, just the JSON object.
        
        Crop Information:
        - Crop: ${data.cropName}
        - Variety: ${data.variety}
        - Growth Stage: ${data.growthStage}
        - Health Status: ${data.healthStatus}
        - Environmental Conditions: ${JSON.stringify(data.environmentalConditions)}
        
        JSON format:
        {
          "generalCare": ["string"],
          "diseasePrevention": ["string"],
          "pestControl": ["string"],
          "fertilization": ["string"],
          "harvesting": ["string"],
          "storage": ["string"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return cleanAndParseJSON(text);
    } catch (error) {
      console.error('Error in getCropRecommendations:', error);
      throw new Error('Failed to generate recommendations. Please try again.');
    }
  }
}; 