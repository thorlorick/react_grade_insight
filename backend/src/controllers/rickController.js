// backend/src/controllers/rickController.js
const ollamaService = require('../services/rick/ollamaService');
const memoryService = require('../services/rick/memoryService');
const queryService = require('../services/rick/queryService');
const contextBuilder = require('../utils/rick/contextBuilder');
const commandParser = require('../utils/rick/commandParser');

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
      const teacherId = req.session.teacher_id;

      // Check for commands
      const command = commandParser.parseCommand(message);
      
      if (command) {
        return await rickController.handleCommand(req, res, command);
      }

      // Build context
      const context = await contextBuilder.build(teacherId);
      
      // Generate response
      const response = await ollamaService.generateResponse(message, context);

      res.json({
        success: true,
        response,
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

  // Handle memory commands
  async handleCommand(req, res, command) {
    const teacherId = req.session.teacher_id;

    try {
      switch (command.type) {
        case 'remember':
          await memoryService.saveMemory(teacherId, command.content);
          return res.json({
            success: true,
            response: 'Got it! I\'ll remember that.',
            type: 'memory'
          });

        case 'memories':
          const memories = await memoryService.getMemories(teacherId);
          return res.json({
            success: true,
            memories,
            type: 'memory_list'
          });

        case 'forget':
          if (command.memoryId) {
            await memoryService.deleteMemory(teacherId, command.memoryId);
            return res.json({
              success: true,
              response: 'Memory deleted.',
              type: 'memory'
            });
          }
          throw new Error('Memory ID required');

        default:
          throw new Error('Unknown command');
      }
    } catch (error) {
      console.error('Command error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute command',
        details: error.message
      });
    }
  },

  // Execute quick queries
  async quickQuery(req, res) {
    try {
      const { queryType } = req.body;
      const teacherId = req.session.teacher_id;

      const result = await queryService.executeQuickQuery(teacherId, queryType);

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
  },

  // Get memories
  async getMemories(req, res) {
    try {
      const teacherId = req.session.teacher_id;
      const memories = await memoryService.getMemories(teacherId);

      res.json({
        success: true,
        memories
      });
    } catch (error) {
      console.error('Get memories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve memories',
        details: error.message
      });
    }
  },

  // Delete memory
  async deleteMemory(req, res) {
    try {
      const teacherId = req.session.teacher_id;
      const { memoryId } = req.params;

      await memoryService.deleteMemory(teacherId, memoryId);

      res.json({
        success: true,
        message: 'Memory deleted'
      });
    } catch (error) {
      console.error('Delete memory error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete memory',
        details: error.message
      });
    }
  }
};

module.exports = rickController;
