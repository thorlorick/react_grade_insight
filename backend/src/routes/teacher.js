// backend/src/routes/teacher.js
const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// === GET /api/teacher/data ===
router.get('/data', async (req, res) => {
  const teacherId = req.session.teacher_id;
  if (!teacherId) return res.status(401).json({ error: 'Unauthorized' });

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


// Add these routes to your existing teacher.js file

// === GET /api/teacher/notes/:studentId ===
router.get('/notes/:studentId', async (req, res) => {
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

    res.json({
      note: rows[0].note || '',
      lastUpdated: rows[0].updated_at
    });

  } catch (err) {
    console.error('Error fetching teacher note:', err);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// === POST /api/teacher/notes/:studentId ===
router.post('/notes/:studentId', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const studentId = req.params.studentId;
  const { note } = req.body;

  try {
    // Validate input
    if (note && note.length > 2000) {
      return res.status(400).json({ error: 'Note too long (max 2000 characters)' });
    }

    // Insert or update note using ON DUPLICATE KEY UPDATE
    await pool.execute(
      `INSERT INTO teacher_notes (teacher_id, student_id, note) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       note = VALUES(note), 
       updated_at = CURRENT_TIMESTAMP`,
      [teacherId, studentId, note || '']
    );

    res.json({ 
      success: true, 
      message: 'Note saved successfully' 
    });

  } catch (err) {
    console.error('Error saving teacher note:', err);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// === DELETE /api/teacher/notes/:studentId ===
router.delete('/notes/:studentId', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const studentId = req.params.studentId;

  try {
    await pool.execute(
      `DELETE FROM teacher_notes 
       WHERE teacher_id = ? AND student_id = ?`,
      [teacherId, studentId]
    );

    res.json({ 
      success: true, 
      message: 'Note deleted successfully' 
    });

  } catch (err) {
    console.error('Error deleting teacher note:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
