const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../config/authMiddleware');

// --- DISCOVER SHOPS (public browse/search) ---
// GET /api/shops?category=Clothing&search=rina
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT shop_id, business_name, category, logo_url, description, slug FROM shops WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND business_name LIKE ?';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY created_at DESC';

    const [shops] = await pool.query(query, params);
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shops', details: err.message });
  }
});

// --- GET A SINGLE SHOP'S PUBLIC STOREFRONT (shop info + products) ---
// GET /api/shops/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [shopRows] = await pool.query(
      'SELECT shop_id, owner_name, business_name, category, logo_url, description, slug, phone_number FROM shops WHERE slug = ?',
      [slug]
    );
    if (shopRows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    const shop = shopRows[0];

    const [products] = await pool.query(
      'SELECT product_id, name, price, description, image_url, in_stock FROM products WHERE shop_id = ? AND in_stock = TRUE ORDER BY posted_at DESC',
      [shop.shop_id]
    );

    // Log the view for analytics (user_id is optional — null if not logged in)
    const userId = req.query.viewer_id || null;
    await pool.query('INSERT INTO views_log (shop_id, user_id) VALUES (?, ?)', [shop.shop_id, userId]);

    res.json({ shop, products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shop', details: err.message });
  }
});

// --- UPDATE SHOP PROFILE (owner only) ---
router.put('/me', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ error: 'Only shop accounts can update a shop profile' });
    }
    const { business_name, category, description, logo_url } = req.body;
    await pool.query(
      'UPDATE shops SET business_name = ?, category = ?, description = ?, logo_url = ? WHERE shop_id = ?',
      [business_name, category, description, logo_url, req.user.id]
    );
    res.json({ message: 'Shop profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

// --- SHOP ANALYTICS (owner only, paid-tier feature) ---
router.get('/me/analytics', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'shop') {
      return res.status(403).json({ error: 'Only shop accounts can view analytics' });
    }
    const shopId = req.user.id;

    const [[{ total_views }]] = await pool.query(
      'SELECT COUNT(*) AS total_views FROM views_log WHERE shop_id = ?', [shopId]
    );
    const [[{ total_followers }]] = await pool.query(
      'SELECT COUNT(*) AS total_followers FROM follows WHERE shop_id = ?', [shopId]
    );

    res.json({ total_views, total_followers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
  }
});

module.exports = router;
