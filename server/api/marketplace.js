const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');

/**
 * GET /api/marketplace
 * Get marketplace listings
 */
router.get('/', (req, res) => {
  const db = getDB();
  
  // Get query parameters for filtering
  const productType = req.query.type;
  const minPrice = req.query.minPrice;
  const maxPrice = req.query.maxPrice;
  
  let query = 'SELECT * FROM marketplace';
  const params = [];
  const conditions = [];
  
  if (productType) {
    conditions.push('product_type = ?');
    params.push(productType);
  }
  
  if (minPrice) {
    conditions.push('price >= ?');
    params.push(minPrice);
  }
  
  if (maxPrice) {
    conditions.push('price <= ?');
    params.push(maxPrice);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching marketplace listings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

/**
 * POST /api/marketplace
 * Create a new marketplace listing
 */
router.post('/', (req, res) => {
  const db = getDB();
  const { 
    productName, 
    productType, 
    quantity, 
    unit, 
    price, 
    description, 
    contactInfo, 
    image, 
    userId 
  } = req.body;
  
  if (!productName || !productType || !quantity || !unit || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const stmt = db.prepare(`
    INSERT INTO marketplace 
    (product_name, product_type, quantity, unit, price, description, contact_info, image_data, created_at, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    productName,
    productType,
    quantity,
    unit,
    price,
    description || null,
    contactInfo || null,
    image || null,
    Date.now(),
    userId || null,
    function(err) {
      if (err) {
        console.error('Error creating marketplace listing:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(201).json({
        id: this.lastID,
        success: true,
        message: 'Marketplace listing created successfully'
      });
    }
  );
  
  stmt.finalize();
});

/**
 * GET /api/marketplace/:id
 * Get a specific marketplace listing
 */
router.get('/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  
  db.get('SELECT * FROM marketplace WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching marketplace listing:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    res.json(row);
  });
});

/**
 * PUT /api/marketplace/:id
 * Update a marketplace listing
 */
router.put('/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const { 
    productName, 
    productType, 
    quantity, 
    unit, 
    price, 
    description, 
    contactInfo, 
    image,
    userId
  } = req.body;
  
  // Check if listing exists
  db.get('SELECT * FROM marketplace WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching marketplace listing:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Verify user ownership if userId is provided
    if (userId && row.user_id && row.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }
    
    // Update the listing
    const updateFields = [];
    const updateParams = [];
    
    if (productName) {
      updateFields.push('product_name = ?');
      updateParams.push(productName);
    }
    
    if (productType) {
      updateFields.push('product_type = ?');
      updateParams.push(productType);
    }
    
    if (quantity) {
      updateFields.push('quantity = ?');
      updateParams.push(quantity);
    }
    
    if (unit) {
      updateFields.push('unit = ?');
      updateParams.push(unit);
    }
    
    if (price) {
      updateFields.push('price = ?');
      updateParams.push(price);
    }
    
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateParams.push(description);
    }
    
    if (contactInfo !== undefined) {
      updateFields.push('contact_info = ?');
      updateParams.push(contactInfo);
    }
    
    if (image !== undefined) {
      updateFields.push('image_data = ?');
      updateParams.push(image);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Add ID as the last parameter
    updateParams.push(id);
    
    const query = `
      UPDATE marketplace 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    db.run(query, updateParams, function(err) {
      if (err) {
        console.error('Error updating marketplace listing:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        success: true,
        message: 'Marketplace listing updated successfully'
      });
    });
  });
});

/**
 * DELETE /api/marketplace/:id
 * Delete a marketplace listing
 */
router.delete('/:id', (req, res) => {
  const db = getDB();
  const { id } = req.params;
  const userId = req.query.userId;
  
  // Check if listing exists and belongs to user
  db.get('SELECT * FROM marketplace WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching marketplace listing:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Verify user ownership if userId is provided
    if (userId && row.user_id && row.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }
    
    // Delete the listing
    db.run('DELETE FROM marketplace WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting marketplace listing:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        success: true,
        message: 'Marketplace listing deleted successfully'
      });
    });
  });
});

module.exports = router;