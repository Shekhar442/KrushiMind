import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-03-25';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const USE_MOCK = process.env.NEXT_PUBLIC_ENABLE_MOCK_API === 'true' || !process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Mock data for development
const MOCK_DISEASES = [
  'Healthy',
  'Bacterial Blight',
  'Leaf Blight',
  'Brown Spot',
  'Powdery Mildew',
  'Rust'
];

const MOCK_CROPS = [
  'Rice',
  'Wheat',
  'Corn',
  'Soybean',
  'Cotton',
  'Potato'
];

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

class GeminiService {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    this.baseURL = GEMINI_API_URL;
    
    if (!this.apiKey) {
      console.error('Gemini API key not found in environment variables.');
      console.error('Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env file.');
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  async analyzeContent(content, type = 'text', options = {}) {
    if (USE_MOCK) {
      console.log('Using mock implementation for analysis');
      return this.mockAnalyzeContent(content, type, options);
    }

    if (!this.isConfigured) {
      return {
        error: 'Gemini API is not configured. Please set up your API key in the environment variables.'
      };
    }

    try {
      const model = type === 'image' ? 'gemini-pro-vision' : 'gemini-pro';
      const endpoint = `/${model}:generateContent`;

      const requestBody = {
        contents: [{
          parts: type === 'image' ? [
            {
              text: options.prompt || "Analyze this image and provide detailed information."
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: content.split(',')[1]
              }
            }
          ] : [
            {
              text: content
            }
          ]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 32,
          topP: options.topP || 1,
          maxOutputTokens: options.maxOutputTokens || 1000,
        }
      };

      const response = await this.client.post(endpoint, requestBody);
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error in analyzeContent:', error);
      return {
        error: 'Failed to analyze content. Please try again later.'
      };
    }
  }

  async detectDisease(imageData, cropType = null) {
    const prompt = `You are an expert agricultural scientist specializing in plant disease detection. 
    Analyze this plant image carefully and provide the following information in JSON format:
    {
      "cropType": "specific crop name or 'Unknown' if unclear",
      "disease": "specific disease name or 'Healthy' if no disease detected",
      "confidence": "0-1 score based on certainty",
      "symptoms": ["array of observed symptoms or empty if healthy"],
      "severity": "mild/moderate/severe/healthy",
      "immediateAction": "first steps to take or 'No action needed' if healthy",
      "potentialConfusions": ["similar diseases to consider or empty if healthy"]
    }`;

    const result = await this.analyzeContent(imageData, 'image', { prompt });
    return typeof result === 'string' ? JSON.parse(result) : result;
  }

  async getDetailedAnalysis(data) {
    if (USE_MOCK) {
      console.log('Using mock implementation for detailed analysis');
      return this.mockGetDetailedAnalysis(data);
    }

    if (!this.isConfigured) {
      throw new Error('API configuration error. Please check your Gemini API credentials in the .env file.');
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        You are an expert agricultural scientist. Based on the following crop information, provide a detailed analysis in JSON format.
        Do not include any markdown formatting or additional text, just the JSON object.
        
        Crop Information:
        - Crop: ${data.cropName}
        - Variety: ${data.variety}
        - Growth Stage: ${data.growthStage}
        - Health Status: ${data.healthStatus}
        - Characteristics: ${JSON.stringify(data.characteristics)}
        - Environmental Conditions: ${JSON.stringify(data.environmentalConditions)}
        
        JSON format:
        {
          "diseaseAnalysis": {
            "symptoms": ["string"],
            "potentialDiseases": ["string"],
            "severity": "string",
            "spreadRisk": "string"
          },
          "pestAnalysis": {
            "signs": ["string"],
            "potentialPests": ["string"],
            "infestationLevel": "string",
            "damageAssessment": "string"
          },
          "environmentalAnalysis": {
            "soilHealth": "string",
            "waterManagement": "string",
            "temperatureImpact": "string",
            "lightConditions": "string"
          },
          "growthAnalysis": {
            "developmentStage": "string",
            "growthRate": "string",
            "yieldPotential": "string",
            "nutrientStatus": "string"
          }
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return cleanAndParseJSON(text);
    } catch (error) {
      console.error('Error in getDetailedAnalysis:', error);
      throw new Error('Failed to generate detailed analysis. Please try again.');
    }
  }

  async getTreatmentPlan(data) {
    if (USE_MOCK) {
      console.log('Using mock implementation for treatment plan');
      return this.mockGetTreatmentPlan(data);
    }

    if (!this.isConfigured) {
      throw new Error('API configuration error. Please check your Gemini API credentials in the .env file.');
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        You are an expert agricultural scientist. Based on the following crop information and analysis, provide a comprehensive treatment plan in JSON format.
        Do not include any markdown formatting or additional text, just the JSON object.
        
        Crop Information:
        - Crop: ${data.cropName}
        - Health Status: ${data.healthStatus}
        - Disease Analysis: ${JSON.stringify(data.diseaseAnalysis)}
        - Pest Analysis: ${JSON.stringify(data.pestAnalysis)}
        - Environmental Analysis: ${JSON.stringify(data.environmentalAnalysis)}
        - Growth Analysis: ${JSON.stringify(data.growthAnalysis)}
        
        JSON format:
        {
          "immediateActions": {
            "priority": "string",
            "timeline": "string",
            "actions": ["string"]
          },
          "preventiveMeasures": {
            "culturalPractices": ["string"],
            "biologicalControls": ["string"],
            "chemicalControls": ["string"],
            "monitoringSchedule": "string"
          },
          "nutritionManagement": {
            "fertilizerRecommendations": ["string"],
            "applicationSchedule": "string",
            "soilAmendments": ["string"]
          },
          "environmentalOptimization": {
            "waterManagement": ["string"],
            "temperatureControl": ["string"],
            "lightOptimization": ["string"]
          }
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return cleanAndParseJSON(text);
    } catch (error) {
      console.error('Error in getTreatmentPlan:', error);
      throw new Error('Failed to generate treatment plan. Please try again.');
    }
  }

  async getChatResponse(message, history = []) {
    const prompt = `You are an expert agricultural assistant. Provide helpful and accurate information about farming, crops, and plant diseases.
    
    Previous conversation:
    ${history.map(h => `${h.role}: ${h.content}`).join('\n')}
    
    Current question: ${message}
    
    Provide a detailed and helpful response.`;

    return this.analyzeContent(prompt, 'text', { temperature: 0.7 });
  }

  // Mock implementation for development
  async mockAnalyzeContent(content, type, options) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (type === 'image') {
      return JSON.stringify({
        cropType: 'Rice',
        disease: 'Healthy',
        confidence: 0.85,
        symptoms: [],
        severity: 'healthy',
        immediateAction: 'No action needed',
        potentialConfusions: []
      });
    }
    
    return 'This is a mock response for development purposes.';
  }

  async analyzeImage(imageData) {
    if (USE_MOCK) {
      console.log('Using mock implementation for image analysis');
      return this.mockAnalyzeImage(imageData);
    }
    
    return this.retryWithBackoff(async () => {
      try {
        const response = await this.client.post('/analyze', {
          image: imageData,
          model: 'gemma-vision',
          task: 'crop-disease-detection',
          options: {
            confidence_threshold: 0.7,
            max_detections: 5
          }
        });
        return response.data;
      } catch (error) {
        console.error('Gemma API Error:', error);
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your Gemma API credentials.');
        }
        throw new Error('Failed to analyze image with Gemma API');
      }
    });
  }

  async getRecommendations(disease, cropType = '') {
    if (USE_MOCK) {
      console.log('Using mock implementation for recommendations');
      return this.mockGetRecommendations(disease, cropType);
    }
    
    return this.retryWithBackoff(async () => {
      try {
        const prompt = `As an agricultural expert, provide detailed treatment recommendations for ${disease} ${cropType ? `in ${cropType} crops` : 'in crops'}. 
          Include:
          1. Immediate treatment steps
          2. Preventive measures
          3. Best practices for management
          4. Potential impact if left untreated
          Format the response in clear sections.`;
          
        const response = await this.client.post('/generate', {
          prompt,
          model: 'gemma-text',
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.9
        });
        return response.data.text;
      } catch (error) {
        console.error('Gemma API Error:', error);
        throw new Error('Failed to get recommendations from Gemma API');
      }
    });
  }

  async getCropInformation(cropName) {
    if (USE_MOCK) {
      console.log('Using mock implementation for crop information');
      return this.mockGetCropInformation(cropName);
    }
    
    return this.retryWithBackoff(async () => {
      try {
        const prompt = `Provide comprehensive information about ${cropName} cultivation, including:
          1. Growing conditions
          2. Common diseases
          3. Best practices
          4. Harvesting tips`;
          
        const response = await this.client.post('/generate', {
          prompt,
          model: 'gemma-text',
          max_tokens: 600,
          temperature: 0.7
        });
        return response.data.text;
      } catch (error) {
        console.error('Gemma API Error:', error);
        throw new Error('Failed to get crop information from Gemma API');
      }
    });
  }

  // Mock implementations for development and testing
  async mockAnalyzeImage(imageData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate random results
    const cropName = MOCK_CROPS[Math.floor(Math.random() * MOCK_CROPS.length)];
    const disease = MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];
    const confidence = 0.7 + Math.random() * 0.3; // Random confidence between 0.7 and 1.0
    
    return {
      cropName,
      disease,
      confidence,
      detections: [
        {
          disease,
          confidence,
          boundingBox: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 }
        }
      ]
    };
  }

  async mockGetRecommendations(disease, cropType = '') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
    
    return responseTemplate;
  }

  async mockGetCropInformation(cropName) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
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
    
    return responseTemplate;
  }

  async mockGetDetailedAnalysis(cropData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      growthAnalysis: {
        currentStage: 'Vegetative growth stage with healthy development',
        nextStages: ['Flowering', 'Fruiting'],
        growthRate: 'Optimal',
        developmentIssues: ['None identified']
      },
      healthAssessment: {
        overallHealth: 'Good',
        nutrientStatus: ['Nitrogen levels optimal', 'Phosphorus slightly low'],
        stressFactors: ['None identified'],
        diseaseRisk: 'Low'
      },
      environmentalImpact: {
        soilHealth: 'Good',
        waterEfficiency: 'High',
        climateAdaptation: 'Well-adapted',
        sustainabilityScore: '8/10'
      },
      yieldProjection: {
        expectedYield: 'Above average',
        yieldFactors: ['Optimal growth conditions', 'Good plant health'],
        optimizationPotential: 'Moderate',
        harvestTimeline: '8-10 weeks'
      }
    };
  }

  async mockGetTreatmentPlan(cropData) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      immediateActions: {
        priority: 'low',
        actions: ['Monitor growth', 'Maintain current care routine'],
        timeline: 'Ongoing'
      },
      preventiveMeasures: {
        culturalPractices: ['Regular weeding', 'Proper spacing'],
        biologicalControls: ['Natural predators', 'Beneficial insects'],
        chemicalControls: ['None required'],
        monitoringSchedule: 'Weekly'
      },
      nutritionManagement: {
        fertilizerRecommendations: ['NPK 10-10-10', 'Organic compost'],
        applicationSchedule: 'Every 2 weeks',
        soilAmendments: ['Compost', 'Vermicompost']
      },
      environmentalOptimization: {
        waterManagement: ['Regular irrigation', 'Drainage maintenance'],
        temperatureControl: ['Natural ventilation', 'Shade management'],
        lightOptimization: ['Full sun exposure', 'No shading required']
      }
    };
  }
}

export const geminiService = new GeminiService(); 