// backend/src/routes/password.js
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { pool } = require('../db');

const router = express.Router();

// === POST /api/password/create-token ===
// Creates a password reset token for a student (used internally by upload process)
const createPasswordToken = async (studentId) => {
  try {
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

    // Store token in database
    await pool.execute(
      'INSERT INTO password_reset_tokens (student_id, token, expires_at) VALUES (?, ?, ?)',
      [studentId, token, expiresAt]
    );

    return { success: true, token };
  } catch (error) {
    console.error('Error creating password token:', error);
    return { success: false, error: error.message };
  }
};

// === GET /api/password/verify/:token ===
// Verify if a token is valid and not expired
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const [rows] = await pool.execute(
      `SELECT pt.*, s.first_name, s.last_name, s.email 
       FROM password_reset_tokens pt
       JOIN students s ON pt.student_id = s.id
       WHERE pt.token = ? AND pt.expires_at > NOW() AND pt.used = FALSE`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired token' 
      });
    }

    const student = rows[0];
    res.json({
      valid: true,
      student: {
        id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email
      }
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// === POST /api/password/set ===
// Set password using valid token
router.post('/set', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ 
      error: 'Token and password are required' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long' 
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verify token is still valid
    const [tokenRows] = await conn.execute(
      `SELECT pt.*, s.email 
       FROM password_reset_tokens pt
       JOIN students s ON pt.student_id = s.id
       WHERE pt.token = ? AND pt.expires_at > NOW() AND pt.used = FALSE`,
      [token]
    );

    if (tokenRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ 
        error: 'Invalid or expired token' 
      });
    }

    const { student_id } = tokenRows[0];

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update student password
    await conn.execute(
      'UPDATE students SET password_hash = ? WHERE id = ?',
      [passwordHash, student_id]
    );

    // Mark token as used
    await conn.execute(
      'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
      [token]
    );

    await conn.commit();

    res.json({ 
      success: true, 
      message: 'Password set successfully' 
    });

  } catch (error) {
    await conn.rollback();
    console.error('Error setting password:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// Export both the router and the internal function
module.exports = {
  router,
  createPasswordToken
};