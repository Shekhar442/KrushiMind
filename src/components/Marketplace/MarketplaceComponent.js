import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useVoiceService } from '../../hooks/useVoiceService';
import { storeMarketplaceListing } from '../../utils/storage';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import styles from '../../styles/Marketplace.module.css';

const MarketplaceComponent = ({ listings, loading }) => {
  const router = useRouter();
  const { playVoice, speakText, startListening } = useVoiceService();
  const { isOnline } = useOfflineStorage();
  
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'create'
  const [newListing, setNewListing] = useState({
    productName: '',
    productType: 'vegetable',
    quantity: '',
    unit: 'kg',
    price: '',
    description: '',
    contactInfo: '',
    image: null
  });
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'view') {
      playVoice('view_listings');
    } else {
      playVoice('create_listing');
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing(prev => ({ ...prev, [name]: value }));
  };

  // Handle voice input for description
  const handleVoiceInput = (field) => {
    playVoice('speak_now');
    
    startListening(
      (result) => {
        setNewListing(prev => ({ ...prev, [field]: result }));
      },
      (error) => {
        console.error('Voice recognition error:', error);
        playVoice('voice_error');
      }
    );
  };

  // Handle image selection
  const handleImageSelect = () => {
    fileInputRef.current.click();
  };

  // Handle image change
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setNewListing(prev => ({ ...prev, image: event.target.result }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Submit listing
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newListing.productName || !newListing.quantity || !newListing.price) {
      playVoice('fill_required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      await storeMarketplaceListing(newListing);
      
      // Success feedback
      playVoice('listing_created');
      speakText('Your listing has been created successfully!');
      
      // Reset form
      setNewListing({
        productName: '',
        productType: 'vegetable',
        quantity: '',
        unit: 'kg',
        price: '',
        description: '',
        contactInfo: '',
        image: null
      });
      
      // Switch to view tab to see the new listing
      setActiveTab('view');
      
      // Refresh listings
      router.reload();
    } catch (error) {
      console.error('Error creating listing:', error);
      playVoice('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className={styles.marketplaceContainer}>
      <h1 className={styles.title}>Sell Your Crops</h1>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'view' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('view')}
        >
          <img src="/images/view-icon.png" alt="View" />
          <span>View Listings</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'create' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('create')}
        >
          <img src="/images/create-icon.png" alt="Create" />
          <span>Create Listing</span>
        </button>
      </div>
      
      {activeTab === 'view' ? (
        <div className={styles.listingsContainer}>
          {loading ? (
            <div className={styles.loadingIndicator}>
              <p>Loading marketplace listings...</p>
            </div>
          ) : listings.length > 0 ? (
            <div className={styles.listingsGrid}>
              {listings.map((listing) => (
                <div key={listing.id} className={styles.listingCard}>
                  {listing.image && (
                    <div className={styles.listingImage}>
                      <img src={listing.image} alt={listing.productName} />
                    </div>
                  )}
                  <div className={styles.listingDetails}>
                    <h3>{listing.productName}</h3>
                    <p className={styles.listingType}>{listing.productType}</p>
                    <p className={styles.listingQuantity}>
                      {listing.quantity} {listing.unit}
                    </p>
                    <p className={styles.listingPrice}>₹{listing.price}</p>
                    {listing.description && (
                      <p className={styles.listingDescription}>{listing.description}</p>
                    )}
                    {listing.contactInfo && (
                      <p className={styles.listingContact}>{listing.contactInfo}</p>
                    )}
                    <div className={styles.listingSyncStatus}>
                      {listing.synced ? (
                        <span className={styles.syncedIndicator}>Synced</span>
                      ) : (
                        <span className={styles.localIndicator}>Local Only</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No listings available. Create your first listing!</p>
              <button 
                className={styles.createButton}
                onClick={() => handleTabChange('create')}
              >
                Create Listing
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.createListingForm}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="productName">Crop Name <span className={styles.required}>*</span></label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={newListing.productName}
                onChange={handleInputChange}
                placeholder="e.g., Tomatoes, Rice, Wheat"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="productType">Crop Type</label>
              <select
                id="productType"
                name="productType"
                value={newListing.productType}
                onChange={handleInputChange}
              >
                <option value="vegetable">Vegetable</option>
                <option value="fruit">Fruit</option>
                <option value="grain">Grain</option>
                <option value="pulse">Pulse</option>
                <option value="spice">Spice</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="quantity">Quantity <span className={styles.required}>*</span></label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={newListing.quantity}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={newListing.unit}
                  onChange={handleInputChange}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="quintal">Quintals</option>
                  <option value="ton">Tons</option>
                  <option value="dozen">Dozen</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="price">Price (₹) <span className={styles.required}>*</span></label>
              <input
                type="number"
                id="price"
                name="price"
                value={newListing.price}
                onChange={handleInputChange}
                placeholder="Price per unit in Rupees"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <div className={styles.textareaWithVoice}>
                <textarea
                  id="description"
                  name="description"
                  value={newListing.description}
                  onChange={handleInputChange}
                  placeholder="Describe your crop quality, harvest date, etc."
                  rows={3}
                ></textarea>
                <button 
                  type="button" 
                  className={styles.voiceButton}
                  onClick={() => handleVoiceInput('description')}
                >
                  <img src="/images/mic-icon.png" alt="Voice Input" />
                </button>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="contactInfo">Contact Information</label>
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                value={newListing.contactInfo}
                onChange={handleInputChange}
                placeholder="Your phone number or village name"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Crop Image</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <div className={styles.imageUpload}>
                {newListing.image ? (
                  <div className={styles.previewImage}>
                    <img src={newListing.image} alt="Crop Preview" />
                    <button 
                      type="button" 
                      className={styles.changeImageButton}
                      onClick={handleImageSelect}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className={styles.uploadButton}
                    onClick={handleImageSelect}
                  >
                    <img src="/images/camera-icon.png" alt="Upload" />
                    <span>Take Photo</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className={styles.offlineWarning}>
              {!isOnline && (
                <p>You are currently offline. Your listing will be saved locally and synced when you're back online.</p>
              )}
            </div>
            
            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => handleTabChange('view')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <button 
        className={styles.backButton}
        onClick={handleBackToHome}
      >
        Back to Home
      </button>
    </div>
  );
};

export default MarketplaceComponent;