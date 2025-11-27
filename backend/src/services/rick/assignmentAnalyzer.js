// backend/src/services/rick/assignmentAnalyzer.js

const { validGrades, calculateStats, parseGrade } = require('../../utils/gradeUtils');
const { pool: db } = require('../../db');

/**
 * Analyze who didn't submit a specific assignment
 * @param {number} assignmentId - Assignment ID
 * @param {number} teacherId - Teacher ID
 * @returns {Object} - Analysis with students who didn't submit
 */
async function analyzeMissingWork(assignmentId, teacherId) {
  // Get assignment info
  const [assignments] = await db.query(`
    SELECT id, name, due_date, max_points
    FROM assignments
    WHERE id = ? AND teacher_id = ?
  `, [assignmentId, teacherId]);

  if (assignments.length === 0) {
    throw new Error('Assignment not found');
  }

  const assignment = assignments[0];

  // Get all students who have NULL grade for this assignment
  const [missingStudents] = await db.query(`
    SELECT s.id, s.first_name, s.last_name
    FROM grades g
    JOIN students s ON g.student_id = s.id
    WHERE g.assignment_id = ?
      AND g.teacher_id = ?
      AND g.grade IS NULL
    ORDER BY s.last_name, s.first_name
  `, [assignmentId, teacherId]);

  // Get total students who have this assignment in grade book
  const [totalResult] = await db.query(`
    SELECT COUNT(DISTINCT student_id) as total
    FROM grades
    WHERE assignment_id = ? AND teacher_id = ?
  `, [assignmentId, teacherId]);

  const totalStudents = totalResult[0].total;
  const missingCount = missingStudents.length;
  const submittedCount = totalStudents - missingCount;
  const missingRate = totalStudents > 0 ? (missingCount / totalStudents * 100).toFixed(1) : 0;

  // Build response
  let response = `**Missing Work: ${assignment.name}**\n\n`;
  
  if (missingCount === 0) {
    response += '✅ All students have submitted this assignment!';
    return {
      success: true,
      assignmentName: assignment.name,
      missingCount: 0,
      totalStudents,
      missingRate: 0,
      analysis: response
    };
  }

  response += `📋 ${missingCount} of ${totalStudents} students (${missingRate}%) have not submitted.\n\n`;

  // Flag if unusually high
  if (missingRate > 30) {
    response += `⚠️ High missing rate - consider checking if assignment was clearly communicated.\n\n`;
  }

  response += `**Students with missing work:**\n`;
  missingStudents.forEach(s => {
    response += `• ${s.first_name} ${s.last_name}\n`;
  });

  return {
    success: true,
    assignmentName: assignment.name,
    missingCount,
    totalStudents,
    submittedCount,
    missingRate: parseFloat(missingRate),
    students: missingStudents,
    analysis: response
  };
}

/**
 * Analyze who failed a specific assignment
 * @param {number} assignmentId - Assignment ID
 * @param {number} teacherId - Teacher ID
 * @param {number} threshold - Failing threshold (default 60%)
 * @returns {Object} - Analysis with students who failed
 */
async function analyzeFailures(assignmentId, teacherId, threshold = 60) {
  // Get assignment info
  const [assignments] = await db.query(`
    SELECT id, name, due_date, max_points
    FROM assignments
    WHERE id = ? AND teacher_id = ?
  `, [assignmentId, teacherId]);

  if (assignments.length === 0) {
    throw new Error('Assignment not found');
  }

  const assignment = assignments[0];

  // Get all grades for this assignment (non-NULL only)
  const [allGrades] = await db.query(`
    SELECT 
      s.id,
      s.first_name, 
      s.last_name,
      g.grade,
      a.max_points,
      CASE 
        WHEN a.max_points > 0 THEN ROUND((g.grade / a.max_points) * 100, 1)
        ELSE g.grade
      END AS percentage
    FROM grades g
    JOIN students s ON g.student_id = s.id
    JOIN assignments a ON g.assignment_id = a.id
    WHERE g.assignment_id = ?
      AND g.teacher_id = ?
      AND g.grade IS NOT NULL
    ORDER BY percentage ASC
  `, [assignmentId, teacherId]);

  if (allGrades.length === 0) {
    return {
      success: true,
      assignmentName: assignment.name,
      failedCount: 0,
      totalGraded: 0,
      failureRate: 0,
      analysis: `**${assignment.name}**\n\nNo graded submissions yet.`
    };
  }

  // Filter failed students
  const failedStudents = allGrades.filter(g => g.percentage < threshold);
  const failedCount = failedStudents.length;
  const totalGraded = allGrades.length;
  const failureRate = (failedCount / totalGraded * 100).toFixed(1);

  // Calculate assignment statistics
  const percentages = allGrades.map(g => g.percentage);
  const stats = calculateStats(percentages);

  // Build response
  let response = `**Assignment Analysis: ${assignment.name}**\n\n`;
  response += `📊 Class Performance:\n`;
  response += `  Average: ${stats.average}%\n`;
  response += `  Range: ${stats.min}% - ${stats.max}%\n`;
  response += `  Graded: ${totalGraded} students\n\n`;

  if (failedCount === 0) {
    response += `✅ No students failed (below ${threshold}%). Great job!`;
    return {
      success: true,
      assignmentName: assignment.name,
      failedCount: 0,
      totalGraded,
      failureRate: 0,
      stats,
      analysis: response
    };
  }

  response += `❌ ${failedCount} of ${totalGraded} students (${failureRate}%) scored below ${threshold}%.\n\n`;

  // Intelligence: Is this assignment too hard?
  if (failureRate > 40) {
    response += `⚠️ High failure rate suggests this assignment may have been particularly challenging.\n\n`;
  } else if (failureRate < 15) {
    response += `ℹ️ Low failure rate - these students may need targeted intervention.\n\n`;
  }

  response += `**Students who failed:**\n`;
  failedStudents.forEach(s => {
    response += `• ${s.first_name} ${s.last_name}: ${s.percentage}%\n`;
  });

  return {
    success: true,
    assignmentName: assignment.name,
    failedCount,
    totalGraded,
    failureRate: parseFloat(failureRate),
    threshold,
    stats,
    students: failedStudents,
    analysis: response
  };
}

/**
 * Get assignment statistics (for other analyzers to use)
 * @param {number} assignmentId - Assignment ID
 * @param {number} teacherId - Teacher ID
 * @returns {Object} - Assignment statistics
 */
async function getAssignmentStats(assignmentId, teacherId) {
  const [grades] = await db.query(`
    SELECT 
      g.grade,
      a.max_points,
      CASE 
        WHEN a.max_points > 0 THEN ROUND((g.grade / a.max_points) * 100, 1)
        ELSE g.grade
      END AS percentage
    FROM grades g
    JOIN assignments a ON g.assignment_id = a.id
    WHERE g.assignment_id = ?
      AND g.teacher_id = ?
      AND g.grade IS NOT NULL
  `, [assignmentId, teacherId]);

  const percentages = grades.map(g => g.percentage);
  const stats = calculateStats(percentages);

  const [totalResult] = await db.query(`
    SELECT COUNT(*) as total
    FROM grades
    WHERE assignment_id = ? AND teacher_id = ?
  `, [assignmentId, teacherId]);

  return {
    ...stats,
    totalAssigned: totalResult[0].total,
    totalGraded: grades.length,
    missingCount: totalResult[0].total - grades.length
  };
}

module.exports = {
  analyzeMissingWork,
  analyzeFailures,
  getAssignmentStats
};
