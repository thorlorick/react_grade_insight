// backend/src/controllers/rickController.js
const ollamaService = require('../services/rick/ollamaService');
const contextBuilder = require('../utils/rick/contextBuilder');

const rickController = {
  // Health check
  async healthCheck(req, res) {
    try {
      const ollamaStatus = await ollamaService.checkHealth();
      res.json({
        success: true,
        status: 'healthy',
        ollama: ollamaStatus
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        details: error.message
      });
    }
  },

  // Handle chat messages in real-time
  async chat(req, res) {
    try {
      const { message } = req.body;
      const teacherId = req.teacherId;
      const teacherName = req.teacherName;

      // No memories used
      const context = contextBuilder.buildContext({
        teacherId,
        teacherName,
        userMessage: message,
        memories: [] // empty
      });

      // Build prompt
      const prompt = `You are Rick, an AI teaching assistant. Help the teacher with their question.

Teacher: ${teacherName}

Question: ${message}

Provide a helpful, concise answer:`;

      // Generate response
      const result = await ollamaService.generateResponse(prompt);

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate response');
      }

      res.json({
        success: true,
        response: result.response,
        type: 'chat'
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process message',
        details: error.message
      });
    }
  },

  // Quick query endpoint can remain if needed
  async quickQuery(req, res) {
    try {
      const { queryType } = req.body;
      const teacherId = req.session.teacher_id;

      const result = await require('../services/rick/queryService')
        .executeQuickQuery(teacherId, queryType);

      res.json({
        success: true,
        result,
        type: 'query'
      });
    } catch (error) {
      console.error('Quick query error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute query',
        details: error.message
      });
    }
  }
};

module.exports = rickController;
