// backend/src/server.js

require('dotenv').config();
console.log('SESSION_SECRET loaded:', !!process.env.SESSION_SECRET);
console.log('SESSION_SECRET value:', process.env.SESSION_SECRET ? 'EXISTS' : 'MISSING');

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { pool } = require('./db'); // Import your db connection


// Import your existing auth routes
const authRoutes = require('./routes/auth');

const app = express();

// Create session store using your MySQL connection
const sessionStore = new MySQLStore({
  // Use existing connection pool
  connectionLimit: 1,
  createDatabaseTable: true, // Auto-creates sessions table
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool);

// Enable CORS for all origins (safe for local testing)
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true // Important for sessions
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware - MUST come after CORS and before routes
app.use(session({
  key: 'grade_insight_session',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on activity
  cookie: {
    maxAge: 4 * 60 * 60 * 1000, // 4 hours
    httpOnly: true, // Security: no client-side access
    secure: false // Set to true in production with HTTPS
  }
}));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

// Add your auth routes
app.use('/api/auth', authRoutes);

// Set up multer for file uploads
const upload = multer({
  dest: path.join(__dirname, '../../uploads/')
});

// Updated CSV upload route - now uses session
app.post('/api/uploads/template', upload.single('file'), (req, res) => {
  // Check if user is logged in
  if (!req.session.teacher_id) {
    return res.status(401).json({ 
      ok: false, 
      error: 'Must be logged in to upload files' 
    });
  }

  if (!req.file) {
    return res.status(400).json({ ok: false, error: 'No file uploaded' });
  }

  const filename = req.file.originalname;
  const summary = {
    uploadedAt: new Date(),
    teacherId: req.session.teacher_id, // Now from session - secure!
    teacherName: req.session.teacher_name,
    notes: req.query.notes || null
  };

  console.log('File uploaded:', filename, summary);
  return res.json({ ok: true, file: filename, summary });
});

// Add logout route
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('grade_insight_session');
    res.json({ message: 'Logged out successfully' });
  });
});

// Add session check route for frontend
app.get('/api/auth/me', (req, res) => {
  if (req.session.teacher_id) {
    res.json({
      isLoggedIn: true,
      teacher_id: req.session.teacher_id,
      teacher_name: req.session.teacher_name,
      teacher_email: req.session.teacher_email
    });
  } else {
    res.json({ isLoggedIn: false });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
const PORT = process.env.PORT || 8081;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on :${PORT}`);
});