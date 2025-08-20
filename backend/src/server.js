// backend/src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db'); // your MySQL connection

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// Teacher Login Route
// --------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Missing email or password' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM teachers WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const teacher = rows[0];
    const match = await bcrypt.compare(password, teacher.password_hash);

    if (!match) {
      return res.status(401).json({ ok: false, error: 'Incorrect password' });
    }

    // Success — return teacher ID (or JWT in production)
    return res.json({ ok: true, teacherId: teacher.id, name: teacher.name });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// --------------------
// Teacher Signup Route
// --------------------
app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  try {
    // Check if user exists
    const [existing] = await db.query('SELECT * FROM teachers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ ok: false, error: 'Email already registered' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert teacher
    const [result] = await db.query(
      'INSERT INTO teachers (name, email, password_hash, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, hash]
    );

    return res.json({ ok: true, teacherId: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// --------------------
// Serve React build
// --------------------
app.use(express.static(path.join(__dirname, '../../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

// --------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
