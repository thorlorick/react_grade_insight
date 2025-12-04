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
        patterns: 7
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

      console.log('=== RICK CHAT DEBUG START ===');
      console.log('Message:', message);
      console.log('Teacher ID:', teacherId);

      if (!message || !message.trim()) {
        console.log('ERROR: Empty message');
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      console.log(`Rick query from teacher ${teacherId}: "${message}"`);

      // Parse natural language
      console.log('Calling parseNaturalLanguage...');
      const parsed = await parseNaturalLanguage(message, teacherId);
      console.log('Parsed result:', JSON.stringify(parsed, null, 2));

      // Handle clarification requests specially (not errors!)
      if (parsed.needsClarification) {
        console.log('Needs clarification, sending options');
        return res.json({
          success: true,  // Changed from false - this is a valid response
          needsClarification: true,
          response: parsed.message,
          options: parsed.options
        });
      }

      if (!parsed.success) {
        console.log('Parse failed, sending error response');
        return res.json({
          success: false,
          response: parsed.error || parsed.message
        });
      }

      // Handle greetings
      if (parsed.greeting) {
        console.log('Detected greeting, sending response');
        return res.json({
          success: true,
          response: "Hi! I'm Rick, your AI teaching assistant. I can help you:\n\n" +
                   "• Analyze student performance: \"How is [name] doing?\"\n" +
                   "• Find missing work: \"Who didn't do [assignment]?\"\n" +
                   "• Identify failures: \"Who failed [assignment]?\"\n" +
                   "• Find at-risk students: \"Who is struggling?\"\n" +
                   "• Check chronic missing work: \"Who has missing work?\"\n\n" +
                   "Just ask me a question in plain English!"
        });
      }

      console.log('Processing intent:', parsed.intent);

      // NEW INTENTS: Handled directly by analyzers
      const analyzerIntents = [
        'analyzeStudent',
        'analyzeStudentSubject',
        'analyzeStudentByType',  // NEW: from intelligent matcher
        'missingWork', 
        'failedAssignment',
        'atRisk',
        'atRiskInSubject',  // NEW: from intelligent matcher
        'chronicMissing',
        'missingWorkInSubject',  // NEW: from intelligent matcher
        'doingWell',  // NEW: from intelligent matcher
        'doingWellInSubject'  // NEW: from intelligent matcher
      ];

      if (analyzerIntents.includes(parsed.intent)) {
        console.log(`Executing ${parsed.intent} - handled by analyzer`);
        console.log('Sending successful response');
        console.log('=== RICK CHAT DEBUG END ===');
        
        return res.json({
          success: true,
          response: parsed.analysis,
          intent: parsed.intent,
          data: parsed,
          structured: parsed.structured  // Pass through structured data
        });
      }

      // LEGACY INTENTS: Still using old query builders
      let result;
      let formatted;

      switch (parsed.intent) {
        case 'showGrades':
          console.log('Executing showGrades query...');
          result = await queryBuilders.showGradesQuery(parsed.entities, teacherId);
          formatted = formatters.formatGradesList(result);
          break;

        case 'filterByStatus':
          console.log('Executing filterByStatus query...');
          result = await queryBuilders.filterByStatusQuery(parsed.entities, teacherId);
          formatted = formatters.formatStudentList(result);
          break;

        case 'classAverage':
          console.log('Executing classAverage query...');
          result = await queryBuilders.classAverageQuery(parsed.entities, teacherId);
          formatted = formatters.formatClassAverage(result);
          break;

        case 'assignmentAnalysis':
          console.log('Executing assignmentAnalysis query...');
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
          console.log('Unknown intent:', parsed.intent);
          return res.json({
            success: false,
            response: 'I don\'t know how to handle that question yet.'
          });
      }

      console.log('Sending successful response');
      console.log('=== RICK CHAT DEBUG END ===');

      res.json({
        success: true,
        response: formatted,
        intent: parsed.intent,
        data: result
      });

    } catch (error) {
      console.error('=== RICK CHAT ERROR ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Sorry, I encountered an error processing your question.',
        details: error.message
      });
    }
  }
};

module.exports = rickController;
