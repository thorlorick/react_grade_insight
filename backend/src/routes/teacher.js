const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Debugging middleware to see session data
router.use((req, res, next) => {
  console.log('Session data:', req.session);
  console.log('Teacher ID in session:', req.session?.teacher_id);
  next();
});

// === GET /api/teacher/data ===
router.get('/data', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.id AS student_id, s.first_name, s.last_name, s.email,
              a.id AS assignment_id, a.name AS assignment_name, a.due_date AS assignment_date,
              a.max_points, g.grade AS score
       FROM students s
       JOIN grades g ON s.id = g.student_id
       JOIN assignments a ON g.assignment_id = a.id
       ORDER BY s.last_name, a.due_date`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching teacher data:', err);
    res.status(500).json({ error: 'Failed to fetch teacher data' });
  }
});

// === GET /api/teacher/student/:studentId/details ===
router.get('/student/:studentId/details', async (req, res) => {
  const studentId = req.params.studentId;
  console.log('Fetching student data for ID:', studentId);

  try {
    // Check if teacher is logged in
    if (!req.session || !req.session.teacher_id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const teacherId = req.session.teacher_id;

    // Get student info
    const [studentRows] = await pool.query(
      `SELECT id, first_name, last_name, email
       FROM students
       WHERE id = ?`,
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get student's assignments and grades
    const [assignmentRows] = await pool.query(
      `SELECT a.id AS assignment_id, a.name AS assignment_name, a.due_date,
              a.max_points, g.grade
       FROM assignments a
       LEFT JOIN grades g ON a.id = g.assignment_id AND g.student_id = ?
       ORDER BY a.due_date`,
      [studentId]
    );

    // Get student's notes for this teacher
    const [noteRows] = await pool.query(
      `SELECT id, note, created_at
       FROM teacher_notes
       WHERE student_id = ? AND teacher_id = ?
       ORDER BY created_at DESC`,
      [studentId, teacherId]
    );

    // Return the data in the format your frontend expects
    res.json({
      student: studentRows[0],
      assignments: assignmentRows || [],
      notes: noteRows || []
    });

  } catch (err) {
    console.error('Error fetching student data:', err);
    res.status(500).json({ error: 'Failed to fetch student data' });
  }
});

// === GET /api/teacher/notes/:studentId ===
router.get('/notes/:studentId', async (req, res) => {
  const studentId = req.params.studentId;

  try {
    // Check if teacher is logged in
    if (!req.session || !req.session.teacher_id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const teacherId = req.session.teacher_id;

    const [rows] = await pool.execute(
      `SELECT note, updated_at
       FROM teacher_notes
       WHERE student_id = ? AND teacher_id = ?`,
      [studentId, teacherId]
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
router.post('/notes/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
  const { note } = req.body;

  try {
    // Check if teacher is logged in
    if (!req.session || !req.session.teacher_id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const teacherId = req.session.teacher_id;
    console.log('Teacher ID:', teacherId, 'Student ID:', studentId, 'Note:', note);

    if (note && note.length > 2000) {
      return res.status(400).json({ error: 'Note too long (max 2000 characters)' });
    }

   const [result] = await pool.execute(
  `INSERT INTO teacher_notes (teacher_id, student_id, note) VALUES (?, ?, ?)`,
  [teacherId, studentId, note || '']
);

    // Get the inserted/updated note to return
    const [noteResult] = await pool.execute(
      `SELECT id, note, created_at 
       FROM teacher_notes 
       WHERE teacher_id = ? AND student_id = ?`,
      [teacherId, studentId]
    );

    if (noteResult.length > 0) {
      res.json({ 
        id: noteResult[0].id,
        note: noteResult[0].note,
        created_at: noteResult[0].created_at,
        success: true 
      });
    } else {
      // Fallback if query fails
      res.json({ 
        id: result.insertId || Date.now(),
        note: note || '',
        created_at: new Date().toISOString(),
        success: true 
      });
    }

  } catch (err) {
    console.error('Error saving teacher note:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ error: 'Failed to save note', details: err.message });
  }
});

// === DELETE /api/teacher/notes/:studentId ===
router.delete('/notes/:studentId', async (req, res) => {
  const studentId = req.params.studentId;

  try {
    // Check if teacher is logged in
    if (!req.session || !req.session.teacher_id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const teacherId = req.session.teacher_id;

    await pool.execute(
      `DELETE FROM teacher_notes
       WHERE student_id = ? AND teacher_id = ?`,
      [studentId, teacherId]
    );

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting teacher note:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;