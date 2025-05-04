import { openDB } from 'idb';

// Database name and version
const DB_NAME = 'krushimind-db';
const DB_VERSION = 1;

// Store names
const STORES = {
  IDENTIFICATIONS: 'identifications',
  MARKETPLACE: 'marketplace',
  FINANCE: 'finance',
  USER_PREFS: 'userPreferences',
  SYNC_QUEUE: 'syncQueue'
};

/**
 * Get pending sync items
 * @param {number} [limit=50] - Maximum number of items to retrieve
 * @returns {Promise<Array>} Array of sync queue items
 */
export const getPendingSyncItems = async (limit = 50) => {
  try {
    const db = await initDatabase();
    const index = db.transaction(STORES.SYNC_QUEUE).store.index('byStatus');
    return await index.getAll('pending', limit);
  } catch (error) {
    console.error('Error getting pending sync items:', error);
    throw new Error('Failed to get pending sync items');
  }
};

/**
 * Update sync item status
 * @param {number} id - ID of the sync queue item
 * @param {string} status - New status ('completed', 'failed', 'pending')
 * @param {Object} [details] - Optional details about the sync attempt
 * @returns {Promise<void>}
 */
export const updateSyncItemStatus = async (id, status, details = {}) => {
  try {
    const db = await initDatabase();
    
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    
    const item = await store.get(id);
    if (!item) {
      throw new Error('Sync item not found');
    }
    
    item.status = status;
    item.lastAttempt = Date.now();
    item.attempts += 1;
    item.details = details;
    
    await store.put(item);
    await tx.done;
  } catch (error) {
    console.error('Error updating sync item status:', error);
    throw new Error('Failed to update sync item status');
  }
};

/**
 * Clear completed sync items
 * @param {number} [olderThan] - Optional timestamp to only clear items older than this
 * @returns {Promise<number>} Number of items cleared
 */
export const clearCompletedSyncItems = async (olderThan) => {
  try {
    const db = await initDatabase();
    
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORES.SYNC_QUEUE);
    const index = store.index('byStatus');
    
    const completedItems = await index.getAll('completed');
    let count = 0;
    
    for (const item of completedItems) {
      if (!olderThan || item.lastAttempt < olderThan) {
        await store.delete(item.id);
        count++;
      }
    }
    
    await tx.done;
    return count;
  } catch (error) {
    console.error('Error clearing completed sync items:', error);
    throw new Error('Failed to clear completed sync items');
  }
};

/**
 * Get marketplace listings
 * @param {string} [productType] - Optional filter by product type
 * @returns {Promise<Array>} Array of marketplace listings
 */
export const getMarketplaceListings = async (productType) => {
  try {
    const db = await initDatabase();
    
    if (productType) {
      const index = db.transaction(STORES.MARKETPLACE).store.index('byType');
      return await index.getAll(productType);
    } else {
      return await db.getAll(STORES.MARKETPLACE);
    }
  } catch (error) {
    console.error('Error getting marketplace listings:', error);
    throw new Error('Failed to get marketplace listings');
  }
};

/**
 * Store financial information
 * @param {Object} info - Financial information object
 * @returns {Promise<number>} ID of the stored record
 */
export const storeFinancialInfo = async (info) => {
  try {
    const db = await initDatabase();
    
    const enrichedInfo = {
      ...info,
      updatedAt: Date.now()
    };
    
    return await db.put(STORES.FINANCE, enrichedInfo);
  } catch (error) {
    console.error('Error storing financial info:', error);
    throw new Error('Failed to store financial info');
  }
};

/**
 * Get financial information
 * @param {number} [id] - Optional ID of specific financial info
 * @returns {Promise<Object|Array>} Financial information
 */
export const getFinancialInfo = async (id) => {
  try {
    const db = await initDatabase();
    
    if (id) {
      return await db.get(STORES.FINANCE, id);
    } else {
      return await db.getAll(STORES.FINANCE);
    }
  } catch (error) {
    console.error('Error getting financial info:', error);
    throw new Error('Failed to get financial info');
  }
};

