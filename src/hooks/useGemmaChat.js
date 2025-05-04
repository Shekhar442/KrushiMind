import { useState, useCallback } from 'react';

export const useGemmaChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleMessage = async (message) => {
    try {
      setLoading(true);
      setError(null);
      const response = await generateAgriculturalAnalysis(message);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setError('Failed to generate agricultural analysis');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = useCallback(async (message) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      
      // Generate response
      await handleMessage(message);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    loading,
    error,
    messages,
    sendMessage,
    clearChat
  };
}; 