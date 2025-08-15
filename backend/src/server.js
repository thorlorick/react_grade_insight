// backend/src/server.js
const express = require('express');
const uploadsRoute = require('./routes/uploads');

const app = express();
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend')));


// health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// uploads
app.use('/api/uploads', uploadsRoute);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
