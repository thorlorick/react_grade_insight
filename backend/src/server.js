const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); // allow requests from any origin for testing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

// Example API route
app.post('/api/uploads/template', (req, res) => {
  // your upload logic here
  res.json({ ok: true, file: 'test.csv', summary: {} });
});

// Start server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
