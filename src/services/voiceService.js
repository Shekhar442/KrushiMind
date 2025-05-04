import { loadDeepSpeechModel } from './aiService';

// Map of voice recordings
const voiceMap = {
  welcome: '/voices/welcome.mp3',
  identify: '/voices/identify.mp3',
  analyzing: '/voices/analyzing.mp3',
  error: '/voices/error.mp3',
  image_selected: '/voices/image_selected.mp3',
  // Add more voice mappings as needed
};

// Cache for audio objects
const audioCache = new Map();

// Mock implementation for development/testing
const isMockMode = true;

/**
 * Initialize speech synthesis with preferred voice
 * @param {string} language - Preferred language code
 * @returns {SpeechSynthesisVoice|null}
 */
const initSpeechSynthesis = (language) => {
  if (!window.speechSynthesis) return null;
  
  const voices = window.speechSynthesis.getVoices();
  return voices.find(voice => voice.lang.startsWith(language)) || voices[0];
};

/**
 * Play a pre-recorded voice prompt
 * @param {string} key - Key of the voice prompt to play
 * @returns {Promise<void>}
 */
export const playVoice = async (key) => {
  if (!voiceMap[key]) {
    console.warn(`Voice prompt not found: ${key}`);
    return;
  }
  
  try {
    if (isMockMode) {
      // Mock implementation for development
      console.log(`[MOCK] Playing voice: ${key}`);
      
      // Simulate audio delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Log what would be played
      const mockTexts = {
        welcome: "Welcome to KrushiMind",
        identify: "Identify Crop Problems",
        analyzing: "Analyzing your crop image",
        error: "An error occurred",
        image_selected: "Image selected"
      };
      
      console.log(`[MOCK] Voice content: ${mockTexts[key] || key}`);
      return;
    }
    
    let audio = audioCache.get(key);
    
    if (!audio) {
      audio = new Audio(voiceMap[key]);
      audioCache.set(key, audio);
    }
    
    // Reset audio if it's already played
    if (audio.currentTime > 0) {
      audio.currentTime = 0;
    }
    
    await audio.play();
  } catch (error) {
    console.error('Error playing voice prompt:', error);
  }
};

/**
 * Speak text using speech synthesis
 * @param {string} text - Text to speak
 * @param {string} language - Language code (default: 'en-IN')
 * @returns {Promise<void>}
 */
export const speakText = (text, language = 'en-IN') => {
  return new Promise((resolve, reject) => {
    if (isMockMode) {
      // Mock implementation for development
      console.log(`[MOCK] Speaking text: ${text}`);
      
      // Simulate speech delay
      setTimeout(() => {
        console.log(`[MOCK] Finished speaking: ${text}`);
        resolve();
      }, text.length * 50); // Rough estimate of speech duration
      
      return;
    }
    
    if (!window.speechSynthesis) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = initSpeechSynthesis(language);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);
    
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Initialize voice recognition
 * @param {string} language - Language code (default: 'en-IN')
 * @returns {Promise<SpeechRecognition>}
 */
export const initVoiceRecognition = async (language = 'en-IN') => {
  if (isMockMode) {
    // Mock implementation for development
    console.log(`[MOCK] Initializing voice recognition with language: ${language}`);
    return {
      start: () => console.log('[MOCK] Voice recognition started'),
      stop: () => console.log('[MOCK] Voice recognition stopped'),
      abort: () => console.log('[MOCK] Voice recognition aborted')
    };
  }
  
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    throw new Error('Speech recognition not supported');
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = language;
  
  return recognition;
};

/**
 * Listen for voice input
 * @param {SpeechRecognition} recognition - Speech recognition instance
 * @param {Function} onResult - Callback for recognition result
 * @param {Function} onError - Callback for recognition error
 */
export const listenForVoice = (recognition, onResult, onError) => {
  if (isMockMode) {
    // Mock implementation for development
    console.log('[MOCK] Listening for voice input');
    
    // Simulate voice input after a delay
    setTimeout(() => {
      const mockTranscript = 'This is a mock voice input';
      console.log(`[MOCK] Voice input received: ${mockTranscript}`);
      if (onResult) onResult(mockTranscript);
    }, 2000);
    
    return;
  }
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };
  
  recognition.onerror = (event) => {
    console.error('Voice recognition error:', event.error);
    if (onError) onError(event.error);
  };
  
  recognition.start();
};

/**
 * Class for managing voice recognition with callbacks
 */
class VoiceRecognitionManager {
  constructor() {
    this.recognition = null;
    this.isSupported = typeof window !== 'undefined' && 
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    this.currentLanguage = 'en-IN';
    this.onResult = null;
    this.onError = null;
    this.onEnd = null;
  }

  initialize() {
    if (!this.isSupported) {
      console.error('Speech recognition is not supported in this browser');
      return false;
    }

    if (typeof window === 'undefined') {
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentLanguage;

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      if (this.onResult) {
        this.onResult(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      if (this.onEnd) {
        this.onEnd();
      }
    };

    return true;
  }

  setLanguage(language) {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  start() {
    if (this.recognition) {
      try {
        this.recognition.start();
        return true;
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        return false;
      }
    }
    return false;
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  setCallbacks({ onResult, onError, onEnd }) {
    this.onResult = onResult;
    this.onError = onError;
    this.onEnd = onEnd;
  }
}

// Create a singleton instance for the voice recognition manager
const voiceRecognitionManager = typeof window !== 'undefined' ? new VoiceRecognitionManager() : null;

export { voiceRecognitionManager }; 