// backend/src/services/rick/queryBuilders.js
const db = require('../../config/database');

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
  
  // Calculate average
  const average = grades.reduce((sum, g) => sum + parseFloat(g.grade), 0) / grades.length;
  
  return {
    studentName: `${student.first_name} ${student.last_name}`,
    grades: grades,
    average: average.toFixed(1),
    count: grades.length
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

module.exports = {
  showGradesQuery,
  filterByStatusQuery,
  classAverageQuery
};
