const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { parseTemplate } = require('../csvParser');
const { pool } = require('../db'); // MySQL connection

const router = express.Router();

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

router.post('/template', upload.single('csv'), async (req, res) => {
  try {
    const teacherId = req.session.teacher?.id;
    if (!teacherId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'Missing CSV file' });

    // Parse CSV into structured assignments/students
    const { assignments, students } = await parseTemplate(req.file.path);

    // TODO: Insert into database (uploads, assignments, students, grades)
    // For now, just return parsed structure
    res.json({ ok: true, assignments, students });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  } finally {
    // Clean up file
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }
});

module.exports = router;
