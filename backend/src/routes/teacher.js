const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { pool } = require('../db'); // your MySQL connection

// Multer setup
const upload = multer({ dest: 'tmp/' });

// === GET /api/teacher/data ===
router.get('/data', async (req, res) => {
  const teacherId = req.session?.teacher_id;
  if (!teacherId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const [rows] = await pool.execute(
      `SELECT 
        s.id as student_id,
        s.first_name,
        s.last_name,
        s.email,
        a.id as assignment_id,
        a.name AS assignment_name,
        a.due_date AS assignment_date,
        a.max_points,
        g.grade as score
      FROM students s
      JOIN grades g ON s.id = g.student_id
      JOIN assignments a ON g.assignment_id = a.id
      WHERE g.teacher_id = ?
      ORDER BY s.last_name, a.due_date`,
      [teacherId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch teacher data' });
  }
});

// === POST /api/teacher/upload-csv ===
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  const teacherId = req.session?.teacher_id;
  if (!teacherId) return res.status(401).json({ error: 'Unauthorized' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      try {
        for (const row of results) {
          // 1. Insert/update student by email
          const [studentResult] = await pool.execute(
            `INSERT INTO students (first_name, last_name, email)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name)`,
            [row.first_name, row.last_name, row.email]
          );

          const [[student]] = await pool.execute(
            `SELECT id FROM students WHERE email=?`,
            [row.email]
          );
          const studentId = student.id;

          // 2. Insert/update assignment
          const [assignmentResult] = await pool.execute(
            `INSERT INTO assignments (name, due_date, max_points, teacher_id)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE max_points=VALUES(max_points), due_date=VALUES(due_date)`,
            [row.assignment_name, row.assignment_date, row.max_points, teacherId]
          );

          const [[assignment]] = await pool.execute(
            `SELECT id FROM assignments WHERE name=? AND teacher_id=?`,
            [row.assignment_name, teacherId]
          );
          const assignmentId = assignment.id;

          // 3. Insert/update grade
          await pool.execute(
            `INSERT INTO grades (student_id, assignment_id, teacher_id, grade)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE grade=VALUES(grade)`,
            [studentId, assignmentId, teacherId, row.grade]
          );
        }

        fs.unlinkSync(req.file.path); // cleanup temp file
        res.json({ message: 'CSV uploaded and processed successfully' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error processing CSV' });
      }
    });
});

module.exports = router;
