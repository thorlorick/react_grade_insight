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

// ========================================
// TEACHER ROUTES
// ========================================

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

router.post('/teacherSignup', async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, schoolName } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

  try {
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword || !schoolName) {
      await logLoginAttempt(email || 'unknown', ipAddress, 'signup_failure', 'teacher');
      return res.status(400).json({ 
        message: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await logLoginAttempt(email, ipAddress, 'signup_failure', 'teacher');
      return res.status(400).json({ 
        message: 'Please enter a valid email address' 
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      await logLoginAttempt(email, ipAddress, 'signup_failure', 'teacher');
      return res.status(400).json({ 
        message: 'Passwords do not match' 
      });
    }

    // Password validation (same as student requirements)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      await logLoginAttempt(email, ipAddress, 'weak_password', 'teacher');
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      });
    }

    // Check if teacher already exists
    const [existingTeacher] = await pool.execute(
      'SELECT id FROM teachers WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingTeacher.length > 0) {
      await logLoginAttempt(email, ipAddress, 'signup_duplicate_email', 'teacher');
      return res.status(409).json({ 
        message: 'An account with this email already exists' 
      });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new teacher
    const [result] = await pool.execute(
      'INSERT INTO teachers (first_name, last_name, email, password_hash, school_name, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [firstName.trim(), lastName.trim(), email.toLowerCase(), hashedPassword, schoolName.trim()]
    );

    const teacherId = result.insertId;

    // Log successful signup
    await logLoginAttempt(email, ipAddress, 'signup_success', 'teacher');

    // Automatically log them in after successful signup
    req.session.teacher_id = teacherId;
    req.session.teacher_email = email.toLowerCase();
    req.session.teacher_name = `${firstName.trim()} ${lastName.trim()}`;

    // Log the automatic login
    await logLoginAttempt(email, ipAddress, 'success', 'teacher');

    res.status(201).json({
      message: 'Account created successfully',
      teacher: {
        id: teacherId,
        name: req.session.teacher_name,
        email: email.toLowerCase()
      }
    });

  } catch (error) {
    console.error('Teacher signup error:', error);
    await logLoginAttempt(email || 'unknown', ipAddress, 'signup_failure', 'teacher');
    
    // Check for specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: 'An account with this email already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during account creation' 
    });
  }
});

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

// ========================================
// STUDENT ROUTES
// ========================================

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

// ========================================
// PARENT ROUTES
// ========================================

router.post('/checkParentLogin', async (req, res) => {
  const { email } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    if (!email) {
      await logLoginAttempt('unknown', ipAddress, 'failure', 'parent');
      return res.status(400).json({ message: 'Email is required' });
    }

    // Query to check if parent exists
    const [rows] = await pool.execute(
      'SELECT id, email FROM parents WHERE email = ?',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      // Parent doesn't exist - they need to sign up
      await logLoginAttempt(email, ipAddress, 'email_not_found', 'parent');
      return res.status(404).json({ 
        parentExists: false,
        message: 'Parent account not found. Please sign up first.' 
      });
    }

    const parent = rows[0];
    
    // Log the email check (successful verification that email exists)
    await logLoginAttempt(email, ipAddress, 'email_verified', 'parent');
    
    res.json({
      parentExists: true,
      parentId: parent.id,
      email: parent.email
    });

  } catch (error) {
    console.error('Check parent login error:', error);
    await logLoginAttempt(email || 'unknown', ipAddress, 'failure', 'parent');
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/parentSignup', async (req, res) => {
  const { email, password, childEmails } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

  try {
    // Validate required fields
    if (!email || !password || !childEmails || childEmails.length === 0) {
      await logLoginAttempt(email || 'unknown', ipAddress, 'signup_failure', 'parent');
      return res.status(400).json({ 
        message: 'Email, password, and at least one child email are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await logLoginAttempt(email, ipAddress, 'signup_failure', 'parent');
      return res.status(400).json({ 
        message: 'Please enter a valid email address' 
      });
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      await logLoginAttempt(email, ipAddress, 'weak_password', 'parent');
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      });
    }

    // Check if parent already exists
    const [existingParent] = await pool.execute(
      'SELECT id FROM parents WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingParent.length > 0) {
      await logLoginAttempt(email, ipAddress, 'signup_duplicate_email', 'parent');
      return res.status(409).json({ 
        message: 'An account with this email already exists. Please try logging in.' 
      });
    }

    // Validate all child emails and check if they exist
    const validChildIds = [];
    const invalidEmails = [];

    for (const childEmail of childEmails) {
      if (!emailRegex.test(childEmail)) {
        invalidEmails.push(childEmail);
        continue;
      }

      const [studentRows] = await pool.execute(
        'SELECT id FROM students WHERE email = ?',
        [childEmail.toLowerCase()]
      );

      if (studentRows.length === 0) {
        invalidEmails.push(childEmail);
      } else {
        validChildIds.push(studentRows[0].id);
      }
    }

    if (invalidEmails.length > 0) {
      await logLoginAttempt(email, ipAddress, 'signup_invalid_children', 'parent');
      return res.status(400).json({ 
        message: `The following student email(s) were not found: ${invalidEmails.join(', ')}` 
      });
    }

    if (validChildIds.length === 0) {
      await logLoginAttempt(email, ipAddress, 'signup_no_valid_children', 'parent');
      return res.status(400).json({ 
        message: 'No valid student emails provided' 
      });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new parent
    const [result] = await pool.execute(
      'INSERT INTO parents (email, password_hash, created_at) VALUES (?, ?, NOW())',
      [email.toLowerCase(), hashedPassword]
    );

    const parentId = result.insertId;

    // Create parent-student relationships
    for (const studentId of validChildIds) {
      await pool.execute(
        'INSERT INTO parent_student (parent_id, student_id) VALUES (?, ?)',
        [parentId, studentId]
      );
    }

    // Log successful signup
    await logLoginAttempt(email, ipAddress, 'signup_success', 'parent');

    // Automatically log them in after successful signup
    req.session.parent_id = parentId;
    req.session.parent_email = email.toLowerCase();
    req.session.user_type = 'parent';

    // Log the automatic login
    await logLoginAttempt(email, ipAddress, 'success', 'parent');

    res.status(201).json({
      message: 'Parent account created successfully',
      parent: {
        id: parentId,
        email: email.toLowerCase(),
        childrenCount: validChildIds.length
      }
    });

  } catch (error) {
    console.error('Parent signup error:', error);
    await logLoginAttempt(email || 'unknown', ipAddress, 'signup_failure', 'parent');
    
    // Check for specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: 'An account with this email already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during account creation' 
    });
  }
});

