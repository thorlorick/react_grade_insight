require('dotenv').config();

console.log('=== SERVER STATUS ==='); 
console.log('Current directory:', process.cwd()); 
console.log('NODE_ENV:', process.env.NODE_ENV); 
console.log('SESSION_SECRET exists:', 
!!process.env.SESSION_SECRET); 
console.log('========================');

const express = require('express');
const https = require('https');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { pool } = require('./db'); // your MySQL connection
const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teacher');
const uploadRoutes = require('./routes/uploads');

const app = express();

// SSL Certificate
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certs/privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/fullchain.pem'))
};

// Session store
const sessionStore = new MySQLStore({
  connectionLimit: 1,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: { session_id: 'session_id', expires: 'expires', data: 'data' }
  }
}, pool);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  key: 'grade_insight_session',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: { maxAge: 4*60*60*1000, httpOnly: true, secure: true }
}));

// Serve frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Auth routes
app.use('/api/auth', authRoutes);

// Teacher routes
app.use('/api/teacher', teacherRoutes);

// Upload routes
app.use('/api/uploads', uploadRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Start servers
const HTTP_PORT = process.env.PORT || 8082;
const HTTPS_PORT = process.env.HTTPS_PORT || 8083;

app.listen(HTTP_PORT, '0.0.0.0', () => console.log(`HTTP API listening on :${HTTP_PORT}`));
https.createServer(sslOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => console.log(`HTTPS API listening on :${HTTPS_PORT}`));
