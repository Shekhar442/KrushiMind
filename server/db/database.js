const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path - use /tmp for serverless environments
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/krushimind.db'
  : path.resolve(__dirname, '../../data/krushimind.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database connection
let db = null;

/**
 * Initialize the database and create tables if they don't exist
 * @returns {Promise<sqlite3.Database>} The database instance
 */
async function initDB() {
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
          price REAL NOT NULL,
          image TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Finance table
        db.run(`CREATE TABLE IF NOT EXISTS finance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // Crops table
        db.run(`CREATE TABLE IF NOT EXISTS crops (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          season TEXT,
          description TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        resolve(db);
      });
    });
  });
}

/**
 * Get the database instance
 * @returns {Promise<sqlite3.Database>} The database instance
 */
async function getDB() {
  if (!db) {
    await initDB();
  }
  return db;
}

/**
 * Close the database connection
 */
function closeDB() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
    db = null;
  }
}

module.exports = {
  initDB,
  getDB,
  closeDB
};