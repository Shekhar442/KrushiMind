import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/CropIdentifier.module.css';
import { useVoiceService } from '../../hooks/useVoiceService';
import { storeIdentification } from '../../utils/storage';
import { identifyCrop } from '../../services/aiService';

const CropIdentifierComponent = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  
  const fileInputRef = useRef(null);
  const router = useRouter();
  const { playVoice, speakText } = useVoiceService();

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      playVoice('error');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
    setResults(null);
    playVoice('image_selected');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      playVoice('error');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
    setResults(null);
    playVoice('image_selected');
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    try {
      setIsAnalyzing(true);
      setError('');
      playVoice('analyzing');

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      
      reader.onload = async () => {
        const base64Image = reader.result;
        
        // Call AI service to identify crop
        const identificationResult = await identifyCrop(base64Image);
        
        // Store result in IndexedDB
        await storeIdentification(base64Image, identificationResult);
        
        setResults(identificationResult);
        setIsAnalyzing(false);
        
        // Speak the results
        const resultText = `Identified crop: ${identificationResult.cropName}. 
          Health status: ${identificationResult.healthStatus}. 
          ${identificationResult.recommendations}`;
        speakText(resultText);
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError('Failed to analyze image. Please try again.');
      setIsAnalyzing(false);
      playVoice('error');
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Identify Crop Problems</h1>
        <p className={styles.subtitle}>Take or upload a photo of your crop to identify issues</p>
      </div>

      <div 
        className={styles.imageUpload}
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        {!previewUrl ? (
          <p>Click or drag an image here</p>
        ) : (
          <div className={styles.previewContainer}>
            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isAnalyzing ? (
        <div className={styles.loading}>Analyzing image...</div>
      ) : (
        <>
          {selectedImage && !results && (
            <button 
              className={styles.analyzeButton}
              onClick={analyzeImage}
            >
              Analyze Image
            </button>
          )}

          {results && (
            <div className={styles.results}>
              <h2>Results</h2>
              <p><strong>Crop:</strong> {results.cropName}</p>
              <p><strong>Health Status:</strong> {results.healthStatus}</p>
              <p><strong>Recommendations:</strong> {results.recommendations}</p>
            </div>
          )}
        </>
      )}

      <button className={styles.backButton} onClick={handleBack}>
        Back to Home
      </button>
    </div>
  );
};

export default CropIdentifierComponent;