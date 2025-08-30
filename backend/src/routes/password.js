// backend/routes/password.js
const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../db'); // your MySQL pool
const router = express.Router();

// POST /change-password
router.post('/', async (req, res) => {
  try {
    const studentId = req.session.student_id; // get logged-in student
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    const { newPassword, confirmPassword } = req.body;
    if (!newPassword || !confirmPassword)
      return res.status(400).json({ error: 'Password fields required' });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match' });

    const hashed = await bcrypt.hash(newPassword, 12);

    await pool.query(
      'UPDATE students SET password_hash = ?, must_change_password = FALSE WHERE id = ?',
      [hashed, studentId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
