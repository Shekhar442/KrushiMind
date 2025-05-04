import { cropIdentificationService } from './cropIdentificationService';
import { geminiService } from './geminiService';

let model = null;
let isModelLoading = false;
let modelLoadError = null;

// List of crop diseases the model can identify
const CROP_DISEASES = {
  HEALTHY: 'Healthy',
  BACTERIAL_BLIGHT: 'Bacterial Blight',
  LEAF_BLAST: 'Leaf Blast',
  BROWN_SPOT: 'Brown Spot',
  // Add more diseases as needed
};

/**
 * Validate image data
 * @param {string} imageData - Base64 encoded image
 * @returns {boolean} Whether the image data is valid
 */
const validateImageData = (imageData) => {
  if (!imageData) {
    throw new Error('No image data provided');
  }
  
  // Check if it's a base64 string
  if (!imageData.startsWith('data:image')) {
    throw new Error('Invalid image format. Please provide a base64 encoded image.');
  }
  
  // Check file size (max 5MB)
  const base64String = imageData.split(',')[1];
  const fileSize = Math.ceil((base64String.length * 3) / 4);
  if (fileSize > 5 * 1024 * 1024) {
    throw new Error('Image size too large. Please provide an image under 5MB.');
  }
  
  return true;
};

// Validate API configuration
const validateAPIConfig = () => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error('API configuration error. Please check your Gemini API credentials in the .env.local file.');
  }
};

/**
 * Load the model (no longer needed as we're using API)
 * @returns {Promise<void>}
 */
export const loadModel = async () => {
  try {
    validateAPIConfig();
    return true;
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
};

/**
 * Preprocess an image for the model
 * @param {string} imageData - Base64 encoded image
 * @returns {Promise<tf.Tensor>}
 */
const preprocessImage = async (imageData) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Convert image to tensor
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([224, 224]) // Resize to model's expected size
          .toFloat()
          .expandDims();
        
        // Normalize
        const normalized = tensor.div(255.0);
        
        resolve(normalized);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = imageData;
  });
};

/**
 * Get recommendations based on identified disease
 * @param {string} disease - Identified disease
 * @returns {string} Treatment recommendations
 */
const getRecommendations = (disease) => {
  const recommendations = {
    [CROP_DISEASES.HEALTHY]: 'Your crop appears healthy. Continue with regular maintenance.',
    [CROP_DISEASES.BACTERIAL_BLIGHT]: 'Remove infected leaves and apply copper-based bactericide. Ensure proper spacing for air circulation.',
    [CROP_DISEASES.LEAF_BLAST]: 'Apply fungicide treatment and improve drainage. Monitor nitrogen levels.',
    [CROP_DISEASES.BROWN_SPOT]: 'Apply appropriate fungicide and maintain balanced soil nutrients. Check soil pH.',
    // Add more recommendations as needed
  };
  
  return recommendations[disease] || 'Consult a local agricultural expert for specific treatment advice.';
};

/**
 * Identify crop disease from image
 * @param {string} imageData - Base64 encoded image
 * @returns {Promise<Object>} Identification result
 */
export const identifyCrop = async (imageData) => {
  try {
    console.log('Starting crop identification...');
    
    // Validate API configuration
    validateAPIConfig();
    
    // Validate image data
    validateImageData(imageData);

    // Step 1: Initial crop identification
    console.log('Identifying crop...');
    const cropData = await cropIdentificationService.identifyCrop(imageData);
    
    // Step 2: Get detailed analysis
    console.log('Getting detailed analysis...');
    const detailedAnalysis = await geminiService.getDetailedAnalysis({
      ...cropData,
      imageData
    });
    
    // Step 3: Get treatment plan
    console.log('Generating treatment plan...');
    const treatmentPlan = await geminiService.getTreatmentPlan({
      ...cropData,
      ...detailedAnalysis
    });
    
    // Step 4: Get recommendations
    console.log('Getting recommendations...');
    const recommendations = await cropIdentificationService.getCropRecommendations({
      ...cropData,
      ...detailedAnalysis,
      treatmentPlan
    });

    // Combine all results
    const finalResults = {
      ...cropData,
      ...detailedAnalysis,
      treatmentPlan,
      recommendations,
      metadata: {
        model: 'Gemini 2.5 Pro Preview 03-25',
        version: '1.0',
        timestamp: new Date().toISOString()
      }
    };

    console.log('Analysis complete:', finalResults);
    return finalResults;
  } catch (error) {
    console.error('Error in identifyCrop:', error);
    
    // Provide more specific error messages
    if (error.message.includes('API configuration error')) {
      throw new Error('API configuration error. Please check your Gemini API credentials in the .env.local file.');
    } else if (error.message.includes('Invalid API key')) {
      throw new Error('Invalid API key. Please check your Gemini API credentials in the .env.local file.');
    } else if (error.message.includes('API access denied')) {
      throw new Error('API access denied. Please verify your API key permissions.');
    } else if (error.message.includes('rate limit exceeded')) {
      throw new Error('API rate limit exceeded. Please try again later.');
    } else {
      throw error;
    }
  }
};

/**
 * Get crop information
 * @param {string} cropName - Name of the crop
 * @returns {Promise<string>} Crop information
 */
export const getCropInformation = async (cropName) => {
  try {
    if (!cropName) {
      throw new Error('Crop name is required');
    }
    const analysis = await geminiService.detectDisease(null, cropName);
    return analysis.detailedAnalysis;
  } catch (error) {
    console.error('Error getting crop information:', error);
    throw new Error('Failed to get crop information. Please try again.');
  }
};

/**
 * Get disease recommendations
 * @param {string} disease - Disease name
 * @param {string} cropType - Crop type
 * @returns {Promise<string>} Treatment recommendations
 */
export const getDiseaseRecommendations = async (disease, cropType = '') => {
  try {
    if (!disease) {
      throw new Error('Disease name is required');
    }
    const analysis = await geminiService.detectDisease(null, disease, cropType);
    return analysis.treatmentPlan;
  } catch (error) {
    console.error('Error getting disease recommendations:', error);
    throw new Error('Failed to get disease recommendations. Please try again.');
  }
};