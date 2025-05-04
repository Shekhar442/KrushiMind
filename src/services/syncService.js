import { 
    getPendingSyncItems, 
    updateSyncItemStatus, 
    clearCompletedSyncItems,
    getIdentifications,
    getMarketplaceListings
  } from '../utils/storage';
  import { checkConnectivity } from '../utils/connectivityChecker';
  
  // Backend API URLs
  const API_ENDPOINTS = {
    IDENTIFICATION: '/api/identifications',
    MARKETPLACE: '/api/marketplace',
    FINANCE: '/api/finance'
  };
  
  // Maximum sync attempts before giving up
  const MAX_SYNC_ATTEMPTS = 5;
  
  /**
   * Performs a sync operation if internet is available
   * @returns {Promise<{success: boolean, synced: number, failed: number}>}
   */
  export const syncIfPossible = async () => {
    try {
      const isOnline = await checkConnectivity();
      
      if (!isOnline) {
        console.log('No internet connection. Sync aborted.');
        return { success: false, synced: 0, failed: 0 };
      }
      
      console.log('Internet connection available. Starting sync...');
      return await performSync();
    } catch (error) {
      console.error('Error during sync check:', error);
      return { success: false, synced: 0, failed: 0 };
    }
  };
  
  /**
   * Performs the actual sync operation
   * @returns {Promise<{success: boolean, synced: number, failed: number}>}
   */
  const performSync = async () => {
    try {
      // Get pending sync items
      const pendingItems = await getPendingSyncItems();
      
      if (pendingItems.length === 0) {
        console.log('No items to sync.');
        return { success: true, synced: 0, failed: 0 };
      }
      
      console.log(`Found ${pendingItems.length} items to sync.`);
      
      let syncedCount = 0;
      let failedCount = 0;
      
      // Process each pending item
      for (const item of pendingItems) {
        try {
          // Skip items that have exceeded max attempts
          if (item.attempts >= MAX_SYNC_ATTEMPTS) {
            await updateSyncItemStatus(item.id, 'failed', { 
              reason: 'Exceeded maximum sync attempts' 
            });
            failedCount++;
            continue;
          }
          
          const syncResult = await syncItem(item);
          
          if (syncResult.success) {
            await updateSyncItemStatus(item.id, 'completed', syncResult.details);
            syncedCount++;
          } else {
            await updateSyncItemStatus(item.id, 'failed', syncResult.details);
            failedCount++;
          }
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
          await updateSyncItemStatus(item.id, 'failed', { 
            error: error.message 
          });
          failedCount++;
        }
      }
      
      // Clean up old completed sync items (older than 7 days)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      await clearCompletedSyncItems(sevenDaysAgo);
      
      return { 
        success: true, 
        synced: syncedCount, 
        failed: failedCount 
      };
    } catch (error) {
      console.error('Error during sync operation:', error);
      return { success: false, synced: 0, failed: 0 };
    }
  };
  
  /**
   * Syncs a specific item to the backend
   * @param {Object} item - Sync queue item
   * @returns {Promise<{success: boolean, details: Object}>}
   */
  const syncItem = async (item) => {
    try {
      let endpoint;
      let payload;
      let method = 'POST';
      
      // Prepare the request based on item type
      switch (item.type) {
        case 'identification':
          endpoint = API_ENDPOINTS.IDENTIFICATION;
          const identifications = await getIdentifications();
          const identification = identifications.find(i => i.id === item.itemId);
          if (!identification) {
            return { 
              success: false, 
              details: { reason: 'Identification not found' } 
            };
          }
          payload = identification;
          break;
          
        case 'marketplace':
          endpoint = API_ENDPOINTS.MARKETPLACE;
          const listings = await getMarketplaceListings();
          const listing = listings.find(l => l.id === item.itemId);
          if (!listing) {
            return { 
              success: false, 
              details: { reason: 'Marketplace listing not found' } 
            };
          }
          payload = listing;
          break;
          
        default:
          return { 
            success: false, 
            details: { reason: `Unknown sync type: ${item.type}` } 
          };
      }
      
      // Make the API call
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        return { 
          success: false, 
          details: { 
            status: response.status, 
            statusText: response.statusText 
          } 
        };
      }
      
      const responseData = await response.json();
      
      return { 
        success: true, 
        details: { responseData } 
      };
    } catch (error) {
      console.error('Error syncing item:', error);
      return { 
        success: false, 
        details: { error: error.message } 
      };
    }
  };