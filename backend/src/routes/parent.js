// backend/src/routes/parent.js
const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// Simple auth check function
const checkParentAuth = (req, res, next) => {
  if (!req.session.parent_id) {
    return res.status(401).json({ error: 'Parent authentication required' });
  }
  next();
};

// === GET /api/parent/children ===
router.get('/children', checkParentAuth, async (req, res) => {
  const parentId = req.session.parent_id;

  try {
    const [rows] = await pool.execute(
      `SELECT 
        s.id,
        s.first_name,
        s.last_name
      FROM parent_student ps
      JOIN students s ON ps.student_id = s.id  
      WHERE ps.parent_id = ?
      ORDER BY s.last_name, s.first_name`,
      [parentId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching parent children:', err);
    res.status(500).json({ error: 'Failed to fetch children data' });
  }
});

// === GET /api/parent/grades/:studentId ===
router.get('/grades/:studentId', checkParentAuth, async (req, res) => {
  const parentId = req.session.parent_id;
  const studentId = req.params.studentId;

  try {
    // First verify this student belongs to this parent
    const [verification] = await pool.execute(
      `SELECT 1 FROM parent_student 
       WHERE parent_id = ? AND student_id = ?`,
      [parentId, studentId]
    );

    if (verification.length === 0) {
      return res.status(403).json({ error: 'Access denied to this student data' });
    }

    // Get grades with assignment details
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
      LEFT JOIN grades g ON a.id = g.assignment_id AND g.student_id = ?
      ORDER BY a.due_date DESC, a.name`,
      [studentId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching student grades:', err);
    res.status(500).json({ error: 'Failed to fetch grades data' });
  }
});

// === GET /api/parent/notes/:studentId ===
router.get('/notes/:studentId', checkParentAuth, async (req, res) => {
  const parentId = req.session.parent_id;
  const studentId = req.params.studentId;

  try {
    // Verify student belongs to parent
    const [verification] = await pool.execute(
      `SELECT 1 FROM parent_student 
       WHERE parent_id = ? AND student_id = ?`,
      [parentId, studentId]
    );

    if (verification.length === 0) {
      return res.status(403).json({ error: 'Access denied to this student data' });
    }

    // Get teacher notes for this student
    const [rows] = await pool.execute(
      `SELECT 
        tn.note, 
        tn.updated_at,
        t.first_name AS teacher_first_name,
        t.last_name AS teacher_last_name,
        t.school_name
       FROM teacher_notes tn
       JOIN teachers t ON tn.teacher_id = t.id
       WHERE tn.student_id = ?
       ORDER BY tn.updated_at DESC`,
      [studentId]
    );

    if (rows.length === 0) {
      return res.json({ 
        notes: '',
        lastUpdated: null,
        teacherName: null,
        schoolName: null
      });
    }

    // Return the most recent note (since we ordered by updated_at DESC)
    const latestNote = rows[0];
    res.json({
      notes: latestNote.note || '',
      lastUpdated: latestNote.updated_at,
      teacherName: `${latestNote.teacher_first_name} ${latestNote.teacher_last_name}`,
      schoolName: latestNote.school_name
    });

  } catch (err) {
    console.error('Error fetching teacher notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

module.exports = router;