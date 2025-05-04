const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');

/**
 * GET /api/crops/diseases
 * Get list of crop diseases
 */
router.get('/diseases', (req, res) => {
  const db = getDB();
  
  // Get query parameters for filtering
  const cropType = req.query.crop;
  
  let query = 'SELECT * FROM crop_diseases';
  const params = [];
  
  if (cropType) {
    query += ' WHERE crop_type = ?';
    params.push(cropType);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching crop diseases:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

/**
 * POST /api/crops/identify
 * Store crop disease identification result
 */
router.post('/identify', (req, res) => {
  const db = getDB();
  const { imageData, result, timestamp, userId } = req.body;
  
  if (!imageData || !result) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const stmt = db.prepare(`
    INSERT INTO identifications 
    (image_data, disease_name, confidence, treatment, timestamp, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    imageData,
    result.disease,
    result.confidence,
    result.treatment,
    timestamp || Date.now(),
    userId || null,
    function(err) {
      if (err) {
        console.error('Error storing identification:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(201).json({ 
        id: this.lastID,
        success: true,
        message: 'Identification stored successfully'
      });
    }
  );
  
  stmt.finalize();
});

/**
 * GET /api/crops/identifications
 * Get crop disease identifications
 */
router.get('/identifications', (req, res) => {
  const db = getDB();
  const userId = req.query.userId;
  
  let query = 'SELECT * FROM identifications';
  const params = [];
  
  if (userId) {
    query += ' WHERE user_id = ?';
    params.push(userId);
  }
  
  query += ' ORDER BY timestamp DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching identifications:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

/**
 * GET /api/crops/identifications/:id
 * Get specific identification by ID
 */
router.get('/identifications/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  
  db.get('SELECT * FROM identifications WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching identification:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Identification not found' });
    }
    
    res.json(row);
  });
});

module.exports = router;