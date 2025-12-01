// backend/src/services/rick/patternMatcher.js

const Fuse = require('fuse.js');
const { pool: db } = require('../../db');
const { analyzeStudentPerformance } = require('./studentAnalyzer');
const { analyzeMissingWork, analyzeFailures } = require('./assignmentAnalyzer');
const { findAtRiskStudents, findChronicMissingWork } = require('./populationAnalyzer');
const { findBestMatch, formatClarification } = require('../../utils/assignmentNormalizer');

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

      // Import categorization from utils
      const { categorizeAssignment } = require('../../utils/gradeUtils');

      // Fetch ALL grades for this student
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

      // Normalize subject name
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

      // Filter records to only this subject
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

      // Use existing analyzer but with filtered records
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

      // Fetch grades for this student WITH percentages
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
    // Pattern 2: "How is [STUDENT] doing?" (general - AFTER subject-specific)
    patterns: [
      /(?:how\s+(?:is|'s)|what\s+about|tell\s+me\s+about)\s+(.+?)\s+doing\s*$/i,  // Added $ to prevent matching "doing in"
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

      // Fetch grades for this student WITH percentages
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

      // Import categorization from utils
      const { categorizeAssignment } = require('../../utils/gradeUtils');

      // Fetch ALL grades for this student
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

      // Normalize subject name
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

      // Filter records to only this subject
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

      // Use existing analyzer but with filtered records
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
    // Pattern 2: "Who didn't do [ASSIGNMENT]?"
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
        const { formatClarification } = require('../../utils/assignmentNormalizer');
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
    // Pattern 3: "Who failed [ASSIGNMENT]?"
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
        const { formatClarification } = require('../../utils/assignmentNormalizer');
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
    // Pattern 4: "Who is at risk?" / "Who is struggling?"
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
    // Pattern 5: "Who has missing work?" / "Show chronic missing work"
    patterns: [
      /who\s+has\s+(?:lots of|a lot of|multiple|chronic|many)\s+missing\s+(?:work|assignments?)/i,
      /(?:show|list)\s+(?:chronic|multiple)\s+missing\s+(?:work|assignments?)/i,
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
        // Extract entities from regex capture groups
        const entities = {};
        patternGroup.entities.forEach((entityName, index) => {
          // Only add entity if capture group exists
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
 * Fuzzy find student by name
 */
async function fuzzyFindStudent(name, teacherId) {
  const [students] = await db.query(`
    SELECT DISTINCT s.id, s.first_name, s.last_name,
           CONCAT(s.first_name, ' ', s.last_name) as full_name
    FROM students s
    JOIN grades g ON s.id = g.student_id
    WHERE g.teacher_id = ?
  `, [teacherId]);
  
  if (students.length === 0) {
    throw new Error('No students found for this teacher');
  }
  
  const fuse = new Fuse(students, {
    keys: ['first_name', 'last_name', 'full_name'],
    threshold: 0.4,
    includeScore: true
  });
  
  const results = fuse.search(name);
  
  if (results.length === 0) {
    throw new Error(`No student found matching "${name}"`);
  }
  
  if (results.length === 1 || results[0].score < 0.2) {
    return results[0].item;
  }
  
  return {
    needsClarification: true,
    options: results.slice(0, 3).map(r => r.item)
  };
}

/**
 * Fuzzy find assignment by name using smart normalizer
 */
async function fuzzyFindAssignment(name, teacherId) {
  const [assignments] = await db.query(`
    SELECT id, name, due_date, max_points
    FROM assignments
    WHERE teacher_id = ?
  `, [teacherId]);
  
  if (assignments.length === 0) {
    throw new Error('No assignments found');
  }
  
  // Use smart matcher
  const result = findBestMatch(name, assignments);
  
  if (!result.found) {
    if (result.needsClarification) {
      return {
        needsClarification: true,
        options: result.matches
      };
    }
    throw new Error(result.error);
  }
  
  // Return the matched assignment (without tokens/matchScore)
  const { tokens, matchScore, ...assignment } = result.assignment;
  return assignment;
}

/**
 * Main parsing function
 */
async function parseNaturalLanguage(message, teacherId) {
  const matched = matchPattern(message);

  if (!matched) {
    return {
      success: false,
      error: 'I don\'t understand that question. Try:\n' +
             '- "How is [student] doing?"\n' +
             '- "Who didn\'t do [assignment]?"\n' +
             '- "Who failed [assignment]?"\n' +
             '- "Who is at risk?"\n' +
             '- "Who has missing work?"'
    };
  }

  // Call the handler if it exists
  if (matched.handler) {
    try {
      return await matched.handler(matched.entities, teacherId);
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Fallback (shouldn't reach here with current patterns)
  return {
    success: true,
    intent: matched.intent,
    entities: matched.entities,
    confidence: matched.confidence
  };
}

module.exports = {
  parseNaturalLanguage,
  matchPattern,
  fuzzyFindStudent,
  fuzzyFindAssignment
};
