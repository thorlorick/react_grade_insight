// backend/src/services/rick/patternMatcher.js

const { pool: db } = require('../../db');
const { analyzeStudentPerformance } = require('./studentAnalyzer');
const { analyzeMissingWork, analyzeFailures } = require('./assignmentAnalyzer');
const { findAtRiskStudents, findChronicMissingWork } = require('./populationAnalyzer');
const { formatClarification } = require('../../utils/assignmentNormalizer');
const { intelligentMatch } = require('./intelligentMatcher');
const { fuzzyFindStudent, fuzzyFindAssignment } = require('./entityMatcher');

/**
 * Pattern definitions
 */
const PATTERNS = [
  {
    // Pattern 1: "How is [STUDENT] doing in [SUBJECT]?" (MUST BE FIRST - most specific)
    patterns: [
      /(?:how\s+(?:is|'s)|what\s+about)\s+(.+?)\s+doing\s+in\s+(.+)/i,
      /(?:analyze|show)\s+(.+?)(?:'s)?\s+(?:performance|grades?|progress)\s+in\s+(.+)/i,
      /(.+?)(?:'s)?\s+(math|science|english|history|social studies|french|spanish)\s+(?:performance|grades?)/i,
    ],
    intent: 'analyzeStudentSubject',
    entities: ['studentName', 'subject'],
    description: 'Analyze student performance in specific subject',
    handler: async (entities, teacherId) => {
      const student = await fuzzyFindStudent(entities.studentName, teacherId);
      if (student.needsClarification) {
        return {
          success: false,
          needsClarification: true,
          options: student.options,
          message: `I found multiple students. Which one did you mean?\n\n` +
            student.options.map((s, i) => `${i + 1}. ${s.first_name} ${s.last_name}`).join('\n')
        };
      }

      const { categorizeAssignment } = require('../../utils/gradeUtils');

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
      `, [student.id, teacherId]);

      const subjectMap = {
        'math': 'Math',
        'mathematics': 'Math',
        'science': 'Science',
        'english': 'English',
        'ela': 'English',
        'history': 'Social Studies',
        'social studies': 'Social Studies',
        'geography': 'Social Studies',
        'french': 'French',
        'français': 'French',
        'francais': 'French',
        'spanish': 'Spanish',
        'español': 'Spanish',
        'espanol': 'Spanish',
      };
      
      const targetSubject = subjectMap[entities.subject.toLowerCase()] || 
                           entities.subject.charAt(0).toUpperCase() + entities.subject.slice(1).toLowerCase();

      const subjectRecords = records.filter(r => {
        const category = categorizeAssignment(r.assignment);
        return category === targetSubject;
      });

      if (subjectRecords.length === 0) {
        return {
          success: true,
          intent: 'analyzeStudentSubject',
          analysis: `${student.first_name} ${student.last_name} has no graded ${targetSubject} assignments yet.`
        };
      }

      const analysis = analyzeStudentPerformance(
        `${student.first_name} ${student.last_name} - ${targetSubject}`, 
        subjectRecords
      );

      return {
        success: true,
        intent: 'analyzeStudentSubject',
        analysis
      };
    }
  },
  {
    // Pattern 2: "How is [STUDENT] doing?" (general)
    patterns: [
      /(?:how\s+(?:is|'s)|what\s+about|tell\s+me\s+about)\s+(.+?)\s+doing\s*$/i,
      /(?:analyze|assess|evaluate)\s+(.+?)(?:'s)?\s+(?:performance|progress)\s*$/i,
    ],
    intent: 'analyzeStudent',
    entities: ['studentName'],
    description: 'Analyze overall student performance',
    handler: async (entities, teacherId) => {
      const student = await fuzzyFindStudent(entities.studentName, teacherId);
      if (student.needsClarification) {
        return {
          success: false,
          needsClarification: true,
          options: student.options,
          message: `I found multiple students. Which one did you mean?\n\n` +
            student.options.map((s, i) => `${i + 1}. ${s.first_name} ${s.last_name}`).join('\n')
        };
      }

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
      `, [student.id, teacherId]);

      const analysis = analyzeStudentPerformance(
        `${student.first_name} ${student.last_name}`, 
        records
      );

      return {
        success: true,
        intent: 'analyzeStudent',
        analysis
      };
    }
  },
  {
    // Pattern 3: "Who didn't do [ASSIGNMENT]?"
    patterns: [
      /who\s+(?:didn't|did not|hasn't|has not|haven't|have not)\s+(?:do|done|submit|submitted|turn in|turned in|complete|completed)\s+(.+)/i,
      /(?:show|list)\s+(?:me\s+)?missing\s+(?:work|submissions?)\s+(?:for|on)\s+(.+)/i,
      /what\s+(?:students?|kids?)\s+(?:didn't|did not|hasn't|has not)\s+(?:do|done|submit|submitted)\s+(.+)/i,
      /who\s+(?:is|are)\s+missing\s+(.+)/i,
    ],
    intent: 'missingWork',
    entities: ['assignmentName'],
    description: 'Find students who didn\'t submit assignment',
    handler: async (entities, teacherId) => {
      const assignment = await fuzzyFindAssignment(entities.assignmentName, teacherId);
      if (assignment.needsClarification) {
        return {
          success: false,
          needsClarification: true,
          options: assignment.options,
          message: `I found multiple assignments. Which one did you mean?\n\n` +
            formatClarification(assignment.options)
        };
      }

      const result = await analyzeMissingWork(assignment.id, teacherId);
      return result;
    }
  },
  {
    // Pattern 4: "Who failed [ASSIGNMENT]?"
    patterns: [
      /who\s+(?:failed|is failing)\s+(.+)/i,
      /(?:show|list)\s+(?:me\s+)?(?:students?|kids?)\s+who\s+failed\s+(.+)/i,
      /what\s+(?:students?|kids?)\s+(?:failed|are failing)\s+(.+)/i,
      /(?:failures?|failing students?)\s+(?:for|on)\s+(.+)/i,
    ],
    intent: 'failedAssignment',
    entities: ['assignmentName'],
    description: 'Find students who failed assignment',
    handler: async (entities, teacherId) => {
      const assignment = await fuzzyFindAssignment(entities.assignmentName, teacherId);
      if (assignment.needsClarification) {
        return {
          success: false,
          needsClarification: true,
          options: assignment.options,
          message: `I found multiple assignments. Which one did you mean?\n\n` +
            formatClarification(assignment.options)
        };
      }

      const result = await analyzeFailures(assignment.id, teacherId, 60);
      return result;
    }
  },
  {
    // Pattern 5: "Who is at risk?"
    patterns: [
      /who\s+(?:is|are)\s+(?:at risk|struggling|failing|behind)/i,
      /(?:show|list)\s+(?:me\s+)?(?:at risk|struggling|failing)\s+students?/i,
      /what\s+students?\s+(?:need|require)\s+(?:help|support|intervention)/i,
    ],
    intent: 'atRisk',
    entities: [],
    description: 'Find at-risk students',
    handler: async (entities, teacherId) => {
      const result = await findAtRiskStudents(teacherId, 60);
      return result;
    }
  },
  {
    // Pattern 6: "Who has missing work?"
    patterns: [
      /who\s+has\s+(?:lots of|a lot of|multiple|chronic|many)?\s*missing\s+(?:work|assignments?)/i,
      /(?:show|list)\s+(?:chronic|multiple)?\s*missing\s+(?:work|assignments?)/i,
      /what\s+students?\s+(?:aren't|are not)\s+turning\s+in\s+work/i,
    ],
    intent: 'chronicMissing',
    entities: [],
    description: 'Find students with chronic missing work',
    handler: async (entities, teacherId) => {
      const result = await findChronicMissingWork(teacherId, 3);
      return result;
    }
  }
];

/**
 * Match user message against patterns
 */
function matchPattern(message) {
  const normalized = message.toLowerCase().trim();
  
  for (const patternGroup of PATTERNS) {
    for (const regex of patternGroup.patterns) {
      const match = normalized.match(regex);
      
      if (match) {
        const entities = {};
        patternGroup.entities.forEach((entityName, index) => {
          if (match[index + 1] !== undefined) {
            entities[entityName] = match[index + 1];
          }
        });
        
        console.log('Pattern matched:', patternGroup.intent);
        console.log('Entities extracted:', entities);
        
        return {
          intent: patternGroup.intent,
          entities: entities,
          confidence: 0.9,
          description: patternGroup.description,
          handler: patternGroup.handler
        };
      }
    }
  }
  
  return null;
}

/**
 * Main parsing function with three-layer intelligence
 */
async function parseNaturalLanguage(message, teacherId) {
  // LAYER 1: Try exact pattern matching
  const matched = matchPattern(message);

  if (matched && matched.handler) {
    try {
      console.log('Layer 1: Exact pattern matched');
      return await matched.handler(matched.entities, teacherId);
    } catch (error) {
      console.error('Pattern handler error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // LAYER 2: Try intelligent component analysis
  console.log('Layer 1 failed, trying Layer 2: Intelligent matching');
  const intelligentResult = await intelligentMatch(message, teacherId);
  
  if (intelligentResult) {
    console.log('Layer 2: Intelligent match found');
    return intelligentResult;
  }

  // LAYER 3: Helpful error message
  console.log('Layer 2 failed, returning Layer 3: Help message');
  return {
    success: false,
    error: 'I don\'t understand that question. Try:\n' +
           '- "How is [student] doing?"\n' +
           '- "How is [student] doing in [subject]?"\n' +
           '- "Who didn\'t do [assignment]?"\n' +
           '- "Who failed [assignment]?"\n' +
           '- "Who is at risk?"\n' +
           '- "Who is at risk in [subject]?"\n' +
           '- "Who is doing well?"\n' +
           '- "Who has missing work?"'
  };
}

module.exports = {
  parseNaturalLanguage,
  matchPattern,
  fuzzyFindStudent,
  fuzzyFindAssignment
};
