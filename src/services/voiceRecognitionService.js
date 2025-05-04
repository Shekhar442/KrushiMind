class VoiceRecognitionService {
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

// Create a singleton instance
const voiceRecognitionService = typeof window !== 'undefined' ? new VoiceRecognitionService() : null;

export default voiceRecognitionService; 