// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../db'); // Import pool from your db connection

router.post('/teacherLogin', async (req, res) => {
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

// === POST /api/auth/studentLogin ===
router.post('/studentLogin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find student by email
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, password_hash FROM students WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const student = rows[0];

    // Verify password (assuming you're using bcrypt)
    const bcrypt = require('bcrypt');
    const isValidPassword = await bcrypt.compare(password, student.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Set session
    req.session.student_id = student.id;
    req.session.student_email = student.email;
    req.session.student_name = `${student.first_name} ${student.last_name}`;
    req.session.user_type = 'student';

    res.json({
      message: 'Login successful',
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// === POST /api/auth/studentLogout ===
router.post('/studentLogout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ message: 'Logged out successfully' });
  });
});

// === GET /api/auth/studentCheck ===
router.get('/studentCheck', (req, res) => {
  if (req.session.student_id) {
    res.json({
      isAuthenticated: true,
      student: {
        id: req.session.student_id,
        email: req.session.student_email,
        name: req.session.student_name
      }
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

module.exports = router;