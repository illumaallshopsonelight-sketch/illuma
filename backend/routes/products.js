const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../config/authMiddleware');

const FREE_TIER_PRODUCT_LIMIT = 15; // free-tier shops can only list this many active products

// --- ADD A PRODUCT (shop owner only) ---
// Also creates a status_feed entry so it shows up in followers' "Status" view.
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ error: 'Only shop accounts can add products' });
    }
    const shopId = req.user.id;
    const { name, price, description, image_url } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    // Enforce free-tier product limit
    const [[{ tier }]] = await pool.query('SELECT subscription_tier AS tier FROM shops WHERE shop_id = ?', [shopId]);
    if (tier === 'free') {
      const [[{ count }]] = await pool.query(
        'SELECT COUNT(*) AS count FROM products WHERE shop_id = ? AND in_stock = TRUE', [shopId]
      );
      if (count >= FREE_TIER_PRODUCT_LIMIT) {
        return res.status(403).json({
          error: `Free tier is limited to ${FREE_TIER_PRODUCT_LIMIT} active products. Upgrade to add more.`
        });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO products (shop_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [shopId, name, price, description || null, image_url || null]
    );

    // Auto-create a status feed entry, expiring after 48 hours (like WhatsApp Status)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO status_feed (shop_id, product_id, expires_at) VALUES (?, ?, ?)',
      [shopId, result.insertId, expiresAt]
    );

    res.status(201).json({ product_id: result.insertId, message: 'Product added and posted to status feed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
});

// --- EDIT A PRODUCT (shop owner only, must own it) ---
router.put('/:productId', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ error: 'Only shop accounts can edit products' });
    }
    const { productId } = req.params;
    const { name, price, description, image_url, in_stock } = req.body;

    const [rows] = await pool.query('SELECT shop_id FROM products WHERE product_id = ?', [productId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    if (rows[0].shop_id !== req.user.id) return res.status(403).json({ error: 'You do not own this product' });

    await pool.query(
      'UPDATE products SET name = ?, price = ?, description = ?, image_url = ?, in_stock = ? WHERE product_id = ?',
      [name, price, description, image_url, in_stock, productId]
    );
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// --- DELETE A PRODUCT ---
router.delete('/:productId', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ error: 'Only shop accounts can delete products' });
    }
    const { productId } = req.params;
    const [rows] = await pool.query('SELECT shop_id FROM products WHERE product_id = ?', [productId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    if (rows[0].shop_id !== req.user.id) return res.status(403).json({ error: 'You do not own this product' });

    await pool.query('DELETE FROM products WHERE product_id = ?', [productId]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

module.exports = router;
