// backend/src/routes/student.js
const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// Auth middleware
const checkStudentAuth = (req, res, next) => {
  if (!req.session.student_id) {
    return res.status(401).json({ error: 'Student authentication required' });
  }
  next();
};

// === GET /api/student/data ===
router.get('/data', checkStudentAuth, async (req, res) => {
  const studentId = req.session.student_id;

  try {
    const [rows] = await pool.execute(
      `SELECT 
        a.id AS assignment_id,
        a.name AS assignment_name,
        a.due_date,
        a.max_points,
        g.grade,
        CASE 
          WHEN g.grade IS NOT NULL AND a.max_points > 0 
          THEN ROUND((g.grade / a.max_points) * 100, 1) 
          ELSE NULL 
        END AS percentage
      FROM assignments a
      LEFT JOIN grades g 
        ON a.id = g.assignment_id AND g.student_id = ?
      ORDER BY a.due_date DESC, a.name`,
      [studentId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching student data:', err);
    res.status(500).json({ error: 'Failed to fetch student data' });
  }
});

// === GET /api/student/profile ===
router.get('/profile', checkStudentAuth, async (req, res) => {
  const studentId = req.session.student_id;

  try {
    const [rows] = await pool.execute(
      `SELECT id, first_name, last_name, email, grade_level, student_number
       FROM students
       WHERE id = ?`,
      [studentId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching student profile:', err);
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
});

// === GET /api/student/summary ===
router.get('/summary', checkStudentAuth, async (req, res) => {
  const studentId = req.session.student_id;

  try {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) AS total_assignments,
        COUNT(g.grade) AS graded_assignments,
        COUNT(CASE WHEN g.submitted = 1 THEN 1 END) AS submitted_assignments,
        ROUND(
          AVG(
            CASE 
              WHEN g.grade IS NOT NULL AND a.max_points > 0 
              THEN (g.grade / a.max_points) * 100 
            END
          ), 1
        ) AS overall_average
      FROM assignments a
      LEFT JOIN grades g 
        ON a.id = g.assignment_id AND g.student_id = ?`,
      [studentId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching student summary:', err);
    res.status(500).json({ error: 'Failed to fetch student summary' });
  }
});

// === GET /api/student/notes ===
// Returns all teacher notes for the logged-in student
router.get('/notes', checkStudentAuth, async (req, res) => {
  const studentId = req.session.student_id;

  try {
    const [rows] = await pool.execute(
      `SELECT tn.id, tn.note, tn.created_at, t.first_name AS teacher_first_name, t.last_name AS teacher_last_name
       FROM teacher_notes tn
       JOIN teachers t ON tn.teacher_id = t.id
       WHERE tn.student_id = ?
       ORDER BY tn.created_at DESC`,
      [studentId]
    );

    const notes = rows.map(row => ({
      id: row.id,
      note: row.note,
      created_at: row.created_at,
      teacher: `${row.teacher_first_name} ${row.teacher_last_name}`
    }));

    res.json({ notes });
  } catch (err) {
    console.error('Error fetching student notes:', err);
    res.status(500).json({ error: 'Failed to fetch student notes' });
  }
});

module.exports = router;
