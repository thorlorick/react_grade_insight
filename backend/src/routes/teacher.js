const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const pool = require('../db'); // your MySQL connection

// Multer setup
const upload = multer({ dest: 'tmp/' });

// === GET /api/teacher/data ===
router.get('/data', async (req, res) => {
  const teacherId = req.session?.teacher_id;
  if (!teacherId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        a.assignment_id,
        a.title AS assignment_name,
        a.date AS assignment_date,
        a.max_points,
        g.score
      FROM students s
      JOIN grades g ON s.student_id = g.student_id
      JOIN assignments a ON g.assignment_id = a.assignment_id
      WHERE s.teacher_id = ?
      ORDER BY s.last_name, a.date`,
      [teacherId]
    );

    res.json(rows); // flat array
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
          // 1. Insert/update student
          const [studentResult] = await pool.execute(
            `INSERT INTO students (student_number, first_name, last_name, email, teacher_id)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), email=VALUES(email)`,
            [row.student_number, row.first_name, row.last_name, row.email, teacherId]
          );

          const [[student]] = await pool.execute(
            `SELECT student_id FROM students WHERE student_number=? AND teacher_id=?`,
            [row.student_number, teacherId]
          );
          const studentId = student.student_id;

          // 2. Insert/update assignment
          const [assignmentResult] = await pool.execute(
            `INSERT INTO assignments (title, date, max_points, teacher_id)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE max_points=VALUES(max_points), date=VALUES(date)`,
            [row.assignment_title, row.date, row.max_points, teacherId]
          );

          const [[assignment]] = await pool.execute(
            `SELECT assignment_id FROM assignments WHERE title=? AND teacher_id=?`,
            [row.assignment_title, teacherId]
          );
          const assignmentId = assignment.assignment_id;

          // 3. Insert/update grade
          await pool.execute(
            `INSERT INTO grades (student_id, assignment_id, score)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE score=VALUES(score)`,
            [studentId, assignmentId, row.score]
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
