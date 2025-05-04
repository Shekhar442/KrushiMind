import { useState, useEffect, useCallback } from 'react';
import { initDatabase } from '../utils/storage';
import { syncIfPossible } from '../services/syncService';
import { checkConnectivity, setupConnectivityListeners } from '../utils/connectivityChecker';

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'success', 'error'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStats, setSyncStats] = useState({
    synced: 0,
    failed: 0
  });
  const [dbInitialized, setDbInitialized] = useState(false);

  // Initialize database on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
        
        // Check initial connectivity
        const online = await checkConnectivity();
        setIsOnline(online);
        
        // Set up connectivity listeners
        const cleanup = setupConnectivityListeners(
          // Online callback
          () => {
            setIsOnline(true);
            // Auto-sync when coming back online
            attemptSync();
          },
          // Offline callback
          () => {
            setIsOnline(false);
          }
        );
        
        return cleanup;
      } catch (error) {
        console.error('Error initializing offline storage:', error);
      }
    };
    
    init();
  }, []);
  
  // Function to trigger sync
  const attemptSync = useCallback(async () => {
    if (!dbInitialized) {
      return { success: false, reason: 'Database not initialized' };
    }
    
    try {
      setSyncStatus('syncing');
      
      const result = await syncIfPossible();
      
      if (result.success) {
        setSyncStatus('success');
        setLastSyncTime(Date.now());
        setSyncStats({
          synced: result.synced,
          failed: result.failed
        });
      } else {
        setSyncStatus('error');
      }
      
      return result;
    } catch (error) {
      console.error('Error during sync attempt:', error);
      setSyncStatus('error');
      return { success: false, error: error.message };
    }
  }, [dbInitialized]);
  
  // Set up regular sync interval when online
  useEffect(() => {
    if (!isOnline || !dbInitialized) return;
    
    // Sync every 15 minutes when online
    const interval = setInterval(() => {
      attemptSync();
    }, 15 * 60 * 1000);
    
    // Initial sync
    attemptSync();
    
    return () => clearInterval(interval);
  }, [isOnline, dbInitialized, attemptSync]);
  
  // Format last sync time
  const getFormattedLastSyncTime = useCallback(() => {
    if (!lastSyncTime) return 'Never';
    
    try {
      const date = new Date(lastSyncTime);
      return date.toLocaleString();
    } catch (error) {
      return 'Unknown';
    }
  }, [lastSyncTime]);
  
  return {
    isOnline,
    syncStatus,
    lastSyncTime,
    formattedLastSyncTime: getFormattedLastSyncTime(),
    syncStats,
    dbInitialized,
    syncIfPossible: attemptSync
  };
};