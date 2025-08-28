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

module.exports = router;
