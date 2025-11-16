// backend/src/routes/rick.js
const express = require('express');
const router = express.Router();
const { rickAuth } = require('../../middleware/rickAuth');
const rickController = require('../controllers/rickController');

// Health check
router.get('/health', rickController.healthCheck);

// Chat endpoint
router.post('/chat', rickAuth, rickController.chat);

module.exports = router;
