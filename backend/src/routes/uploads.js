// backend/src/routes/uploads.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { parseTemplate } = require('../csvParser');
const { pool } = require('../db'); // MySQL connection

const router = express.Router();

// Ensure local uploads dir exists
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({ storage });

// Add this GET route for template download (before your existing POST route)
router.get('/template', (req, res) => {
  const csvTemplate = `last_name,first_name,email,Math Quiz 1,Science Test,History Essay
Doe,John,john.doe@email.com,85,92,78
Smith,Jane,jsmith@email.com,88,95,82
Johnson,bob,bobjohnson@email.com,75,88,90`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="upload_template.csv"');
  res.send(csvTemplate);
});


router.post('/template', upload.single('csv'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const teacherId = req.session.teacher_id;
    if (!teacherId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'Missing CSV file' });

    // Parse CSV
    const { assignments, students } = await parseTemplate(req.file.path);

    // Start transaction
    await conn.beginTransaction();

    // 1. Record the upload
    const [uploadResult] = await conn.query(
      'INSERT INTO uploads (teacher_id, filename) VALUES (?, ?)',
      [teacherId, req.file.filename || '']
    );
    const uploadId = uploadResult.insertId;

    // 2. Upsert assignments
    const assignmentIdMap = {}; // name+date => assignment_id
    for (const a of assignments) {
      const [existing] = await conn.query(
        'SELECT id FROM assignments WHERE teacher_id=? AND name=? AND due_date=?',
        [teacherId, a.name, a.date]
      );
      if (existing.length > 0) {
        assignmentIdMap[a.name] = existing[0].id;
        await conn.query(
          'UPDATE assignments SET max_points=?, upload_id=? WHERE id=?',
          [a.max_points, uploadId, existing[0].id]
        );
      } else {
        const [inserted] = await conn.query(
          'INSERT INTO assignments (teacher_id, upload_id, name, due_date, max_points) VALUES (?, ?, ?, ?, ?)',
          [teacherId, uploadId, a.name, a.date, a.max_points]
        );
        assignmentIdMap[a.name] = inserted.insertId;
      }
    }

    // 3. Upsert students and grades
    for (const s of students) {
      // Check student by email
      let [studentRows] = await conn.query(
        'SELECT id FROM students WHERE email=?',
        [s.email]
      );
      let studentId;
      if (studentRows.length > 0) {
        studentId = studentRows[0].id;
        await conn.query(
          'UPDATE students SET first_name=?, last_name=? WHERE id=?',
          [s.first_name, s.last_name, studentId]
        );
      } else {
        const [inserted] = await conn.query(
          'INSERT INTO students (first_name, last_name, email) VALUES (?, ?, ?)',
          [s.first_name, s.last_name, s.email]
        );
        studentId = inserted.insertId;
      }

      // Insert or overwrite grades
      for (let i = 0; i < assignments.length; i++) {
        const assignmentId = assignmentIdMap[assignments[i].name];
        const gradeValue = s.grades[i];

        const [gradeRows] = await conn.query(
          'SELECT id FROM grades WHERE student_id=? AND assignment_id=? AND teacher_id=?',
          [studentId, assignmentId, teacherId]
        );

        if (gradeRows.length > 0) {
          await conn.query(
            'UPDATE grades SET grade=?, upload_id=? WHERE id=?',
            [gradeValue, uploadId, gradeRows[0].id]
          );
        } else {
          await conn.query(
            'INSERT INTO grades (student_id, assignment_id, teacher_id, upload_id, grade) VALUES (?, ?, ?, ?, ?)',
            [studentId, assignmentId, teacherId, uploadId, gradeValue]
          );
        }
      }
    }

    await conn.commit();

    res.json({
      ok: true,
      file: req.file.filename,
      assignmentsCount: assignments.length,
      studentsCount: students.length
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    conn.release();
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }
});

module.exports = router;
