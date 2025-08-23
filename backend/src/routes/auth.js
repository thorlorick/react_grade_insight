// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../db'); // Import pool from your db connection

router.post('/login/teacher', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Use pool.execute instead of db.query to match your connection setup
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, password_hash FROM teachers WHERE email = ?', 
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const teacher = rows[0];
    const match = await bcrypt.compare(password, teacher.password_hash);
    
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Store teacher info in session
    req.session.teacher_id = teacher.id;
    req.session.teacher_email = teacher.email;
    req.session.teacher_name = `${teacher.first_name} ${teacher.last_name}`;

    // Return success with teacher info
    res.json({ 
      message: 'Login successful',
      teacher: {
        id: teacher.id,
        name: req.session.teacher_name,
        email: teacher.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;