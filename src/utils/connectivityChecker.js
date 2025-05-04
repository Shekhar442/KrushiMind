/**
 * Checks if the device has an internet connection
 * @returns {Promise<boolean>} True if online, false if offline
 */
export const checkConnectivity = async () => {
    // First check the browser's navigator.onLine property
    if (!navigator.onLine) {
      return false;
    }
    
    // Then try to fetch a small resource to confirm actual connectivity
    try {
      // Attempt to fetch a small file with a cache-busting parameter
      const response = await fetch(`/api/ping?_=${Date.now()}`, {
        method: 'HEAD',
        // Short timeout to prevent long waits
        signal: AbortSignal.timeout(3000)
      });
      
      return response.ok;
    } catch (error) {
      console.log('Connectivity check failed:', error);
      return false;
    }
  };
  
  /**
   * Set up connectivity event listeners
   * @param {Function} onOnline - Callback when device goes online
   * @param {Function} onOffline - Callback when device goes offline
   * @returns {Function} Function to remove event listeners
   */
  export const setupConnectivityListeners = (onOnline, onOffline) => {
    const handleOnline = () => {
      updateOfflineIndicator(false);
      if (onOnline) onOnline();
    };
    
    const handleOffline = () => {
      updateOfflineIndicator(true);
      if (onOffline) onOffline();
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    checkConnectivity().then(isOnline => {
      updateOfflineIndicator(!isOnline);
      if (isOnline && onOnline) onOnline();
      if (!isOnline && onOffline) onOffline();
    });
    
    // Return function to remove event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };
  
  /**
   * Updates the offline indicator in the UI
   * @param {boolean} isOffline - Whether the device is offline
   */
  export const updateOfflineIndicator = (isOffline) => {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      if (isOffline) {
        indicator.classList.add('offline');
        indicator.setAttribute('title', 'You are offline. App is in offline mode.');
      } else {
        indicator.classList.remove('offline');
        indicator.setAttribute('title', 'You are online. Data will sync automatically.');
      }
    }
  };