router.post('/parentLogin', async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

  if (!email || !password) {
    await logLoginAttempt(email || 'unknown', ipAddress, 'failure', 'parent');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find parent by email
    const [rows] = await pool.execute(
      'SELECT id, email, password_hash FROM parents WHERE email = ?',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      await logLoginAttempt(email, ipAddress, 'failure', 'parent');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const parent = rows[0];

    // Check if password is set
    if (!parent.password_hash) {
      await logLoginAttempt(email, ipAddress, 'no_password_set', 'parent');
      return res.status(403).json({ 
        message: 'Password must be set before login'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, parent.password_hash);

    if (!isValidPassword) {
      await logLoginAttempt(email, ipAddress, 'failure', 'parent');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Log successful attempt
    await logLoginAttempt(email, ipAddress, 'success', 'parent');

    // Set session
    req.session.parent_id = parent.id;
    req.session.parent_email = parent.email;
    req.session.user_type = 'parent';

    res.json({
      message: 'Login successful',
      parent: {
        id: parent.id,
        email: parent.email
      }
    });

  } catch (error) {
    console.error('Parent login error:', error);
    await logLoginAttempt(email, ipAddress, 'failure', 'parent');
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/parentLogout', (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
  const email = req.session.parent_email || 'unknown';
  
  req.session.destroy((err) => {
    if (err) {
      logLoginAttempt(email, ipAddress, 'logout_failure', 'parent').catch(console.error);
      return res.status(500).json({ message: 'Could not log out' });
    }
    
    logLoginAttempt(email, ipAddress, 'logout_success', 'parent').catch(console.error);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/parentCheck', (req, res) => {
  if (req.session.parent_id) {
    res.json({
      isAuthenticated: true,
      parent: {
        id: req.session.parent_id,
        email: req.session.parent_email
      }
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// ========================================
// ACCESS CODE ROUTES
// ========================================

router.post('/verifyAccessCode', async (req, res) => {
  const { code } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

  try {
    if (!code || !code.trim()) {
      return res.status(400).json({ 
        valid: false,
        message: 'Access code is required' 
      });
    }

    // Check if code exists and hasn't been used
    const [rows] = await pool.execute(
      'SELECT id, email, used FROM access_codes WHERE code = ?',
      [code.trim()]
    );

    if (rows.length === 0) {
      // Code doesn't exist
      await logLoginAttempt('unknown', ipAddress, 'invalid_access_code', 'teacher');
      return res.json({ 
        valid: false,
        message: 'Invalid access code' 
      });
    }

    const accessCode = rows[0];

    if (accessCode.used) {
      // Code already used
      await logLoginAttempt('unknown', ipAddress, 'used_access_code', 'teacher');
      return res.json({ 
        valid: false,
        message: 'This access code has already been used' 
      });
    }

    // Code is valid and unused
    await logLoginAttempt('unknown', ipAddress, 'valid_access_code', 'teacher');
    res.json({ 
      valid: true,
      message: 'Access code verified' 
    });

  } catch (error) {
    console.error('Verify access code error:', error);
    res.status(500).json({ 
      valid: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;