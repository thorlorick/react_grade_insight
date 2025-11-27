// backend/src/services/rick/populationAnalyzer.js

const { calculateStats, validGrades } = require('../../utils/gradeUtils');
const { pool: db } = require('../../db');

/**
 * Get overall statistics for all of a teacher's students
 * @param {number} teacherId - Teacher ID
 * @returns {Object} - Population statistics
 */
async function getPopulationStats(teacherId) {
  // Get all graded work for this teacher
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
    WHERE g.teacher_id = ?
      AND g.grade IS NOT NULL
  `, [teacherId]);

  // Get student count
  const [studentCount] = await db.query(`
    SELECT COUNT(DISTINCT student_id) as total
    FROM grades
    WHERE teacher_id = ?
  `, [teacherId]);

  // Get assignment count
  const [assignmentCount] = await db.query(`
    SELECT COUNT(DISTINCT assignment_id) as total
    FROM grades
    WHERE teacher_id = ?
  `, [teacherId]);

  const percentages = grades.map(g => g.percentage);
  const stats = calculateStats(percentages);

  return {
    ...stats,
    totalStudents: studentCount[0].total,
    totalAssignments: assignmentCount[0].total,
    totalGrades: grades.length
  };
}

/**
 * Find students who are at risk (below threshold)
 * @param {number} teacherId - Teacher ID
 * @param {number} threshold - At-risk threshold (default 60%)
 * @returns {Object} - At-risk students with analysis
 */
async function findAtRiskStudents(teacherId, threshold = 60) {
  // Get each student's average
  const [studentAverages] = await db.query(`
    SELECT 
      s.id,
      s.first_name,
      s.last_name,
      COUNT(g.id) as total_assignments,
      SUM(CASE WHEN g.grade IS NULL THEN 1 ELSE 0 END) as missing_count,
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
    HAVING average_percentage < ?
    ORDER BY average_percentage ASC
  `, [teacherId, threshold]);

  const atRiskCount = studentAverages.length;

  // Get total student count for context
  const [totalResult] = await db.query(`
    SELECT COUNT(DISTINCT student_id) as total
    FROM grades
    WHERE teacher_id = ?
  `, [teacherId]);

  const totalStudents = totalResult[0].total;
  const atRiskRate = totalStudents > 0 ? (atRiskCount / totalStudents * 100).toFixed(1) : 0;

  // Build response
  let response = `**At-Risk Students (Below ${threshold}%)**\n\n`;
  
  if (atRiskCount === 0) {
    response += `✅ No students are currently below ${threshold}%. Great job!`;
    return {
      success: true,
      atRiskCount: 0,
      totalStudents,
      atRiskRate: 0,
      threshold,
      analysis: response
    };
  }

  response += `⚠️ ${atRiskCount} of ${totalStudents} students (${atRiskRate}%) are below ${threshold}%.\n\n`;

  response += `**Students needing support:**\n`;
  studentAverages.forEach(s => {
    const avg = s.average_percentage ? parseFloat(s.average_percentage).toFixed(1) : 0;
    const missingInfo = s.missing_count > 0 ? ` (${s.missing_count} missing)` : '';
    response += `• ${s.first_name} ${s.last_name}: ${avg}%${missingInfo}\n`;
  });

  return {
    success: true,
    atRiskCount,
    totalStudents,
    atRiskRate: parseFloat(atRiskRate),
    threshold,
    students: studentAverages,
    analysis: response
  };
}

/**
 * Find students with chronic missing work patterns
 * @param {number} teacherId - Teacher ID
 * @param {number} minMissing - Minimum missing assignments to flag (default 3)
 * @returns {Object} - Students with missing work patterns
 */
async function findChronicMissingWork(teacherId, minMissing = 3) {
  const [students] = await db.query(`
    SELECT 
      s.id,
      s.first_name,
      s.last_name,
      COUNT(g.id) as total_assignments,
      SUM(CASE WHEN g.grade IS NULL THEN 1 ELSE 0 END) as missing_count,
      ROUND(
        (SUM(CASE WHEN g.grade IS NULL THEN 1 ELSE 0 END) / COUNT(g.id)) * 100, 
        1
      ) as missing_rate
    FROM students s
    JOIN grades g ON s.id = g.student_id
    WHERE g.teacher_id = ?
    GROUP BY s.id, s.first_name, s.last_name
    HAVING missing_count >= ?
    ORDER BY missing_count DESC, missing_rate DESC
  `, [teacherId, minMissing]);

  const flaggedCount = students.length;

  // Build response
  let response = `**Chronic Missing Work (${minMissing}+ missing assignments)**\n\n`;
  
  if (flaggedCount === 0) {
    response += `✅ No students have ${minMissing}+ missing assignments.`;
    return {
      success: true,
      flaggedCount: 0,
      minMissing,
      analysis: response
    };
  }

  response += `📋 ${flaggedCount} student${flaggedCount > 1 ? 's' : ''} with chronic missing work:\n\n`;

  students.forEach(s => {
    response += `• ${s.first_name} ${s.last_name}: ${s.missing_count} missing (${s.missing_rate}% of assignments)\n`;
  });

  response += `\n💡 Consider reaching out to discuss barriers to completion.`;

  return {
    success: true,
    flaggedCount,
    minMissing,
    students,
    analysis: response
  };
}

/**
 * Get student's performance relative to population
 * @param {number} studentId - Student ID
 * @param {number} teacherId - Teacher ID
 * @returns {Object} - Comparison data
 */
async function compareToPopulation(studentId, teacherId) {
  // Get student's average
  const [studentData] = await db.query(`
    SELECT 
      AVG(
        CASE 
          WHEN g.grade IS NOT NULL AND a.max_points > 0 
          THEN (g.grade / a.max_points) * 100
          WHEN g.grade IS NOT NULL
          THEN g.grade
          ELSE NULL
        END
      ) as student_average
    FROM grades g
    JOIN assignments a ON g.assignment_id = a.id
    WHERE g.student_id = ? AND g.teacher_id = ? AND g.grade IS NOT NULL
  `, [studentId, teacherId]);

  // Get population stats
  const popStats = await getPopulationStats(teacherId);

  const studentAvg = studentData[0].student_average || 0;
  const difference = (studentAvg - popStats.average).toFixed(1);
  const diffText = difference >= 0 ? `+${difference}` : difference;

  return {
    studentAverage: parseFloat(studentAvg.toFixed(1)),
    populationAverage: popStats.average,
    difference: parseFloat(difference),
    percentile: studentAvg > popStats.average ? 'above' : 'below',
    comparison: `${diffText}% relative to your overall average`
  };
}

module.exports = {
  getPopulationStats,
  findAtRiskStudents,
  findChronicMissingWork,
  compareToPopulation
};
