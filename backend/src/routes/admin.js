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

// 🔹 Reset a student's password by email
router.post('/reset-student-password', checkAdminAuth, async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: 'Email is required' });

  try {
    const [result] = await pool.query(`
      UPDATE students
      SET password_hash = NULL, must_change_password = 1
      WHERE email = ?;
    `, [email]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Student not found' });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/contact-emails', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM contact_emails ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// List all login attempts
router.get('/login-attempts', checkAdminAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT attempt_id as id, user_email as username, ip_address, CASE WHEN status = "success" THEN 1 ELSE 0 END as success, attempt_time as timestamp FROM login_attempt ORDER BY attempt_time DESC LIMIT 20'
    );

    res.json({ success: true, attempts: rows });
  } catch (err) {
    console.error('Error fetching login attempts:', err);
    res.status(500).json({ message: 'Database error' });
  }
});


module.exports = router;




