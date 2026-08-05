const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireAuth = require('../config/authMiddleware');

// ============ CHAT ============

// --- GET MESSAGES for a chat (opens only when the user clicks the Chat icon) ---
router.get('/chat/:shopId', requireAuth, async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user.role === 'user' ? req.user.id : req.query.userId;

    const [chatRows] = await pool.query(
      'SELECT chat_id FROM chats WHERE user_id = ? AND shop_id = ?',
      [userId, shopId]
    );
    if (chatRows.length === 0) {
      return res.json({ chat_id: null, messages: [] }); // no conversation yet
    }
    const chatId = chatRows[0].chat_id;

    const [messages] = await pool.query(
      'SELECT message_id, sender_type, message_text, timestamp FROM messages WHERE chat_id = ? ORDER BY timestamp ASC',
      [chatId]
    );
    res.json({ chat_id: chatId, messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
  }
});

// --- SEND A MESSAGE (either the customer or the shop owner can send) ---
router.post('/chat/:shopId', requireAuth, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { message_text, userId: bodyUserId } = req.body;
    const senderType = req.user.role; // 'user' or 'shop'
    const userId = req.user.role === 'user' ? req.user.id : bodyUserId;

    if (!message_text) return res.status(400).json({ error: 'message_text is required' });

    // Find or create the chat thread
    let [chatRows] = await pool.query('SELECT chat_id FROM chats WHERE user_id = ? AND shop_id = ?', [userId, shopId]);
    let chatId;
    if (chatRows.length === 0) {
      const [result] = await pool.query('INSERT INTO chats (user_id, shop_id) VALUES (?, ?)', [userId, shopId]);
      chatId = result.insertId;
    } else {
      chatId = chatRows[0].chat_id;
    }

    await pool.query(
      'INSERT INTO messages (chat_id, sender_type, message_text) VALUES (?, ?, ?)',
      [chatId, senderType, message_text]
    );

    res.status(201).json({ message: 'Message sent', chat_id: chatId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

// ============ STATUS FEED ============

// --- GET STATUS UPDATES for a single shop (opens only when Status icon is clicked) ---
router.get('/status/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const [updates] = await pool.query(
      `SELECT sf.status_id, sf.posted_at, p.product_id, p.name, p.price, p.image_url
       FROM status_feed sf
       JOIN products p ON sf.product_id = p.product_id
       WHERE sf.shop_id = ? AND sf.expires_at > NOW()
       ORDER BY sf.posted_at DESC`,
      [shopId]
    );
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status updates', details: err.message });
  }
});

// --- GET STATUS FEED across ALL shops a user follows (a combined discovery feed) ---
router.get('/status', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ error: 'Only customer accounts have a combined status feed' });
    }
    const [updates] = await pool.query(
      `SELECT sf.status_id, sf.posted_at, s.shop_id, s.business_name, p.product_id, p.name, p.price, p.image_url
       FROM status_feed sf
       JOIN products p ON sf.product_id = p.product_id
       JOIN shops s ON sf.shop_id = s.shop_id
       JOIN follows f ON f.shop_id = s.shop_id AND f.user_id = ?
       WHERE sf.expires_at > NOW()
       ORDER BY sf.posted_at DESC`,
      [req.user.id]
    );
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status feed', details: err.message });
  }
});

module.exports = router;
