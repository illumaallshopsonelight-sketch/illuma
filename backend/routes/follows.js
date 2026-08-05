const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../config/authMiddleware');

// --- FOLLOW A SHOP (adds it to the customer's "shop list", like adding a contact) ---
router.post('/:shopId', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only customer accounts can follow shops' });
    }
    const { shopId } = req.params;
    const userId = req.user.id;

    await pool.query(
      'INSERT IGNORE INTO follows (user_id, shop_id) VALUES (?, ?)',
      [userId, shopId]
    );
    // Also create an empty chat thread so it's ready the first time they open Chat
    await pool.query(
      'INSERT IGNORE INTO chats (user_id, shop_id) VALUES (?, ?)',
      [userId, shopId]
    );

    res.status(201).json({ message: 'Now following shop' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to follow shop', details: err.message });
  }
});

// --- UNFOLLOW A SHOP ---
router.delete('/:shopId', requireAuth, async (req, res) => {
  try {
    const { shopId } = req.params;
    await pool.query('DELETE FROM follows WHERE user_id = ? AND shop_id = ?', [req.user.id, shopId]);
    res.json({ message: 'Unfollowed shop' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unfollow shop', details: err.message });
  }
});

// --- GET MY FOLLOWED SHOPS (populates the sidebar) ---
router.get('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only customer accounts have a followed-shops list' });
    }
    const [shops] = await pool.query(
      `SELECT s.shop_id, s.business_name, s.category, s.logo_url, s.slug
       FROM follows f
       JOIN shops s ON f.shop_id = s.shop_id
       WHERE f.user_id = ?
       ORDER BY f.followed_at DESC`,
      [req.user.id]
    );
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch followed shops', details: err.message });
  }
});

module.exports = router;
