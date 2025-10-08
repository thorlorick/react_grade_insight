// routes/contact.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db'); // your MySQL connection

router.post('/api/contact-lead', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    await pool.query('INSERT INTO contact_emails (email) VALUES (?)', [email]);
    res.status(200).json({ message: 'Email saved successfully' });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Failed to save email' });
  }
});

module.exports = router;
