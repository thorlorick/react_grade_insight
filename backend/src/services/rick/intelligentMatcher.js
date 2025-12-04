// backend/src/services/rick/intelligentMatcher.js

const { fuzzyFindStudent, fuzzyFindAssignment } = require('./patternMatcher');
const { analyzeStudentPerformance } = require('./studentAnalyzer');
const { findAtRiskStudents, findChronicMissingWork } = require('./populationAnalyzer');
const { categorizeAssignment } = require('../../utils/gradeUtils');
const { pool: db } = require('../../db');

/**
 * Analyze the components of a natural language question
 */
function analyzeComponents(message) {
  const normalized = message.toLowerCase();
  const words = normalized.split(/\s+/);
  
  const components = {
    action: null,
    target: null,
    filters: {
      subject: null,
      status: null,
      assignmentType: null,
      assignment: null,
      student: null,
      inverse: false
    },
    confidence: 0,
    raw: message
  };

  // Detect ACTION
  if (words.some(w => ['who', 'show', 'list', 'find', 'which'].includes(w))) {
    components.action = 'find';
    components.confidence += 0.3;
  }
  if (words.some(w => ['how', 'analyze', 'doing', 'performing'].includes(w))) {
    components.action = 'analyze';
    components.confidence += 0.3;
  }

  // Detect TARGET
  if (words.includes('who')) {
    components.target = 'students';
    components.confidence += 0.2;
  }
  
  // Detect INVERSE (NOT queries)
  if (words.some(w => ['not', "isn't", "aren't", 'without'].includes(w))) {
    components.filters.inverse = true;
    components.confidence += 0.1;
  }

  // Detect STATUS
  if (words.some(w => ['risk', 'struggling', 'behind', 'trouble'].includes(w))) {
    components.filters.status = 'at-risk';
    components.confidence += 0.2;
  }
  if (words.some(w => ['failing', 'failed', 'fail'].includes(w))) {
    components.filters.status = 'failing';
    components.confidence += 0.2;
  }
  if (words.some(w => ['missing', 'incomplete', 'unsubmitted'].includes(w))) {
    components.filters.status = 'missing-work';
    components.confidence += 0.2;
  }
  if (words.some(w => ['well', 'good', 'great', 'strong', 'excelling', 'succeeding'].includes(w))) {
    components.filters.status = 'doing-well';
    components.confidence += 0.2;
  }

  // Detect SUBJECT
  const subjects = {
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
    'espanol': 'Spanish'
  };
  
  for (const [key, value] of Object.entries(subjects)) {
    if (normalized.includes(key)) {
      components.filters.subject = value;
      components.confidence += 0.2;
      break;
    }
  }

  // Detect ASSIGNMENT TYPE
  if (words.some(w => ['quiz', 'quizzes'].includes(w))) {
    components.filters.assignmentType = 'Assessment';
    components.confidence += 0.1;
  }
  if (words.some(w => ['test', 'tests', 'exam', 'exams'].includes(w))) {
    components.filters.assignmentType = 'Assessment';
    components.confidence += 0.1;
  }
  if (words.some(w => ['homework', 'hw', 'assignments'].includes(w))) {
    components.filters.assignmentType = 'Homework';
    components.confidence += 0.1;
  }
  if (words.some(w => ['project', 'projects'].includes(w))) {
    components.filters.assignmentType = 'Project';
    components.confidence += 0.1;
  }

  // Try to extract student name (if analyzing)
  if (components.action === 'analyze') {
    const studentPattern = /(?:how (?:is|'s)|what about|tell me about)\s+(.+?)\s+doing/i;
    const match = message.match(studentPattern);
    if (match) {
      components.filters.student = match[1].trim();
      components.confidence += 0.2;
    }
  }

  console.log('=== COMPONENT ANALYSIS ===');
  console.log('Message:', message);
  console.log('Components:', components);
  console.log('Confidence:', components.confidence);

  return components;
}

/**
 * Validate if the components make sense together
 */
function validateComponents(components) {
  const issues = [];
  
  // Need at least an action
  if (!components.action) {
    issues.push('Could not determine what you want to do (find, analyze, show)');
  }
  
  // Need a target for find actions
  if (components.action === 'find' && !components.target) {
    issues.push('Could not determine who or what you want to find');
  }
  
  // Need a student for analyze actions
  if (components.action === 'analyze' && !components.filters.student) {
    issues.push('Please specify which student to analyze');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Filter students by subject
 */
async function filterStudentsBySubject(students, subject, teacherId) {
  const filtered = [];
  
  for (const student of students) {
    // Get all grades for this student
    const [grades] = await db.query(`
      SELECT a.name AS assignment, g.grade
      FROM grades g
      JOIN assignments a ON g.assignment_id = a.id
      WHERE g.student_id = ? AND g.teacher_id = ?
    `, [student.id, teacherId]);
    
    // Filter to subject
    const subjectGrades = grades.filter(g => {
      const category = categorizeAssignment(g.assignment);
      return category === subject;
    });
    
    if (subjectGrades.length > 0) {
      // Recalculate average for just this subject
      const validGrades = subjectGrades
        .map(g => g.grade)
        .filter(g => g !== null && g !== undefined);
      
      if (validGrades.length > 0) {
        const avg = validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
        filtered.push({
          ...student,
          subjectAverage: parseFloat(avg.toFixed(1)),
          subjectGradeCount: validGrades.length
        });
      }
    }
  }
  
  return filtered;
}

/**
 * Filter grades by assignment type
 */
function filterGradesByType(grades, assignmentType) {
  return grades.filter(g => {
    const category = categorizeAssignment(g.assignment || g.assignment_name);
    return category === assignmentType;
  });
}

/**
 * Route to the appropriate composed analyzer
 */
async function routeToComposedAnalyzer(components, teacherId) {
  const { action, target, filters } = components;

  // === FIND QUERIES ===
  
  // "Who is at risk?" or "Who is at risk in [subject]?"
  if (action === 'find' && filters.status === 'at-risk') {
    const result = await findAtRiskStudents(teacherId, 60);
    
    if (!result.success || result.atRiskCount === 0) {
      return result;
    }
    
    // Filter by subject if specified
    if (filters.subject) {
      const filtered = await filterStudentsBySubject(result.students, filters.subject, teacherId);
      
      return {
        success: true,
        intent: 'atRiskInSubject',
        analysis: `**At-Risk Students in ${filters.subject}**\n\n` +
                 `${filtered.length} student${filtered.length !== 1 ? 's' : ''} averaging below 60% in ${filters.subject}.\n\n` +
                 `**Students:**\n` +
                 filtered.map(s => `• ${s.first_name} ${s.last_name}: ${s.subjectAverage}% (${s.subjectGradeCount} graded)`).join('\n'),
        structured: {
          type: 'atRiskInSubject',
          title: `At-Risk Students in ${filters.subject}`,
          summary: `${filtered.length} students averaging below 60% in ${filters.subject}`,
          studentList: filtered.map(s => ({
            id: s.id,
            name: `${s.first_name} ${s.last_name}`,
            grade: `${s.subjectAverage}%`
          }))
        }
      };
    }
    
    return result;
  }
  
  // "Who is doing well?" or "Who is doing well in [subject]?"
  if (action === 'find' && filters.status === 'doing-well') {
    // Get all students above 80%
    const [studentAverages] = await db.query(`
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        AVG(
          CASE 
            WHEN g.grade IS NOT NULL AND a.max_points > 0 
            THEN (g.grade / a.max_points) * 100
            WHEN g.grade IS NOT NULL
            THEN g.grade
            ELSE NULL
          END
        ) as average_percentage
      FROM students s
      JOIN grades g ON s.id = g.student_id
      JOIN assignments a ON g.assignment_id = a.id
      WHERE g.teacher_id = ?
      GROUP BY s.id, s.first_name, s.last_name
      HAVING average_percentage >= 80
      ORDER BY average_percentage DESC
    `, [teacherId]);
    
    if (studentAverages.length === 0) {
      return {
        success: true,
        intent: 'doingWell',
        analysis: 'No students currently averaging above 80%.'
      };
    }
    
    // Filter by subject if specified
    if (filters.subject) {
      const filtered = await filterStudentsBySubject(studentAverages, filters.subject, teacherId);
      
      return {
        success: true,
        intent: 'doingWellInSubject',
        analysis: `**Students Doing Well in ${filters.subject}**\n\n` +
                 `${filtered.length} student${filtered.length !== 1 ? 's' : ''} averaging above 80% in ${filters.subject}.\n\n` +
                 `**Students:**\n` +
                 filtered.map(s => `• ${s.first_name} ${s.last_name}: ${s.subjectAverage}%`).join('\n'),
        structured: {
          type: 'doingWellInSubject',
          title: `Students Doing Well in ${filters.subject}`,
          summary: `${filtered.length} students averaging above 80% in ${filters.subject}`,
          studentList: filtered.map(s => ({
            id: s.id,
            name: `${s.first_name} ${s.last_name}`,
            grade: `${s.subjectAverage}%`
          }))
        }
      };
    }
    
    return {
      success: true,
      intent: 'doingWell',
      analysis: `**Students Doing Well**\n\n` +
               `${studentAverages.length} student${studentAverages.length !== 1 ? 's' : ''} averaging above 80%.\n\n` +
               `**Students:**\n` +
               studentAverages.map(s => `• ${s.first_name} ${s.last_name}: ${parseFloat(s.average_percentage).toFixed(1)}%`).join('\n'),
      structured: {
        type: 'doingWell',
        title: 'Students Doing Well',
        summary: `${studentAverages.length} students averaging above 80%`,
        studentList: studentAverages.map(s => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
          grade: `${parseFloat(s.average_percentage).toFixed(1)}%`
        }))
      }
    };
  }
  
  // "Who has missing work in [subject]?"
  if (action === 'find' && filters.status === 'missing-work' && filters.subject) {
    const result = await findChronicMissingWork(teacherId, 1);
    
    if (!result.success || result.flaggedCount === 0) {
      return {
        success: true,
        intent: 'missingWorkInSubject',
        analysis: `No students have missing work in ${filters.subject}.`
      };
    }
    
    const filtered = await filterStudentsBySubject(result.students, filters.subject, teacherId);
    
    return {
      success: true,
      intent: 'missingWorkInSubject',
      analysis: `**Missing Work in ${filters.subject}**\n\n` +
               `${filtered.length} student${filtered.length !== 1 ? 's' : ''} with missing ${filters.subject} assignments.\n\n` +
               `**Students:**\n` +
               filtered.map(s => `• ${s.first_name} ${s.last_name}`).join('\n'),
      structured: {
        type: 'missingWorkInSubject',
        title: `Missing Work in ${filters.subject}`,
        summary: `${filtered.length} students with missing ${filters.subject} assignments`,
        studentList: filtered.map(s => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name}`
        }))
      }
    };
  }
  
  // === ANALYZE QUERIES ===
  
  // "How is [student] doing on quizzes/tests/homework?"
  if (action === 'analyze' && filters.student && filters.assignmentType) {
    const student = await fuzzyFindStudent(filters.student, teacherId);
    
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
    
    const filtered = filterGradesByType(records, filters.assignmentType);
    
    if (filtered.length === 0) {
      return {
        success: true,
        intent: 'analyzeStudentByType',
        analysis: `${student.first_name} ${student.last_name} has no graded ${filters.assignmentType} assignments yet.`
      };
    }
    
    const analysis = analyzeStudentPerformance(
      `${student.first_name} ${student.last_name} - ${filters.assignmentType}`,
      filtered
    );
    
    return {
      success: true,
      intent: 'analyzeStudentByType',
      analysis
    };
  }
  
  // If we got here, we couldn't route it
  return null;
}

/**
 * Main intelligent matching function
 */
async function intelligentMatch(message, teacherId) {
  // Analyze components
  const components = analyzeComponents(message);
  
  // Check confidence threshold
  if (components.confidence < 0.5) {
    console.log('Confidence too low for intelligent matching');
    return null;
  }
  
  // Validate components
  const validation = validateComponents(components);
  if (!validation.valid) {
    console.log('Component validation failed:', validation.issues);
    return {
      success: false,
      error: `I'm not sure I understand. ${validation.issues[0]}`
    };
  }
  
  // Route to composed analyzer
  try {
    const result = await routeToComposedAnalyzer(components, teacherId);
    return result;
  } catch (error) {
    console.error('Error in intelligent router:', error);
    return null;
  }
}

module.exports = {
  intelligentMatch,
  analyzeComponents,
  validateComponents
};
