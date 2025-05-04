import { useState, useEffect, useCallback } from 'react';
import { loadModel, identifyCrop } from '../services/aiService';

export const useAIService = () => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load model on mount
  useEffect(() => {
    const loadAIModel = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await loadModel();
        setModelLoaded(true);
      } catch (error) {
        console.error('Error loading AI model:', error);
        setError('Failed to load AI model.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAIModel();
  }, []);
  
  // Function to manually load the model
  const loadAIModel = useCallback(async () => {
    if (modelLoaded) return true;
    
    try {
      setLoading(true);
      setError(null);
      
      await loadModel();
      setModelLoaded(true);
      return true;
    } catch (error) {
      console.error('Error loading AI model:', error);
      setError('Failed to load AI model.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [modelLoaded]);
  
  // Function to identify crop disease
  const identifyCropDisease = useCallback(async (imageData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load model if not already loaded
      if (!modelLoaded) {
        await loadAIModel();
      }
      
      return await identifyCrop(imageData);
    } catch (error) {
      console.error('Error identifying crop disease:', error);
      setError('Failed to identify crop disease.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [modelLoaded, loadAIModel]);
  
  return {
    modelLoaded,
    loading,
    error,
    loadModel: loadAIModel,
    identifyCropDisease
  };
};