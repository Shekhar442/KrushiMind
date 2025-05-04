import { useState, useEffect, useCallback } from 'react';
import voiceRecognitionService from '../services/voiceRecognitionService';

export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (!voiceRecognitionService) {
      setError('Speech recognition is not supported in this environment');
      return;
    }

    const initialized = voiceRecognitionService.initialize();
    setIsSupported(initialized);

    if (!initialized) {
      setError('Failed to initialize speech recognition');
      return;
    }

    voiceRecognitionService.setCallbacks({
      onResult: (result) => {
        setTranscript(result);
        // Simulate voice level changes based on transcript length
        setVoiceLevel(Math.min(Math.random() * 0.5 + 0.5, 1));
      },
      onError: (error) => {
        setError(error);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
        setVoiceLevel(0);
      }
    });

    return () => {
      if (voiceRecognitionService) {
        voiceRecognitionService.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!voiceRecognitionService || !isSupported) {
      setError('Speech recognition is not available');
      return;
    }

    setError(null);
    setTranscript('');
    const started = voiceRecognitionService.start();
    if (started) {
      setIsListening(true);
    } else {
      setError('Failed to start voice recognition');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (voiceRecognitionService) {
      voiceRecognitionService.stop();
      setIsListening(false);
      setVoiceLevel(0);
    }
  }, []);

  const setLanguage = useCallback((language) => {
    if (voiceRecognitionService) {
      voiceRecognitionService.setLanguage(language);
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    voiceLevel,
    isSupported,
    startListening,
    stopListening,
    setLanguage
  };
};

export default useVoiceRecognition; 