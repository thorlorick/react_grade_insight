const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Middleware to check authentication
router.use((req, res, next) => {
  if (!req.session || !req.session.teacher_id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
});

// === GET /api/teacher-admin/assignments ===
// Get all assignments for this teacher
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
// Edit an assignment
router.put('/assignments/:id', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const assignmentId = req.params.id;
  const { name, due_date, max_points } = req.body;

  try {
    // Verify this assignment belongs to this teacher
    const [check] = await pool.execute(
      'SELECT id FROM assignments WHERE id = ? AND teacher_id = ?',
      [assignmentId, teacherId]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: 'Assignment not found or access denied' });
    }

    // Update the assignment
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
// Delete an assignment (and cascade delete grades)
router.delete('/assignments/:id', async (req, res) => {
  const teacherId = req.session.teacher_id;
  const assignmentId = req.params.id;

  try {
    // Verify this assignment belongs to this teacher
    const [check] = await pool.execute(
      'SELECT id FROM assignments WHERE id = ? AND teacher_id = ?',
      [assignmentId, teacherId]
    );

    if (check.length === 0) {
      return res.status(403).json({ error: 'Assignment not found or access denied' });
    }

    // Get count of grades that will be deleted
    const [gradeCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM grades WHERE assignment_id = ?',
      [assignmentId]
    );

    // Delete the assignment (grades will cascade delete due to foreign key)
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

module.exports = router;
