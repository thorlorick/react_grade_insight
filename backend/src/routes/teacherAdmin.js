const express = require('express');
const { pool } = require('../db');
const bcrypt = require('bcrypt');
const router = express.Router();

// Middleware to check authentication
router.use((req, res, next) => {
  if (!req.session || !req.session.teacher_id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
});

// ============================================
// ASSIGNMENT MANAGEMENT
// ============================================

// === GET /api/teacher-admin/assignments ===
router.get('/assignments', async (req, res) => {
  const teacherId = req.session.teacher_id;

  try {
    const [rows] = await pool.execute(
      `SELECT a.id, a.name, a.due_date, a.max_points,
              COUNT(g.id) as student_count
       FROM assignments a
       LEFT JOIN grades g ON a.id = g.assignment_id
       WHERE a.teacher_id = ?
       GROUP BY a.id
       ORDER BY a.due_date DESC, a.name`,
      [teacherId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// === PUT /api/teacher-admin/assignments/:id ===
router.put('/assignments/:id', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const assignmentId = req.params.id;
  const { name, due_date, max_points } = req.body;

  try {
    const [check] = await pool.execute(
      'SELECT id FROM assignments WHERE id = ? AND teacher_id = ?',
      [assignmentId, teacherId]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: 'Assignment not found or access denied' });
    }

    await pool.execute(
      `UPDATE assignments 
       SET name = ?, due_date = ?, max_points = ?
       WHERE id = ? AND teacher_id = ?`,
      [name, due_date || null, max_points || null, assignmentId, teacherId]
    );

    res.json({ success: true, message: 'Assignment updated successfully' });
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// === DELETE /api/teacher-admin/assignments/:id ===
router.delete('/assignments/:id', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const assignmentId = req.params.id;

  try {
    const [check] = await pool.execute(
      'SELECT id FROM assignments WHERE id = ? AND teacher_id = ?',
      [assignmentId, teacherId]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: 'Assignment not found or access denied' });
    }

    const [gradeCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM grades WHERE assignment_id = ?',
      [assignmentId]
    );

    await pool.execute(
      'DELETE FROM assignments WHERE id = ? AND teacher_id = ?',
      [assignmentId, teacherId]
    );

    res.json({ 
      success: true, 
      message: 'Assignment deleted successfully',
      grades_deleted: gradeCount[0].count
    });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// ============================================
// GRADE MANAGEMENT
// ============================================

// === GET /api/teacher-admin/grades/:assignmentId ===
router.get('/grades/:assignmentId', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const assignmentId = req.params.assignmentId;

  try {
    const [check] = await pool.execute(
      'SELECT id FROM assignments WHERE id = ? AND teacher_id = ?',
      [assignmentId, teacherId]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: 'Assignment not found or access denied' });
    }

    const [rows] = await pool.execute(
      `SELECT g.id as grade_id, g.grade, g.student_id,
              s.first_name, s.last_name, s.email,
              a.max_points
       FROM grades g
       JOIN students s ON g.student_id = s.id
       JOIN assignments a ON g.assignment_id = a.id
       WHERE g.assignment_id = ? AND g.teacher_id = ?
       ORDER BY s.last_name, s.first_name`,
      [assignmentId, teacherId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching grades:', err);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

// === PUT /api/teacher-admin/grades/:gradeId ===
router.put('/grades/:gradeId', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const gradeId = req.params.gradeId;
  const { grade } = req.body;

  try {
    const [check] = await pool.execute(
      'SELECT id FROM grades WHERE id = ? AND teacher_id = ?',
      [gradeId, teacherId]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: 'Grade not found or access denied' });
    }

    await pool.execute(
      'UPDATE grades SET grade = ? WHERE id = ? AND teacher_id = ?',
      [grade, gradeId, teacherId]
    );

    res.json({ success: true, message: 'Grade updated successfully' });
  } catch (err) {
    console.error('Error updating grade:', err);
    res.status(500).json({ error: 'Failed to update grade' });
  }
});

// === POST /api/teacher-admin/grades ===
router.post('/grades', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const { student_id, assignment_id, grade } = req.body;

  try {
    // Verify assignment belongs to this teacher
    const [assignmentCheck] = await pool.execute(
      'SELECT id FROM assignments WHERE id = ? AND teacher_id = ?',
      [assignment_id, teacherId]
    );

    if (assignmentCheck.length === 0) {
      return res.status(403).json({ error: 'Assignment not found or access denied' });
    }

    // Verify student belongs to this teacher
    const [studentCheck] = await pool.execute(
      'SELECT 1 FROM student_teacher WHERE teacher_id = ? AND student_id = ?',
      [teacherId, student_id]
    );

    if (studentCheck.length === 0) {
      return res.status(403).json({ error: 'Student not found or access denied' });
    }

    // Check if grade already exists
    const [existingGrade] = await pool.execute(
      'SELECT id FROM grades WHERE student_id = ? AND assignment_id = ? AND teacher_id = ?',
      [student_id, assignment_id, teacherId]
    );

    if (existingGrade.length > 0) {
      return res.status(400).json({ error: 'Grade already exists for this student and assignment' });
    }

    const [result] = await pool.execute(
      'INSERT INTO grades (student_id, assignment_id, teacher_id, grade) VALUES (?, ?, ?, ?)',
      [student_id, assignment_id, teacherId, grade]
    );

    res.json({ 
      success: true, 
      message: 'Grade added successfully',
      grade_id: result.insertId
    });
  } catch (err) {
    console.error('Error adding grade:', err);
    res.status(500).json({ error: 'Failed to add grade' });
  }
});

// === DELETE /api/teacher-admin/grades/:gradeId ===
router.delete('/grades/:gradeId', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const gradeId = req.params.gradeId;

  try {
    const [check] = await pool.execute(
      'SELECT id FROM grades WHERE id = ? AND teacher_id = ?',
      [gradeId, teacherId]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: 'Grade not found or access denied' });
    }

    await pool.execute(
      'DELETE FROM grades WHERE id = ? AND teacher_id = ?',
      [gradeId, teacherId]
    );

    res.json({ success: true, message: 'Grade deleted successfully' });
  } catch (err) {
    console.error('Error deleting grade:', err);
    res.status(500).json({ error: 'Failed to delete grade' });
  }
});

// ============================================
// PASSWORD RESET
// ============================================

// === POST /api/teacher-admin/reset-my-password ===
router.post('/reset-my-password', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const { current_password, new_password } = req.body;

  try {
    const [teacher] = await pool.execute(
      'SELECT password_hash FROM teachers WHERE id = ?',
      [teacherId]
    );

    if (teacher.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const isValid = await bcrypt.compare(current_password, teacher[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(new_password, 10);

    await pool.execute(
      'UPDATE teachers SET password_hash = ? WHERE id = ?',
      [newHash, teacherId]
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error resetting teacher password:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// === POST /api/teacher-admin/reset-student-password ===
router.post('/reset-student-password', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const { student_email } = req.body;

  try {
    // Verify student belongs to this teacher via student_teacher
    const [studentCheck] = await pool.execute(
      `SELECT s.id, s.email 
       FROM students s
       JOIN student_teacher st ON s.id = st.student_id
       WHERE s.email = ? AND st.teacher_id = ?`,
      [student_email, teacherId]
    );

    if (studentCheck.length === 0) {
      return res.status(404).json({ error: 'Student not found or not in your class' });
    }

    const studentId = studentCheck[0].id;

    const tempPassword = student_email.split('@')[0].slice(-8);
    const tempHash = await bcrypt.hash(tempPassword, 10);

    await pool.execute(
      'UPDATE students SET password_hash = ?, must_change_password = 1 WHERE id = ?',
      [tempHash, studentId]
    );

    res.json({ 
      success: true, 
      message: 'Student password reset successfully',
      temp_password: tempPassword
    });
  } catch (err) {
    console.error('Error resetting student password:', err);
    res.status(500).json({ error: 'Failed to reset student password' });
  }
});

module.exports = router;
