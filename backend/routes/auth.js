const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../config/db');
require('dotenv').config();

const TOKEN_EXPIRY = '7d';

function generateToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// --- CUSTOMER SIGNUP ---
router.post('/user/signup', async (req, res) => {
  try {
    const { name, phone_number, password } = req.body;
    if (!name || !phone_number || !password) {
      return res.status(400).json({ error: 'name, phone_number and password are required' });
    }

    const [existing] = await pool.query('SELECT user_id FROM users WHERE phone_number = ?', [phone_number]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this phone number already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, phone_number, password_hash) VALUES (?, ?, ?)',
      [name, phone_number, password_hash]
    );

    const token = generateToken(result.insertId, 'user');
    res.status(201).json({ token, user: { user_id: result.insertId, name, phone_number } });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
});

// --- CUSTOMER LOGIN ---
router.post('/user/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE phone_number = ?', [phone_number]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const token = generateToken(user.user_id, 'user');
    res.json({ token, user: { user_id: user.user_id, name: user.name, phone_number: user.phone_number } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// --- SHOP OWNER SIGNUP ---
router.post('/shop/signup', async (req, res) => {
  try {
    const { owner_name, business_name, category, phone_number, password, slug, description } = req.body;
    if (!owner_name || !business_name || !phone_number || !password || !slug) {
      return res.status(400).json({ error: 'owner_name, business_name, phone_number, password and slug are required' });
    }

    const [existingSlug] = await pool.query('SELECT shop_id FROM shops WHERE slug = ?', [slug]);
    if (existingSlug.length > 0) {
      return res.status(409).json({ error: 'That shop URL (slug) is already taken, choose another' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO shops (owner_name, business_name, category, phone_number, password_hash, slug, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [owner_name, business_name, category, phone_number, password_hash, slug, description || null]
    );

    const token = generateToken(result.insertId, 'shop');
    res.status(201).json({ token, shop: { shop_id: result.insertId, business_name, slug } });
  } catch (err) {
    res.status(500).json({ error: 'Shop signup failed', details: err.message });
  }
});

// --- SHOP OWNER LOGIN ---
router.post('/shop/login', async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM shops WHERE phone_number = ?', [phone_number]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const shop = rows[0];
    const match = await bcrypt.compare(password, shop.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const token = generateToken(shop.shop_id, 'shop');
    res.json({ token, shop: { shop_id: shop.shop_id, business_name: shop.business_name, slug: shop.slug } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

module.exports = router;
