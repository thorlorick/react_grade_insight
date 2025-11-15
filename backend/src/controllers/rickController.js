// backend/src/controllers/rickController.js
const ollamaService = require('../services/rick/ollamaService');
const contextBuilder = require('../utils/rick/contextBuilder');
const queryService = require('../services/rick/queryService');

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

 // Handle chat messages
 async chat(req, res) {
    try {
      const { message } = req.body;
      const teacherId = req.teacherId;
      const teacherName = req.teacherName || 'Teacher';

      // Check if asking about students/data
      const isDataQuery = /\b(student|grade|assignment|average|who|show|list)\b/i.test(message);

      let databaseInfo = '';
      
      if (isDataQuery) {
        // Get some basic student info for context
        try {
          const students = await queryService.executeQuery(
            teacherId,
            `SELECT CONCAT(first_name, ' ', last_name) as name, email 
             FROM students 
             WHERE id IN (SELECT DISTINCT student_id FROM grades WHERE teacher_id = ?) 
             LIMIT 10`,
            [teacherId]
          );
          
          if (students.success && students.data.length > 0) {
            databaseInfo = `\n\nYour students include: ${students.data.map(s => s.name).join(', ')}`;
          }
        } catch (err) {
          console.error('Error fetching student context:', err);
        }
      }

      // Simple prompt
      const prompt = `You are Rick, an AI teaching assistant helping ${teacherName}.${databaseInfo}

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
