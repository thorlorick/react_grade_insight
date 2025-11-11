// backend/src/routes/rick.js

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { rickAuth } = require('../../middleware/rickAuth');  
const rickController = require('../controllers/rickController');
const config = require('../config/rickConfig');

// Rate limiting
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.security.rateLimit,
  message: {
    success: false,
    error: 'Too many requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication to all Rick routes
router.use(rickAuth);

// Routes
router.post('/chat', chatLimiter, rickController.chat);
router.get('/quick-queries', rickController.quickQuery);
router.get('/health', rickController.healthCheck);

// Error handling
router.use((error, req, res, next) => {
  console.error('Rick route error:', error);
  
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = router;
