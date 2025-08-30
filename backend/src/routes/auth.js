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

// === NEW: Check if student email exists and needs password change ===
router.post('/checkStudentLogin', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Query to check if student exists and get must_change_password flag
    const [rows] = await pool.execute(
      'SELECT id, email, must_change_password FROM students WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student email not found' });
    }

    const student = rows[0];
    
    res.json({
      studentExists: true,
      mustChangePassword: student.must_change_password,
      email: student.email
    });

  } catch (error) {
    console.error('Check student login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// === NEW: Set new password for student ===
router.post('/setStudentPassword', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Password validation (modern requirements)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      });
    }

    // Check if student exists and must change password
    const [studentRows] = await pool.execute(
      'SELECT id, must_change_password FROM students WHERE email = ?',
      [email]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!studentRows[0].must_change_password) {
      return res.status(400).json({ message: 'Password change not required for this student' });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and set must_change_password to false
    await pool.execute(
      'UPDATE students SET password_hash = ?, must_change_password = FALSE WHERE email = ?',
      [hashedPassword, email]
    );

    res.json({ 
      message: 'Password set successfully',
      success: true 
    });

  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// === UPDATED: Student login with password change checks ===
router.post('/studentLogin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find student by email - updated to include must_change_password
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, password_hash, must_change_password, teacher_id, session_id FROM students WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const student = rows[0];

    // Check if student still needs to change password
    if (student.must_change_password) {
      return res.status(403).json({ 
        message: 'Password must be changed before login',
        mustChangePassword: true 
      });
    }

    // Check if password is set (in case it's null)
    if (!student.password_hash) {
      return res.status(403).json({ 
        message: 'Password must be set before login',
        mustChangePassword: true 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, student.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Set session - keeping your existing session structure
    req.session.student_id = student.id;
    req.session.student_email = student.email;
    req.session.student_name = `${student.first_name} ${student.last_name}`;
    req.session.user_type = 'student';
    req.session.teacher_id = student.teacher_id;
    req.session.session_id = student.session_id;

    res.json({
      message: 'Login successful',
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        teacher_id: student.teacher_id,
        session_id: student.session_id
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