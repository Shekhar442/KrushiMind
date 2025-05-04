const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const dbPath = path.resolve(__dirname, '../../data/krushimind.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database connection
let db = null;

/**
 * Initialize the database and create tables if they don't exist
 * @returns {sqlite3.Database} The database instance
 */
function initDB() {
  return new Promise((resolve, reject) => {
    console.log('Initializing database...');
    
    // Create new database connection
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      
      console.log('Connected to SQLite database.');
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');
      
      // Create tables if they don't exist
      db.serialize(() => {
        // Identifications table
        db.run(`CREATE TABLE IF NOT EXISTS identifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          imageData TEXT NOT NULL,
          result TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Marketplace table
        db.run(`CREATE TABLE IF NOT EXISTS marketplace (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          price REAL,
          imageUrl TEXT,
          sellerId TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Finance table
        db.run(`CREATE TABLE IF NOT EXISTS finance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          data TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Users table (basic)
        db.run(`CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          device_id TEXT,
          language TEXT DEFAULT 'en-IN',
          last_sync INTEGER,
          created_at INTEGER NOT NULL
        )`);
        
        console.log('Database tables created or already exist.');
        resolve(db);
      });
    });
  });
}

/**
 * Get the database instance
 * @returns {sqlite3.Database} The database instance
 */
function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

/**
 * Close the database connection
 * @returns {Promise<void>}
 */
function closeDB() {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve();
      return;
    }
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
        reject(err);
        return;
      }
      
      console.log('Database connection closed.');
      db = null;
      resolve();
    });
  });
}

// Export functions
module.exports = {
  initDB,
  getDB,
  closeDB
};