const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// Simple auth check middleware
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

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

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

// GET /api/student/:id/details
router.get('/:id/details', async (req, res) => {
  const studentId = req.params.id;

  try {
    // Example: query your database for student details
    const [studentRows] = await pool.query('SELECT * FROM students WHERE student_id = ?', [studentId]);
    if (studentRows.length === 0) return res.status(404).json({ error: 'Student not found' });

    const student = studentRows[0];

    // Example: get assignments for this student
    const [assignmentRows] = await pool.query(
      `SELECT a.assignment_id, a.assignment_name, a.max_points, g.score
       FROM assignments a
       LEFT JOIN grades g ON a.assignment_id = g.assignment_id AND g.student_id = ?`,
      [studentId]
    );

    // Example: get teacher notes for this student
    const [noteRows] = await pool.query(
      'SELECT id, teacher_id, note, created_at FROM notes WHERE student_id = ? ORDER BY created_at ASC',
      [studentId]
    );

    res.json({
      student,
      assignments: assignmentRows,
      notes: noteRows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;

