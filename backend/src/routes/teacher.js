// backend/src/routes/teacher.js
const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// --- Middleware to check teacher session ---
const checkTeacherAuth = (req, res, next) => {
  if (!req.session.teacher_id) {
    return res.status(401).json({ error: 'Teacher authentication required' });
  }
  next();
};

// === GET /api/teacher/data ===
router.get('/data', checkTeacherAuth, async (req, res) => {
  const teacherId = req.session.teacher_id;

  try {
    const [rows] = await pool.execute(
      `SELECT 
        s.id AS student_id,
        s.first_name,
        s.last_name,
        s.email,
        a.id AS assignment_id,
        a.name AS assignment_name,
        a.due_date AS assignment_date,
        a.max_points,
        g.grade AS score
      FROM students s
      JOIN grades g ON s.id = g.student_id
      JOIN assignments a ON g.assignment_id = a.id
      WHERE g.teacher_id = ?
      ORDER BY s.last_name, a.due_date`,
      [teacherId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching teacher data:', err);
    res.status(500).json({ error: 'Failed to fetch teacher data' });
  }
});

// === GET /api/teacher/notes/:studentId ===
router.get('/notes/:studentId', checkTeacherAuth, async (req, res) => {
  const teacherId = req.session.teacher_id;
  const studentId = req.params.studentId;

  try {
    const [rows] = await pool.execute(
      `SELECT note, updated_at 
       FROM teacher_notes 
       WHERE teacher_id = ? AND student_id = ?`,
      [teacherId, studentId]
    );

    if (rows.length === 0) {
      return res.json({ note: '', lastUpdated: null });
    }

    res.json({ note: rows[0].note || '', lastUpdated: rows[0].updated_at });
  } catch (err) {
    console.error('Error fetching teacher note:', err);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// === POST /api/teacher/notes/:studentId ===
router.post('/notes/:studentId', checkTeacherAuth, async (req, res) => {
  const teacherId = req.session.teacher_id;
  const studentId = req.params.studentId;
  const { note } = req.body;

  try {
    if (note && note.length > 2000) {
      return res.status(400).json({ error: 'Note too long (max 2000 characters)' });
    }

    await pool.execute(
      `INSERT INTO teacher_notes (teacher_id, student_id, note) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         note = VALUES(note),
         updated_at = CURRENT_TIMESTAMP`,
      [teacherId, studentId, note || '']
    );

    res.json({ success: true, message: 'Note saved successfully' });
  } catch (err) {
    console.error('Error saving teacher note:', err);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// === DELETE /api/teacher/notes/:studentId ===
router.delete('/notes/:studentId', checkTeacherAuth, async (req, res) => {
  const teacherId = req.session.teacher_id;
  const studentId = req.params.studentId;

  try {
    await pool.execute(
      `DELETE FROM teacher_notes 
       WHERE teacher_id = ? AND student_id = ?`,
      [teacherId, studentId]
    );

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting teacher note:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// === GET /api/teacher/student/:id/details ===
router.get('/student/:id/details', checkTeacherAuth, async (req, res) => {
  const studentId = req.params.id;

  try {
    // Fetch student info
    const [studentRows] = await pool.query(
      `SELECT id, first_name, last_name, email 
       FROM students 
       WHERE id = ?`,
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const student = studentRows[0];

    // Fetch assignments for this student
    const [assignmentRows] = await pool.query(
      `SELECT a.id AS assignment_id, a.name AS assignment_name, a.max_points, g.grade
       FROM assignments a
       LEFT JOIN grades g ON a.id = g.assignment_id AND g.student_id = ?`,
      [studentId]
    );

    // Fetch teacher notes for this student
    const [noteRows] = await pool.query(
      `SELECT id, teacher_id, note, created_at 
       FROM notes 
       WHERE student_id = ? 
       ORDER BY created_at ASC`,
      [studentId]
    );

    res.json({
      student,
      assignments: assignmentRows,
      notes: noteRows
    });
  } catch (err) {
    console.error('Error fetching student details for teacher:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
