// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // your MySQL connection

router.post('/login/teacher', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  try {
    const [rows] = await db.query('SELECT * FROM teachers WHERE email = ?', [email]);

    if (rows.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

    const teacher = rows[0];
    const match = await bcrypt.compare(password, teacher.password_hash);

    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    // Return teacher_id for frontend redirect
    res.json({ message: 'Login successful', teacher_id: teacher.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

