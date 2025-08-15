// backend/src/routes/uploads.js
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { importTemplate } = require('../importer');

const router = express.Router();

// Ensure local uploads dir exists (gitignore this directory)
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

// POST /api/uploads/template?teacherId=1&notes=Optional
router.post('/template', upload.single('file'), async (req, res) => {
  try {
    const teacherId = Number(req.query.teacherId);
    if (!Number.isFinite(teacherId)) {
      return res.status(400).json({ error: 'Missing or invalid teacherId' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Missing file field "file"' });
    }

    const summary = await importTemplate(req.file.path, teacherId, req.query.notes || '');
    res.json({ ok: true, file: req.file.filename, summary });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
