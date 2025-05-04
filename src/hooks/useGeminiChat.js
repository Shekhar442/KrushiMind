import { useState, useCallback } from 'react';
import { geminiService } from '../services/geminiService';

export const useGeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (message) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message to chat
      setMessages(prev => [...prev, { role: 'user', content: message }]);

      // Get response from Gemini
      const response = await geminiService.getChatResponse(message, messages);

      // Add assistant response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat
  };
}; 