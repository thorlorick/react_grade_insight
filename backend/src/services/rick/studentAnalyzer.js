// backend/src/services/rick/studentAnalyzer.js

const { validGrades, calculateStats, groupByCategory } = require('../../utils/gradeUtils');

/**
 * Analyze a student's performance and return formatted intelligence
 * @param {string} studentName - Student's full name
 * @param {Array} studentRecords - Array of { assignment, grade } or { name, assignment, grade }
 * @returns {string} - Formatted analysis text with intelligence
 */
function analyzeStudentPerformance(studentName, studentRecords) {
  const normalizedRecords = studentRecords || [];

  console.log('=== STUDENT ANALYZER DEBUG ===');
  console.log('Student:', studentName);
  console.log('Total records received:', normalizedRecords.length);
  console.log('First record sample:', normalizedRecords[0]);

  if (normalizedRecords.length === 0) {
    return `No grades found for ${studentName}`;
  }

  // Normalize the record format - handle both 'assignment' and 'name' fields
  const records = normalizedRecords.map(r => ({
    assignment: r.assignment || r.assignment_name || r.name || 'Unknown',
    grade: r.grade
  }));

  console.log('Normalized first record:', records[0]);

  // Extract valid numeric grades (zeros count, empty strings/nulls do not)
  const grades = validGrades(records);

  console.log('Valid grades found:', grades.length);
  console.log('Valid grades:', grades);

  if (grades.length === 0) {
    return `${studentName} has no completed assignments yet.`;
  }

  // Calculate overall statistics using utility
  const stats = calculateStats(grades);
  const { average, min: lowest, max: highest, stdDev } = stats;
  const range = highest - lowest;

  console.log('Calculated average:', average);

  // Group by category and get stats
  const categoryStats = groupByCategory(records);
  const strongest = categoryStats[0];
  const weakest = categoryStats[categoryStats.length - 1];

  // ===== BUILD RESPONSE =====
  let response = `**${studentName}**\n`;
  response += `Average: ${average}% (${grades.length} graded assignment${grades.length > 1 ? 's' : ''})\n`;
  response += `Range: ${lowest}% - ${highest}%\n\n`;

  // Performance level
  if (average >= 90) response += '📊 Performing at an excellent level. ';
  else if (average >= 80) response += '📊 Performing at a strong level. ';
  else if (average >= 70) response += '📊 Performing at a satisfactory level. ';
  else if (average >= 60) response += '📊 Passing but could use support. ';
  else response += '📊 May need additional support. ';

  // Category breakdown
  if (categoryStats.length > 1) {
    response += '\n\n**Performance by Subject:**\n';

    if (strongest && strongest.count > 0) {
      response += `✅ Strongest: ${strongest.category} (${strongest.average}%)\n`;
    }

    if (strongest && weakest && (strongest.average - weakest.average > 10)) {
      response += `⚠️ Needs support: ${weakest.category} (${weakest.average}%)\n`;
    }

    response += '\n**Breakdown:**\n';
    categoryStats.forEach(c => {
      const emoji =
        c.average >= 80 ? '✅' :
        c.average >= 70 ? '📊' :
        '⚠️';
      response += `  ${emoji} ${c.category}: ${c.average}% (${c.count} graded)\n`;
    });
  }

  // Consistency comment
  response += '\n';
  if (stdDev < 5) {
    response += '✨ Very consistent work quality across all assignments.';
  } else if (range > 20) {
    response += `📉 Performance varies notably (${lowest}% to ${highest}%).`;
  } else {
    response += '📊 Moderate variation across assignments.';
  }

  return response;
}

/**
 * Get structured data for a student (for other analyzers to use)
 * @param {string} studentName - Student's full name
 * @param {Array} studentRecords - Array of grade records
 * @returns {Object} - Structured performance data
 */
function getStudentData(studentName, studentRecords) {
  const normalizedRecords = (studentRecords || []).map(r => ({
    assignment: r.assignment || r.assignment_name || r.name || 'Unknown',
    grade: r.grade
  }));

  if (normalizedRecords.length === 0) {
    return {
      studentName,
      average: 0,
      graded: 0,
      categoryStats: [],
      stats: { average: 0, min: 0, max: 0, count: 0, stdDev: 0 }
    };
  }

  const grades = validGrades(normalizedRecords);
  const stats = calculateStats(grades);
  const categoryStats = groupByCategory(normalizedRecords);
  
  return {
    studentName,
    average: stats.average,
    graded: grades.length,
    total: normalizedRecords.length,
    missing: normalizedRecords.length - grades.length,
    categoryStats,
    stats,
    strongest: categoryStats[0] || null,
    weakest: categoryStats[categoryStats.length - 1] || null
  };
}

module.exports = {
  analyzeStudentPerformance,
  getStudentData
};
