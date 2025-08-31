// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../db'); // Import pool from your db connection

// Enhanced helper function to log all login attempts with user type
const logLoginAttempt = async (email, ipAddress, status, userType = 'unknown') => {
  try {
    await pool.execute(
      'INSERT INTO login_attempt (user_email, ip_address, status, user_type, attempt_time) VALUES (?, ?, ?, ?, NOW())',
      [email, ipAddress, status, userType]
    );
  } catch (error) {
    console.error('Error logging login attempt:', error);
    // Don't fail the login process if logging fails
  }
};

router.post('/teacherLogin', async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (!email || !password) {
    // Log failed attempt for missing credentials
    await logLoginAttempt(email || 'unknown', ipAddress, 'failure', 'teacher');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Use pool.execute instead of db.query to match your connection setup
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, password_hash FROM teachers WHERE email = ?', 
      [email]
    );
    
    if (rows.length === 0) {
      // Log failed attempt - user not found
      await logLoginAttempt(email, ipAddress, 'failure', 'teacher');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const teacher = rows[0];
    const match = await bcrypt.compare(password, teacher.password_hash);
    
    if (!match) {
      // Log failed attempt - wrong password
      await logLoginAttempt(email, ipAddress, 'failure', 'teacher');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Log successful attempt
    await logLoginAttempt(email, ipAddress, 'success', 'teacher');

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
    // Log failed attempt for server error
    await logLoginAttempt(email, ipAddress, 'failure', 'teacher');
    res.status(500).json({ message: 'Server error' });
  }
});

// === Check if student email exists and needs password change ===
router.post('/checkStudentLogin', async (req, res) => {
  const { email } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    if (!email) {
      await logLoginAttempt('unknown', ipAddress, 'failure', 'student');
      return res.status(400).json({ message: 'Email is required' });
    }

    // Query to check if student exists and get must_change_password flag
    const [rows] = await pool.execute(
      'SELECT id, email, must_change_password FROM students WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      await logLoginAttempt(email, ipAddress, 'email_not_found', 'student');
      return res.status(404).json({ message: 'Student email not found' });
    }

    const student = rows[0];
    
    // Log the email check (successful verification that email exists)
    await logLoginAttempt(email, ipAddress, 'email_verified', 'student');
    
    res.json({
      studentExists: true,
      mustChangePassword: student.must_change_password,
      email: student.email
    });

  } catch (error) {
    console.error('Check student login error:', error);
    await logLoginAttempt(email || 'unknown', ipAddress, 'failure', 'student');
    res.status(500).json({ message: 'Server error' });
  }
});

// === Set new password for student ===
router.post('/setStudentPassword', async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    if (!email || !password) {
      await logLoginAttempt(email || 'unknown', ipAddress, 'failure', 'student');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Password validation (modern requirements)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      await logLoginAttempt(email, ipAddress, 'weak_password', 'student');
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
      await logLoginAttempt(email, ipAddress, 'failure', 'student');
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!studentRows[0].must_change_password) {
      await logLoginAttempt(email, ipAddress, 'unauthorized_password_change', 'student');
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

    // Log successful password setup
    await logLoginAttempt(email, ipAddress, 'password_set', 'student');

    res.json({ 
      message: 'Password set successfully',
      success: true 
    });

  } catch (error) {
    console.error('Set password error:', error);
    await logLoginAttempt(email || 'unknown', ipAddress, 'failure', 'student');
    res.status(500).json({ message: 'Server error' });
  }
});

// === Student login with password change checks ===
router.post('/studentLogin', async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

  if (!email || !password) {
    // Log failed attempt for missing credentials
    await logLoginAttempt(email || 'unknown', ipAddress, 'failure', 'student');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find student by email - updated to include must_change_password
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, password_hash, must_change_password FROM students WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      // Log failed attempt - student not found
      await logLoginAttempt(email, ipAddress, 'failure', 'student');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const student = rows[0];

    // Check if student still needs to change password
    if (student.must_change_password) {
      // Log failed attempt - password change required
      await logLoginAttempt(email, ipAddress, 'password_change_required', 'student');
      return res.status(403).json({ 
        message: 'Password must be changed before login',
        mustChangePassword: true 
      });
    }

    // Check if password is set (in case it's null)
    if (!student.password_hash) {
      // Log failed attempt - no password set
      await logLoginAttempt(email, ipAddress, 'no_password_set', 'student');
      return res.status(403).json({ 
        message: 'Password must be set before login',
        mustChangePassword: true 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, student.password_hash);

    if (!isValidPassword) {
      // Log failed attempt - wrong password
      await logLoginAttempt(email, ipAddress, 'failure', 'student');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Log successful attempt
    await logLoginAttempt(email, ipAddress, 'success', 'student');

    // Set session - keeping your existing session structure
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
    // Log failed attempt for server error
    await logLoginAttempt(email, ipAddress, 'failure', 'student');
    res.status(500).json({ message: 'Internal server error' });
  }
});

// === POST /api/auth/studentLogout ===
router.post('/studentLogout', (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const email = req.session.student_email || 'unknown';
  
  req.session.destroy((err) => {
    if (err) {
      // Log failed logout attempt
      logLoginAttempt(email, ipAddress, 'logout_failure', 'student').catch(console.error);
      return res.status(500).json({ message: 'Could not log out' });
    }
    
    // Log successful logout
    logLoginAttempt(email, ipAddress, 'logout_success', 'student').catch(console.error);
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ message: 'Logged out successfully' });
  });
});

// === Teacher Logout (if you don't have one) ===
router.post('/teacherLogout', (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const email = req.session.teacher_email || 'unknown';
  
  req.session.destroy((err) => {
    if (err) {
      // Log failed logout attempt
      logLoginAttempt(email, ipAddress, 'logout_failure', 'teacher').catch(console.error);
      return res.status(500).json({ message: 'Could not log out' });
    }
    
    // Log successful logout
    logLoginAttempt(email, ipAddress, 'logout_success', 'teacher').catch(console.error);
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

// === GET /api/auth/teacherCheck ===
router.get('/teacherCheck', (req, res) => {
  if (req.session.teacher_id) {
    res.json({
      isAuthenticated: true,
      teacher: {
        id: req.session.teacher_id,
        email: req.session.teacher_email,
        name: req.session.teacher_name
      }
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

module.exports = router;