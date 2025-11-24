// backend/src/services/rick/studentAnalyzer.js
const Fuse = require('fuse.js');

/**
 * Analyze a student's performance
 * @param {string} studentName
 * @param {Array} studentRecords - array of { assignment, grade }
 */
function analyzeStudentPerformance(studentName, studentRecords) {
  const normalizedRecords = studentRecords; // all records already belong to student
if (normalizedRecords.length === 0) return null;

  const grades = normalizedRecords.map(r => r.grade);
  const average = grades.reduce((a, b) => a + b, 0) / grades.length;
  const highest = Math.max(...grades);
  const lowest = Math.min(...grades);
  const range = highest - lowest;

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

  const byCategory = {};
  normalizedRecords.forEach(r => {
    const cat = categorizeAssignment(r.assignment);
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r);
  });

  const categoryStats = Object.entries(byCategory).map(([cat, records]) => {
    const catGrades = records.map(r => r.grade);
    const avg = catGrades.reduce((a, b) => a + b, 0) / catGrades.length;
    return { category: cat, average: avg, count: records.length, grades: catGrades, records };
  }).sort((a,b) => b.average - a.average);

  const strongest = categoryStats[0];
  const weakest = categoryStats[categoryStats.length - 1];

  const variance = grades.reduce((sum, g) => sum + Math.pow(g - average, 2), 0) / grades.length;
  const stdDev = Math.sqrt(variance);

  let summary = `${studentName} has completed ${normalizedRecords.length} assignment${normalizedRecords.length > 1 ? 's' : ''} with an overall average of ${average.toFixed(1)}%. `;
  
  if (average >= 90) summary += 'They are performing at an excellent level. ';
  else if (average >= 80) summary += 'They are performing at a strong level. ';
  else if (average >= 70) summary += 'They are performing at a satisfactory level. ';
  else if (average >= 60) summary += 'They are passing but could use support. ';
  else summary += 'They are struggling and may need additional support. ';

  if (categoryStats.length > 1) {
    summary += `Looking at different areas: `;
    if (strongest.count > 0) summary += `${studentName} excels in ${strongest.category} work (${strongest.average.toFixed(1)}%). `;
    if (strongest.average - weakest.average > 10) summary += `However, ${weakest.category} assignments are more challenging (${weakest.average.toFixed(1)}%). `;
    summary += `Breakdown by type: ${categoryStats.map(c => `${c.category} (${c.average.toFixed(1)}%)`).join(', ')}. `;
  }

  if (stdDev < 5) summary += `${studentName} demonstrates very consistent work quality. `;
  else if (range > 20) summary += `Performance varies notably (${lowest}% to ${highest}%). `;
  else summary += `Work shows moderate variation across assignments. `;

  return {
    name: studentName,
    average: average.toFixed(1),
    highest,
    lowest,
    totalAssignments: normalizedRecords.length,
    categoryStats,
    records: normalizedRecords,
    summary
  };
}

module.exports = {
  analyzeStudentPerformance
};
