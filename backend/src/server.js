// backend/src/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // handles file uploads
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise'); // MySQL with async/await

const app = express();

// Enable CORS for all origins (safe for local testing)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

// ----------------------
// MySQL connection setup
// ----------------------
const dbConfig = {
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'grade_insight',
};

let db;
mysql.createConnection(dbConfig)
  .then((connection) => {
    db = connection;
    console.log('Connected to MySQL');
  })
  .catch((err) => console.error('MySQL connection error:', err));

// ----------------------
// Multer setup for uploads
// ----------------------
const upload = multer({
  dest: path.join(__dirname, '../../uploads/') // make sure this folder exists
});

// CSV upload route
app.post('/api/uploads/template', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: 'No file uploaded' });
  }

  const filename = req.file.originalname;
  const summary = {
    uploadedAt: new Date(),
    teacherId: req.query.teacherId || null,
    notes: req.query.notes || null
  };

  console.log('File uploaded:', filename, summary);

  return res.json({ ok: true, file: filename, summary });
});

// ----------------------
// Health check route
// ----------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ----------------------
// Teacher login route
// ----------------------
app.post('/api/login', async (req, res) => {
  if (!db) return res.status(500).json({ ok: false, error: 'Database not connected' });

  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM teachers WHERE email = ?", [email]);

    if (!rows.length) return res.json({ ok: false, error: 'User not found' });

    const teacher = rows[0];
    const valid = bcrypt.compareSync(password, teacher.password_hash);

    if (!valid) return res.json({ ok: false, error: 'Invalid password' });

    // Return teacher info (without password)
    return res.json({
      ok: true,
      teacher: {
        id: teacher.id,
        first_name: teacher.first_name,
        last_name: teacher.last_name,
        email: teacher.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 8081;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on :${PORT}`);
});
