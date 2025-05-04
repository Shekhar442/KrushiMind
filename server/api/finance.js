const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');

/**
 * GET /api/finance/schemes
 * Get government schemes for farmers
 */
router.get('/schemes', (req, res) => {
  const db = getDB();
  
  const query = `
    SELECT * FROM financial_info 
    WHERE type = 'scheme'
    ORDER BY name ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching government schemes:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

/**
 * GET /api/finance/loans
 * Get agricultural loan information
 */
router.get('/loans', (req, res) => {
  const db = getDB();
  
  const query = `
    SELECT * FROM financial_info 
    WHERE type = 'loan'
    ORDER BY name ASC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching loan information:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

/**
 * GET /api/finance
 * Get all financial information (both schemes and loans)
 */
router.get('/', (req, res) => {
  const db = getDB();
  
  db.all('SELECT * FROM financial_info ORDER BY type, name', [], (err, rows) => {
    if (err) {
      console.error('Error fetching financial information:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Group by type for easier frontend processing
    const schemes = rows.filter(row => row.type === 'scheme');
    const loans = rows.filter(row => row.type === 'loan');
    
    res.json({
      schemes,
      loans
    });
  });
});

/**
 * POST /api/finance/schemes
 * Add a new government scheme
 * Admin only endpoint
 */
router.post('/schemes', (req, res) => {
  const db = getDB();
  const { 
    name, 
    description, 
    eligibility, 
    application, 
    documents 
  } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const stmt = db.prepare(`
    INSERT INTO financial_info 
    (type, name, description, eligibility, application, documents, updated_at)
    VALUES ('scheme', ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    name,
    description,
    eligibility || null,
    application || null,
    documents || null,
    Date.now(),
    function(err) {
      if (err) {
        console.error('Error adding government scheme:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(201).json({
        id: this.lastID,
        success: true,
        message: 'Government scheme added successfully'
      });
    }
  );
  
  stmt.finalize();
});

/**
 * POST /api/finance/loans
 * Add a new agricultural loan
 * Admin only endpoint
 */
router.post('/loans', (req, res) => {
  const db = getDB();
  const { 
    name, 
    description, 
    interestRate, 
    eligibility, 
    application, 
    documents 
  } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const stmt = db.prepare(`
    INSERT INTO financial_info 
    (type, name, description, interest_rate, eligibility, application, documents, updated_at)
    VALUES ('loan', ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    name,
    description,
    interestRate || null,
    eligibility || null,
    application || null,
    documents || null,
    Date.now(),
    function(err) {
      if (err) {
        console.error('Error adding agricultural loan:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(201).json({
        id: this.lastID,
        success: true,
        message: 'Agricultural loan added successfully'
      });
    }
  );
  
  stmt.finalize();
});

/**
 * GET /api/finance/:id
 * Get specific financial information by ID
 */
router.get('/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  
  db.get('SELECT * FROM financial_info WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching financial information:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Financial information not found' });
    }
    
    res.json(row);
  });
});

/**
 * PUT /api/finance/:id
 * Update financial information
 * Admin only endpoint
 */
router.put('/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { 
    name, 
    description, 
    interestRate, 
    eligibility, 
    application, 
    documents 
  } = req.body;
  
  // Check if financial info exists
  db.get('SELECT * FROM financial_info WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching financial information:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Financial information not found' });
    }
    
    // Update the financial information
    const updateFields = [];
    const updateParams = [];
    
    if (name) {
      updateFields.push('name = ?');
      updateParams.push(name);
    }
    
    if (description) {
      updateFields.push('description = ?');
      updateParams.push(description);
    }
    
    if (interestRate !== undefined && row.type === 'loan') {
      updateFields.push('interest_rate = ?');
      updateParams.push(interestRate);
    }
    
    if (eligibility !== undefined) {
      updateFields.push('eligibility = ?');
      updateParams.push(eligibility);
    }
    
    if (application !== undefined) {
      updateFields.push('application = ?');
      updateParams.push(application);
    }
    
    if (documents !== undefined) {
      updateFields.push('documents = ?');
      updateParams.push(documents);
    }
    
    // Always update the timestamp
    updateFields.push('updated_at = ?');
    updateParams.push(Date.now());
    
    if (updateFields.length === 1 && updateFields[0].startsWith('updated_at')) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Add ID as the last parameter
    updateParams.push(id);
    
    const query = `
      UPDATE financial_info 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    db.run(query, updateParams, function(err) {
      if (err) {
        console.error('Error updating financial information:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        success: true,
        message: 'Financial information updated successfully'
      });
    });
  });
});

/**
 * DELETE /api/finance/:id
 * Delete financial information
 * Admin only endpoint
 */
router.delete('/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  
  // Check if financial info exists
  db.get('SELECT * FROM financial_info WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching financial information:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Financial information not found' });
    }
    
    // Delete the financial information
    db.run('DELETE FROM financial_info WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting financial information:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        success: true,
        message: 'Financial information deleted successfully'
      });
    });
  });
});

module.exports = router;