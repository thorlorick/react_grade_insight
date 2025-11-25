// backend/src/services/rick/studentAnalyzer.js
const Fuse = require('fuse.js');

/**
 * Return only valid numeric grades
 */
function validGrades(records) {
  return records
    .map(r => Number(r.grade))
    .filter(n => !isNaN(n));
}

/**
 * Analyze a student's performance and return formatted text
 * @param {string} studentName
 * @param {Array} studentRecords - array of { assignment, grade }
 * @returns {string} - Formatted analysis text
 */
function analyzeStudentPerformance(studentName, studentRecords) {
  const normalizedRecords = studentRecords; // all belong to student

  if (normalizedRecords.length === 0) {
    return `No grades found for ${studentName}`;
  }

  // Extract valid numeric grades
  const grades = validGrades(normalizedRecords);

  if (grades.length === 0) {
    return `${studentName} has no completed assignments yet.`;
  }

  // Overall summary stats
  const average = grades.reduce((a, b) => a + b, 0) / grades.length;
  const highest = Math.max(...grades);
  const lowest = Math.min(...grades);
  const range = highest - lowest;

  // Categorize
  const categorizeAssignment = (name) => {
    const n = name.toLowerCase();
    if (n.match(/math|algebra|geometry|calculus|trigonometry|statistics|equation|formula/)) return 'Math';
    if (n.match(/science|biology|chemistry|physics|lab|experiment|hypothesis/)) return 'Science';
    if (n.match(/english|essay|writing|literature|reading|grammar|composition|poetry|novel/)) return 'English';
    if (n.match(/history|social studies|geography|civics|government|historical/)) return 'Social Studies';
    if (n.match(/project|presentation|research|portfolio/)) return 'Project';
    if (n.match(/test|quiz|exam|midterm|final/)) return 'Assessment';
    if (n.match(/homework|hw|assignment|practice/)) return 'Homework';
    return 'Other';
  };

  // Group by category
  const byCategory = {};
  normalizedRecords.forEach(r => {
    const cat = categorizeAssignment(r.assignment);
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r);
  });

  // Category summaries
  const categoryStats = Object.entries(byCategory).map(([cat, records]) => {
    const catGrades = validGrades(records);
    const avg = catGrades.length > 0
      ? catGrades.reduce((a, b) => a + b, 0) / catGrades.length
      : 0;
    return { category: cat, average: avg, count: catGrades.length, records };
  }).sort((a, b) => b.average - a.average);

  const strongest = categoryStats[0];
  const weakest = categoryStats[categoryStats.length - 1];

  // Standard deviation (with valid numbers only)
  const variance = grades.reduce((sum, g) => sum + Math.pow(g - average, 2), 0) / grades.length;
  const stdDev = Math.sqrt(variance);

  // ===== BUILD RESPONSE =====
  let response = `**${studentName}**\n`;
  response += `Average: ${average.toFixed(1)}% (${grades.length} graded assignment${grades.length > 1 ? 's' : ''})\n`;
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

    if (strongest.count > 0) {
      response += `✅ Strongest: ${strongest.category} (${strongest.average.toFixed(1)}%)\n`;
    }

    if (strongest.average - weakest.average > 10) {
      response += `⚠️ Needs support: ${weakest.category} (${weakest.average.toFixed(1)}%)\n`;
    }

    response += '\n**Breakdown:**\n';
    categoryStats.forEach(c => {
      const emoji =
        c.average >= 80 ? '✅' :
        c.average >= 70 ? '📊' :
        '⚠️';
      response += `  ${emoji} ${c.category}: ${c.average.toFixed(1)}% (${c.count} graded)\n`;
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

module.exports = {
  analyzeStudentPerformance
};
