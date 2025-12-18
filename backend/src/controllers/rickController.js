// backend/src/controllers/rickController.js
const { parseNaturalLanguage } = require('../services/rick/patternMatcher');
const queryBuilders = require('../services/rick/queryBuilders');
const formatters = require('../services/rick/formatters');

/**
 * Handle clarification responses (when user picks an option)
 */
async function handleClarificationResponse(message, clarification, teacherId) {
  const trimmed = message.trim();
  
  // Check if it's a number (1, 2, 3, etc.)
  const numberMatch = trimmed.match(/^(\d+)$/);
  if (numberMatch) {
    const index = parseInt(numberMatch[1]) - 1; // Convert to 0-based index
    
    if (index >= 0 && index < clarification.options.length) {
      const selected = clarification.options[index];
      console.log('User selected option', index + 1, ':', selected);
      
      // Re-execute the original query with the selected option
      return await reExecuteWithSelection(
        clarification.originalQuery,
        clarification.type,
        selected,
        teacherId
      );
    }
  }
  
  // Check if they typed a name that matches one of the options
  const lowerMessage = trimmed.toLowerCase();
  
  for (let i = 0; i < clarification.options.length; i++) {
    const option = clarification.options[i];
    
    // For students, check first name, last name, or full name
    if (option.first_name && option.last_name) {
      const fullName = `${option.first_name} ${option.last_name}`.toLowerCase();
      const firstName = option.first_name.toLowerCase();
      const lastName = option.last_name.toLowerCase();
      
      if (lowerMessage.includes(fullName) || 
          lowerMessage === firstName || 
          lowerMessage === lastName) {
        console.log('User typed name matching option', i + 1, ':', option);
        return await reExecuteWithSelection(
          clarification.originalQuery,
          clarification.type,
          option,
          teacherId
        );
      }
    }
    
    // For assignments, check assignment name
    if (option.name) {
      if (lowerMessage.includes(option.name.toLowerCase())) {
        console.log('User typed assignment matching option', i + 1, ':', option);
        return await reExecuteWithSelection(
          clarification.originalQuery,
          clarification.type,
          option,
          teacherId
        );
      }
    }
  }
  
  // Didn't match any clarification - treat as new query
  return null;
}

/**
 * Re-execute the original query with the selected entity
 */
async function reExecuteWithSelection(originalQuery, type, selectedOption, teacherId) {
  console.log('Re-executing query:', originalQuery);
  console.log('Type:', type);
  console.log('Selected:', selectedOption);
  
  // Import analyzers
  const { analyzeStudentPerformance } = require('../services/rick/studentAnalyzer');
  const { analyzeMissingWork, analyzeFailures } = require('../services/rick/assignmentAnalyzer');
  const { pool: db } = require('../db');
  
  // Determine what to do based on the original query and type
  const queryLower = originalQuery.toLowerCase();
  
  // Student analysis queries
  if (type === 'student' && queryLower.includes('doing')) {
    // "How is [student] doing in [subject]?" or "How is [student] doing?"
    
    // Check if there's a subject mentioned
    const subjectMatch = queryLower.match(/in\s+(math|science|english|french|spanish|history)/i);
    let subject = null;
    if (subjectMatch) {
      const subjectMap = {
        'math': 'Math', 'science': 'Science', 'english': 'English',
        'french': 'French', 'spanish': 'Spanish', 'history': 'Social Studies'
      };
      subject = subjectMap[subjectMatch[1].toLowerCase()];
    }
    
    // Fetch grades
    const [records] = await db.query(`
      SELECT 
        a.name AS assignment, 
        g.grade AS raw_grade,
        a.max_points,
        CASE 
          WHEN g.grade IS NULL OR g.grade = '' THEN NULL
          WHEN a.max_points > 0 THEN ROUND((g.grade / a.max_points) * 100, 1)
          ELSE g.grade
        END AS grade
      FROM grades g
      JOIN assignments a ON g.assignment_id = a.id
      WHERE g.student_id = ? AND g.teacher_id = ?
    `, [selectedOption.id, teacherId]);
    
    // Filter by subject if specified
    let filteredRecords = records;
    if (subject) {
      const { categorizeAssignment } = require('../utils/gradeUtils');
      filteredRecords = records.filter(r => {
        const category = categorizeAssignment(r.assignment);
        return category === subject;
      });
    }
    
    const analysis = analyzeStudentPerformance(
      subject 
        ? `${selectedOption.first_name} ${selectedOption.last_name} - ${subject}`
        : `${selectedOption.first_name} ${selectedOption.last_name}`,
      filteredRecords
    );
    
    return {
      success: true,
      intent: subject ? 'analyzeStudentSubject' : 'analyzeStudent',
      analysis
    };
  }
  
  // Assignment queries (missing work or failed)
  if (type === 'assignment') {
    if (queryLower.includes("didn't") || queryLower.includes('missing')) {
      // "Who didn't do [assignment]?"
      return await analyzeMissingWork(selectedOption.id, teacherId);
    }
    
    if (queryLower.includes('fail')) {
      // "Who failed [assignment]?"
      return await analyzeFailures(selectedOption.id, teacherId, 60);
    }
  }
  
  // Fallback - couldn't determine what to do
  return {
    success: false,
    error: 'Sorry, I couldn\'t figure out what to do with that selection.'
  };
}

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

      // Check if this is a clarification response
      if (req.session.pendingClarification) {
        console.log('Pending clarification exists:', req.session.pendingClarification);
        const clarificationResult = await handleClarificationResponse(
          message, 
          req.session.pendingClarification, 
          teacherId
        );
        
        if (clarificationResult) {
          // Clear the pending clarification
          delete req.session.pendingClarification;
          
          console.log('Clarification resolved, sending response');
          return res.json({
            success: true,
            response: clarificationResult.analysis || clarificationResult.response,
            intent: clarificationResult.intent,
            data: clarificationResult,
            structured: clarificationResult.structured
          });
        }
        
        // If clarification handler returned null, treat as new query
        console.log('Clarification not resolved, treating as new query');
        delete req.session.pendingClarification;
      }

      // Parse natural language
      console.log('Calling parseNaturalLanguage...');
      const parsed = await parseNaturalLanguage(message, teacherId);
      console.log('Parsed result:', JSON.stringify(parsed, null, 2));

      // Handle clarification requests specially (not errors!)
      if (parsed.needsClarification) {
        console.log('Needs clarification, storing in session');
        
        // Store clarification state in session
        req.session.pendingClarification = {
          originalQuery: message,
          type: parsed.clarificationType || 'unknown',
          options: parsed.options,
          timestamp: Date.now()
        };
        
        return res.json({
          success: true,
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
