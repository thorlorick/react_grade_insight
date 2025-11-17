// backend/src/services/rick/patternMatcher.js
const Fuse = require('fuse.js');
const { pool: db } = require('../../db');

/**
 * Pattern definitions - add more here as you expand
 */
const PATTERNS = [
  {
    // Pattern 1: "Show [student] grades"
    patterns: [
      /show\s+(?:me\s+)?(.+?)(?:'s)?\s+(?:grades?|scores?)/i,
      /(?:grades?|scores?)\s+for\s+(.+)/i,
      /^(.+?)(?:'s)?\s+(?:grades?|scores?)$/i
    ],
    intent: 'showGrades',
    entities: ['studentName'],
    description: 'Show grades for a specific student'
  },
  {
    // Pattern 2: "Who is failing?"
    patterns: [
      /who\s+(?:is|are)\s+(failing|struggling|behind)/i,
      /(?:list|show)\s+(?:me\s+)?(failing|struggling|behind)\s+students/i
    ],
    intent: 'filterByStatus',
    entities: ['status'],
    description: 'List students by performance status'
  },
  {
    // Pattern 3: "What's the class average?"
    patterns: [
      /(?:what(?:'s| is)|show)\s+(?:the\s+)?class\s+average/i,
      /(?:class|overall)\s+average/i,
      /average\s+(?:grade|score)\s+for\s+(?:class|everyone)/i
    ],
    intent: 'classAverage',
    entities: [],
    description: 'Calculate class average grade'
  },
  {
  // Pattern 5: Missing Work
  patterns: [
    /who\s+(?:has|is)\s+missing\s+(?:grades?|work|assignments?)/i,
    /(?:show|list)\s+missing\s+(?:grades?|work|assignments?)/i,
    /what\s+(?:is|are)\s+(.+?)\s+missing/i,
    /missing\s+(?:work|grades?|assignments?)\s+for\s+(.+)/i,
    /(?:which|what)\s+students?\s+(?:didn't|haven't|did not|have not)\s+(?:submit|turn in|complete)/i,
    /(?:who|which students?)\s+(?:are|is)\s+missing\s+(.+)/i
  ],
  intent: 'missingWork',
  entities: ['studentName', 'assignmentName'],  // Both optional
  description: 'Show missing/incomplete work',
  entityParser: (match) => {
    // Extract student or assignment name from various patterns
    const entities = {};
    if (match[1]) {
      // Could be student name or assignment name
      // We'll resolve later based on fuzzy matching
      entities.searchTerm = match[1];
    }
    return entities;
  }
},
{
  // Pattern 6: Assignment Analysis
  patterns: [
    /(?:show|display|list)\s+(?:grades?\s+for|results?\s+for)\s+(.+)/i,
    /(?:what|show)\s+(?:is|are)\s+(?:the\s+)?(?:grades?|results?|scores?)\s+(?:for|on)\s+(.+)/i,
    /(?:how\s+did|how\s+are)\s+students?\s+do\s+on\s+(.+)/i,
    /(.+)\s+(?:grades?|results?|scores?)$/i,
    /(?:average|results?|performance)\s+(?:for|on)\s+(.+)/i
  ],
  intent: 'assignmentAnalysis',
  entities: ['assignmentName'],
  description: 'Analyze grades for a specific assignment'
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
          entities[entityName] = match[index + 1];
        });
        
        return {
          intent: patternGroup.intent,
          entities: entities,
          confidence: 0.9,
          description: patternGroup.description
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
  // Get all students for this teacher
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
  
  // Use Fuse.js for fuzzy matching
  const fuse = new Fuse(students, {
    keys: ['first_name', 'last_name', 'full_name'],
    threshold: 0.4, // 0 = exact match, 1 = match anything
    includeScore: true
  });
  
  const results = fuse.search(name);
  
  if (results.length === 0) {
    throw new Error(`No student found matching "${name}"`);
  }
  
  if (results.length === 1 || results[0].score < 0.2) {
    // Clear winner
    return results[0].item;
  }
  
  // Multiple close matches - need clarification
  return {
    needsClarification: true,
    options: results.slice(0, 3).map(r => r.item)
  };
}

/**
 * Main parsing function
 */
async function parseNaturalLanguage(message, teacherId) {
  // Match pattern
  const matched = matchPattern(message);
  
  if (!matched) {
    return {
      success: false,
      error: 'I don\'t understand that question. Try:\n' +
             '- "Show [student] grades"\n' +
             '- "Who is failing?"\n' +
             '- "What\'s the class average?"'
    };
  }
  
  // Resolve student entity if needed
  if (matched.entities.studentName) {
    try {
      const student = await fuzzyFindStudent(matched.entities.studentName, teacherId);
      
      if (student.needsClarification) {
        return {
          success: false,
          needsClarification: true,
          options: student.options,
          message: `I found multiple students. Did you mean:\n` +
                  student.options.map((s, i) => 
                    `${i + 1}. ${s.first_name} ${s.last_name}`
                  ).join('\n')
        };
      }
      
      matched.entities.student = student;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  return {
    success: true,
    intent: matched.intent,
    entities: matched.entities,
    confidence: matched.confidence
  };
}

/**
 * Fuzzy find assignment by name
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
  
  const fuse = new Fuse(assignments, {
    keys: ['name'],
    threshold: 0.4,
    includeScore: true
  });
  
  const results = fuse.search(name);
  
  if (results.length === 0) {
    throw new Error(`No assignment found matching "${name}"`);
  }
  
  if (results.length === 1 || results[0].score < 0.2) {
    return results[0].item;
  }
  
  return {
    needsClarification: true,
    options: results.slice(0, 3).map(r => r.item)
  };
}

// Add to module.exports:
module.exports = {
  parseNaturalLanguage,
  matchPattern,
  fuzzyFindStudent,
  fuzzyFindAssignment  // NEW
};
