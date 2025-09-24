const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// === Student modal data for teacher ===
router.get('/:student_id/details', async (req, res) => {
  const { student_id } = req.params;

  try {
    // Student info
    const [studentRows] = await pool.execute(
      'SELECT id AS student_id, first_name, last_name, email FROM students WHERE id = ?',
      [student_id]
    );
    if (!studentRows.length) return res.status(404).json({ error: 'Student not found' });
    const student = studentRows[0];
    student.name = `${student.first_name} ${student.last_name}`;

    // Assignments + grades
    const [assignmentRows] = await pool.execute(
      `SELECT a.id AS assignment_id, a.name AS assignment_name, a.max_points, g.grade AS score
       FROM assignments a
       LEFT JOIN grades g ON g.assignment_id = a.id AND g.student_id = ?
       ORDER BY a.due_date ASC`,
      [student_id]
    );

    // Teacher notes
    const [noteRows] = await pool.execute(
      'SELECT id, teacher_id, note, created_at FROM teacher_notes WHERE student_id = ? ORDER BY created_at ASC',
      [student_id]
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

// === Add a new teacher note ===
router.post('/:student_id/notes', async (req, res) => {
  const { student_id } = req.params;
  const { teacher_id, note } = req.body;

  if (!teacher_id || !note) return res.status(400).json({ error: 'Missing teacher_id or note' });

  try {
    const [result] = await pool.execute(
      'INSERT INTO teacher_notes (student_id, teacher_id, note) VALUES (?, ?, ?)',
      [student_id, teacher_id, note]
    );

    // Return the inserted note
    const [insertedRow] = await pool.execute(
      'SELECT id, teacher_id, note, created_at FROM teacher_notes WHERE id = ?',
      [result.insertId]
    );

    res.json(insertedRow[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
