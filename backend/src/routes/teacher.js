const express = require('express');
const { pool } = require('../db');
const router = express.Router();

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

    // Get student's notes
    const [noteRows] = await pool.query(
      `SELECT id, note, created_at
       FROM teacher_notes
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [studentId]
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
    const [rows] = await pool.execute(
      `SELECT note, updated_at
       FROM teacher_notes
       WHERE student_id = ?`,
      [studentId]
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
    if (note && note.length > 2000) {
      return res.status(400).json({ error: 'Note too long (max 2000 characters)' });
    }

    const [result] = await pool.execute(
      `INSERT INTO teacher_notes (student_id, note, created_at)
       VALUES (?, ?, NOW())`,
      [studentId, note || '']
    );

    // Return the created note data
    res.json({ 
      id: result.insertId,
      note: note || '',
      created_at: new Date().toISOString(),
      success: true 
    });
  } catch (err) {
    console.error('Error saving teacher note:', err);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// === DELETE /api/teacher/notes/:studentId ===
router.delete('/notes/:studentId', async (req, res) => {
  const studentId = req.params.studentId;

  try {
    await pool.execute(
      `DELETE FROM teacher_notes
       WHERE student_id = ?`,
      [studentId]
    );

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting teacher note:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;