/**
 * Set user preference
 * @param {string} key - Preference key
 * @param {any} value - Preference value
 * @returns {Promise<void>}
 */
export const setUserPreference = async (key, value) => {
  try {
    const db = await initDatabase();
    await db.put(STORES.USER_PREFS, { key, value });
  } catch (error) {
    console.error('Error setting user preference:', error);
    throw new Error('Failed to set user preference');
  }
};

/**
 * Get user preference
 * @param {string} key - Preference key
 * @returns {Promise<any>} Preference value
 */
export const getUserPreference = async (key) => {
  try {
    const db = await initDatabase();
    const pref = await db.get(STORES.USER_PREFS, key);
    return pref ? pref.value : null;
  } catch (error) {
    console.error('Error getting user preference:', error);
    throw new Error('Failed to get user preference');
  }
};

/**
 * Add item to sync queue
 * @param {string} type - Type of item to sync
 * @param {number} itemId - ID of the item to sync
 * @returns {Promise<number>} ID of the sync queue item
 */
export const addToSyncQueue = async (type, itemId) => {
  try {
    const db = await initDatabase();
    
    return await db.add(STORES.SYNC_QUEUE, {
      type,
      itemId,
      status: 'pending',
      createdAt: Date.now(),
      attempts: 0
    });
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    // Don't throw here to prevent blocking main operations
    return null;
  }
};

/**
 * Initialize the IndexedDB database
 * @returns {Promise<IDBDatabase>} The database instance
 */
export const initDatabase = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.IDENTIFICATIONS)) {
          db.createObjectStore(STORES.IDENTIFICATIONS, { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains(STORES.MARKETPLACE)) {
          const marketplaceStore = db.createObjectStore(STORES.MARKETPLACE, { keyPath: 'id', autoIncrement: true });
          marketplaceStore.createIndex('byDate', 'createdAt', { unique: false });
          marketplaceStore.createIndex('byType', 'productType', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORES.FINANCE)) {
          db.createObjectStore(STORES.FINANCE, { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains(STORES.USER_PREFS)) {
          db.createObjectStore(STORES.USER_PREFS, { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncQueue = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          syncQueue.createIndex('byStatus', 'status', { unique: false });
        }
      }
    });
    
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error('Failed to initialize database');
  }
};

/**
 * Store an identification result
 * @param {string} imageData - Base64 encoded image
 * @param {Object} result - Identification result
 * @returns {Promise<number>} ID of the stored record
 */
export const storeIdentification = async (imageData, result) => {
  try {
    const db = await initDatabase();
    
    const id = await db.add(STORES.IDENTIFICATIONS, {
      imageData,
      result,
      timestamp: Date.now(),
      synced: false
    });
    
    // Add to sync queue
    await addToSyncQueue('identification', id);
    
    return id;
  } catch (error) {
    console.error('Error storing identification:', error);
    throw new Error('Failed to store identification');
  }
};

/**
 * Get all stored identifications
 * @returns {Promise<Array>} Array of stored identifications
 */
export const getIdentifications = async () => {
  try {
    const db = await initDatabase();
    return await db.getAll(STORES.IDENTIFICATIONS);
  } catch (error) {
    console.error('Error getting identifications:', error);
    throw new Error('Failed to get identifications');
  }
};

/**
 * Store a marketplace listing
 * @param {Object} listing - Marketplace listing object
 * @returns {Promise<number>} ID of the stored record
 */
export const storeMarketplaceListing = async (listing) => {
  try {
    const db = await initDatabase();
    
    const enrichedListing = {
      ...listing,
      createdAt: Date.now(),
      synced: false
    };
    
    const id = await db.add(STORES.MARKETPLACE, enrichedListing);
    
    // Add to sync queue
    await addToSyncQueue('marketplace', id);
    
    return id;
  } catch (error) {
    console.error('Error storing marketplace listing:', error);
    throw new Error('Failed to store marketplace listing');
  }
};