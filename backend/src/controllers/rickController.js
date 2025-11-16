// backend/src/controllers/rickController.js
const { parseNaturalLanguage } = require('../services/rick/patternMatcher');
const queryBuilders = require('../services/rick/queryBuilders');
const formatters = require('../services/rick/formatters');

const rickController = {
  // Health check
  async healthCheck(req, res) {
    try {
      res.json({
        success: true,
        status: 'Rick AI is online',
        patterns: 3
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'Service unavailable'
      });
    }
  },

  // Handle chat messages
  async chat(req, res) {
    try {
      const { message } = req.body;
      const teacherId = req.teacherId;
      const teacherName = req.teacherName || 'Teacher';

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      console.log(`Rick query from teacher ${teacherId}: "${message}"`);

      // Parse natural language
      const parsed = await parseNaturalLanguage(message, teacherId);

      if (!parsed.success) {
        return res.json({
          success: false,
          response: parsed.error || parsed.message
        });
      }

      // Execute appropriate query based on intent
      let result;
      let formatted;

      switch (parsed.intent) {
        case 'showGrades':
          result = await queryBuilders.showGradesQuery(parsed.entities, teacherId);
          formatted = formatters.formatGradesList(result);
          break;

        case 'filterByStatus':
          result = await queryBuilders.filterByStatusQuery(parsed.entities, teacherId);
          formatted = formatters.formatStudentList(result);
          break;

        case 'classAverage':
          result = await queryBuilders.classAverageQuery(parsed.entities, teacherId);
          formatted = formatters.formatClassAverage(result);
          break;

          case 'missingWork':
  // Resolve student/assignment from searchTerm if provided
  if (parsed.entities.searchTerm) {
    // Try student first
    try {
      parsed.entities.student = await require('../services/rick/patternMatcher').fuzzyFindStudent(parsed.entities.searchTerm, teacherId);
    } catch (e) {
      // Not a student, try assignment
      try {
        parsed.entities.assignment = await require('../services/rick/patternMatcher').fuzzyFindAssignment(parsed.entities.searchTerm, teacherId);
      } catch (e2) {
        // Neither - show all missing work
      }
    }
  }
  result = await queryBuilders.missingWorkQuery(parsed.entities, teacherId);
  formatted = formatters.formatMissingWork(result);
  break;

case 'assignmentAnalysis':
  // Resolve assignment
  const { fuzzyFindAssignment } = require('../services/rick/patternMatcher');
  parsed.entities.assignment = await fuzzyFindAssignment(parsed.entities.assignmentName, teacherId);
  
  if (parsed.entities.assignment.needsClarification) {
    return res.json({
      success: false,
      response: `I found multiple assignments. Did you mean:\n` +
                parsed.entities.assignment.options.map((a, i) => 
                  `${i + 1}. ${a.name}`
                ).join('\n')
    });
  }
  
  result = await queryBuilders.assignmentAnalysisQuery(parsed.entities, teacherId);
  formatted = formatters.formatAssignmentAnalysis(result);
  break;

        default:
          return res.json({
            success: false,
            response: 'I don\'t know how to handle that question yet.'
          });
      }

      res.json({
        success: true,
        response: formatted,
        intent: parsed.intent,
        data: result
      });

    } catch (error) {
      console.error('Rick chat error:', error);
      res.status(500).json({
        success: false,
        error: 'Sorry, I encountered an error processing your question.',
        details: error.message
      });
    }
  }
};

module.exports = rickController;
