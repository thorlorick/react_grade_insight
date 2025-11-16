// backend/src/services/rick/queryBuilders.js
const { pool: db } = require('../../db');

/**
 * Query 1: Show grades for a specific student
 */
async function showGradesQuery(entities, teacherId) {
  const { student } = entities;
  
  const [grades] = await db.query(`
    SELECT 
      a.name as assignment_name,
      g.grade,
      a.due_date,
      a.max_points
    FROM grades g
    JOIN assignments a ON g.assignment_id = a.id
    WHERE g.student_id = ?
    AND g.teacher_id = ?
    ORDER BY a.due_date DESC
    LIMIT 20
  `, [student.id, teacherId]);
  
  if (grades.length === 0) {
    return {
      studentName: `${student.first_name} ${student.last_name}`,
      grades: [],
      message: `No grades found for ${student.first_name} ${student.last_name}`
    };
  }
  
// NEW (filter out nulls):
const validGrades = grades.filter(g => g.grade !== null);
const average = validGrades.length > 0 
  ? validGrades.reduce((sum, g) => sum + parseFloat(g.grade), 0) / validGrades.length
  : 0;
  
  return {
  studentName: `${student.first_name} ${student.last_name}`,
  grades: grades,
  average: average.toFixed(1),
  count: validGrades.length,  // Show only graded assignments
  totalAssignments: grades.length  // Total including null
};
}

/**
 * Query 2: Filter students by status (failing, struggling, etc.)
 */
async function filterByStatusQuery(entities, teacherId) {
  const { status } = entities;
  
  // Map status to threshold
  const thresholds = {
    'failing': 60,
    'struggling': 70,
    'behind': 65
  };
  
  const threshold = thresholds[status.toLowerCase()] || 60;
  
  const [students] = await db.query(`
    SELECT 
      s.id,
      s.first_name,
      s.last_name,
      AVG(g.grade) as avg_grade,
      COUNT(g.id) as assignment_count
    FROM students s
    JOIN grades g ON s.id = g.student_id
    WHERE g.teacher_id = ?
    GROUP BY s.id, s.first_name, s.last_name
    HAVING avg_grade < ?
    ORDER BY avg_grade ASC
  `, [teacherId, threshold]);
  
  return {
    status: status,
    threshold: threshold,
    count: students.length,
    students: students
  };
}

/**
 * Query 3: Calculate class average
 * "Class" = all students who have grades from this teacher
 */
async function classAverageQuery(entities, teacherId) {
  const [result] = await db.query(`
    SELECT 
      AVG(g.grade) as class_average,
      MIN(g.grade) as lowest_grade,
      MAX(g.grade) as highest_grade,
      COUNT(DISTINCT g.student_id) as student_count,
      COUNT(g.id) as total_grades
    FROM grades g
    WHERE g.teacher_id = ?
  `, [teacherId]);
  
  if (!result[0] || result[0].class_average === null) {
    return {
      message: 'No grades found for your class yet'
    };
  }
  
  return {
    average: parseFloat(result[0].class_average).toFixed(1),
    lowest: parseFloat(result[0].lowest_grade).toFixed(1),
    highest: parseFloat(result[0].highest_grade).toFixed(1),
    studentCount: result[0].student_count,
    totalGrades: result[0].total_grades
  };
}

/**
 * Query 4: Missing Work
 */
async function missingWorkQuery(entities, teacherId) {
  const { student, assignment } = entities;
  
  let sql = `
    SELECT 
      s.id,
      s.first_name,
      s.last_name,
      a.name as assignment_name,
      a.due_date
    FROM students s
    CROSS JOIN assignments a
    LEFT JOIN grades g ON s.id = g.student_id AND a.id = g.assignment_id AND g.teacher_id = ?
    WHERE a.teacher_id = ?
      AND g.grade IS NULL
  `;
  
  const params = [teacherId, teacherId];
  
  // Filter by student if specified
  if (student) {
    sql += ` AND s.id = ?`;
    params.push(student.id);
  }
  
  // Filter by assignment if specified
  if (assignment) {
    sql += ` AND a.id = ?`;
    params.push(assignment.id);
  }
  
  sql += ` ORDER BY a.due_date DESC, s.last_name, s.first_name LIMIT 50`;
  
  const [missing] = await db.query(sql, params);
  
  return {
    count: missing.length,
    missing: missing,
    studentName: student ? `${student.first_name} ${student.last_name}` : null,
    assignmentName: assignment ? assignment.name : null
  };
}

/**
 * Query 5: Assignment Analysis
 */
async function assignmentAnalysisQuery(entities, teacherId) {
  const { assignment } = entities;
  
  if (!assignment) {
    throw new Error('Assignment not specified');
  }
  
  const [grades] = await db.query(`
    SELECT 
      s.first_name,
      s.last_name,
      g.grade
    FROM grades g
    JOIN students s ON g.student_id = s.id
    WHERE g.assignment_id = ?
      AND g.teacher_id = ?
      AND g.grade IS NOT NULL
    ORDER BY g.grade DESC
  `, [assignment.id, teacherId]);
  
  const [stats] = await db.query(`
    SELECT 
      AVG(g.grade) as average,
      MIN(g.grade) as lowest,
      MAX(g.grade) as highest,
      COUNT(*) as graded_count,
      COUNT(CASE WHEN g.grade >= 60 THEN 1 END) as passed_count,
      COUNT(CASE WHEN g.grade < 60 THEN 1 END) as failed_count
    FROM grades g
    WHERE g.assignment_id = ?
      AND g.teacher_id = ?
      AND g.grade IS NOT NULL
  `, [assignment.id, teacherId]);
  
  return {
    assignmentName: assignment.name,
    maxPoints: assignment.max_points,
    dueDate: assignment.due_date,
    grades: grades,
    stats: stats[0]
  };
}

// Add to module.exports:
module.exports = {
  showGradesQuery,
  filterByStatusQuery,
  classAverageQuery,
  missingWorkQuery,           // NEW
  assignmentAnalysisQuery     // NEW
};
