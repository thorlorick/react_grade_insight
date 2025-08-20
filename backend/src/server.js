// backend/src/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // handles file uploads
const path = require('path');
const fs = require('fs');

const app = express();

// Enable CORS for all origins (safe for local testing)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

// Set up multer for file uploads
const upload = multer({
  dest: path.join(__dirname, '../../uploads/') // make sure this folder exists
});

// API route for CSV upload
app.post('/api/uploads/template', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: 'No file uploaded' });
  }

  // Here you can process the CSV as needed
  const filename = req.file.originalname;
  const summary = {
    uploadedAt: new Date(),
    teacherId: req.query.teacherId || null,
    notes: req.query.notes || null
  };

  console.log('File uploaded:', filename, summary);

  return res.json({ ok: true, file: filename, summary });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});


// Start server on all network interfaces
const PORT = process.env.PORT || 8081;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on :${PORT}`);
});

