import { useState, useEffect, useCallback } from 'react';
import { playVoice, speakText, initVoiceRecognition, listenForVoice, voiceRecognitionManager } from '../services/voiceService';
import { getUserPreference, setUserPreference } from '../utils/storage';

export const useVoiceService = () => {
  const [recognitionEngine, setRecognitionEngine] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState('en-IN');
  const [transcript, setTranscript] = useState('');
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  
  // Initialize voice services
  useEffect(() => {
    const initVoice = async () => {
      try {
        // Get user preferences
        const storedVoiceEnabled = await getUserPreference('voiceEnabled');
        if (storedVoiceEnabled !== null) {
          setVoiceEnabled(storedVoiceEnabled);
        }
        
        const storedLanguage = await getUserPreference('preferredLanguage');
        if (storedLanguage) {
          setPreferredLanguage(storedLanguage);
        }
        
        // Initialize recognition engine
        const engine = await initVoiceRecognition(preferredLanguage);
        setRecognitionEngine(engine);
        
        // Initialize voice recognition manager
        if (voiceRecognitionManager) {
          const initialized = voiceRecognitionManager.initialize();
          setIsSupported(initialized);
          
          if (initialized) {
            voiceRecognitionManager.setCallbacks({
              onResult: (result) => {
                setTranscript(result);
                // Simulate voice level changes based on transcript length
                setVoiceLevel(Math.min(Math.random() * 0.5 + 0.5, 1));
              },
              onError: (error) => {
                console.error('Voice recognition error:', error);
                setIsListening(false);
              },
              onEnd: () => {
                setIsListening(false);
                setVoiceLevel(0);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error initializing voice service:', error);
      }
    };
    
    initVoice();
    
    return () => {
      if (voiceRecognitionManager) {
        voiceRecognitionManager.stop();
      }
    };
  }, []);
  
  // Update language when preference changes
  useEffect(() => {
    const updateLanguage = async () => {
      try {
        await setUserPreference('preferredLanguage', preferredLanguage);
        
        // Re-initialize recognition engine with new language
        const engine = await initVoiceRecognition(preferredLanguage);
        setRecognitionEngine(engine);
        
        // Update language in voice recognition manager
        if (voiceRecognitionManager) {
          voiceRecognitionManager.setLanguage(preferredLanguage);
        }
      } catch (error) {
        console.error('Error updating language preference:', error);
      }
    };
    
    updateLanguage();
  }, [preferredLanguage]);
  
  // Toggle voice feature
  const toggleVoice = useCallback(async () => {
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    await setUserPreference('voiceEnabled', newValue);
  }, [voiceEnabled]);
  
  // Play voice with preference check
  const playVoiceWithCheck = useCallback((voiceKey) => {
    if (voiceEnabled) {
      return playVoice(voiceKey);
    }
    return Promise.resolve();
  }, [voiceEnabled]);
  
  // Speak text with preference check
  const speakTextWithCheck = useCallback((text) => {
    if (voiceEnabled) {
      return speakText(text, preferredLanguage);
    }
    return Promise.resolve();
  }, [voiceEnabled, preferredLanguage]);
  
  // Start voice recognition
  const startListening = useCallback(async (onResult, onError) => {
    if (!voiceEnabled || !recognitionEngine || isListening) {
      return false;
    }
    
    setIsListening(true);
    
    try {
      await listenForVoice(
        recognitionEngine,
        (result) => {
          setIsListening(false);
          if (onResult) onResult(result);
        },
        (error) => {
          setIsListening(false);
          if (onError) onError(error);
        }
      );
      
      return true;
    } catch (error) {
      setIsListening(false);
      if (onError) onError(error);
      return false;
    }
  }, [voiceEnabled, recognitionEngine, isListening]);
  
  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognitionEngine) {
      recognitionEngine.stop();
      setIsListening(false);
    }
  }, [recognitionEngine]);
  
  // Start voice recognition with manager
  const startListeningWithManager = useCallback(() => {
    if (!voiceRecognitionManager || !isSupported) {
      console.error('Speech recognition is not available');
      return false;
    }
    
    setTranscript('');
    const started = voiceRecognitionManager.start();
    if (started) {
      setIsListening(true);
    } else {
      console.error('Failed to start voice recognition');
    }
    
    return started;
  }, [isSupported]);
  
  // Stop voice recognition with manager
  const stopListeningWithManager = useCallback(() => {
    if (voiceRecognitionManager) {
      voiceRecognitionManager.stop();
      setIsListening(false);
      setVoiceLevel(0);
    }
  }, []);
  
  // Set language for voice recognition manager
  const setLanguage = useCallback((language) => {
    if (voiceRecognitionManager) {
      voiceRecognitionManager.setLanguage(language);
    }
  }, []);
  
  return {
    recognitionEngine,
    isListening,
    voiceEnabled,
    preferredLanguage,
    transcript,
    voiceLevel,
    isSupported,
    toggleVoice,
    playVoice: playVoiceWithCheck,
    speakText: speakTextWithCheck,
    startListening,
    stopListening,
    startListeningWithManager,
    stopListeningWithManager,
    setLanguage
  };
}; 