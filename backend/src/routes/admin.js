const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const crypto = require('crypto');

// Simple password protection - just for you
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-secret-password';

// Middleware to check admin password
const checkAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Generate random code
const generateCode = () => {
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `GI-${randomPart.substring(0, 6)}`;
};

// Create new access code
router.post('/create-code', checkAdminAuth, async (req, res) => {
  const { email, notes } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const code = generateCode();

    await pool.execute(
      'INSERT INTO access_codes (code, email, notes) VALUES (?, ?, ?)',
      [code, email, notes || '']
    );

    res.json({
      success: true,
      code: code,
      email: email,
      message: 'Access code created successfully'
    });

  } catch (error) {
    console.error('Create code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// List all codes
router.get('/list-codes', checkAdminAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, code, email, created_at, used, used_at, notes FROM access_codes ORDER BY created_at DESC'
    );

    res.json({ codes: rows });

  } catch (error) {
    console.error('List codes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;