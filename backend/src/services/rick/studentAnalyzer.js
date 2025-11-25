// backend/src/services/rick/studentAnalyzer.js

/**
 * Parse a raw grade value to a Number or return NaN for "missing"/invalid.
 * Rules:
 *  - null / undefined => NaN (missing)
 *  - empty string or whitespace-only => NaN (missing)
 *  - numeric string (including "0") => Number(n)
 *  - number 0 => 0 (kept as valid grade)
 *  - anything non-numeric => NaN
 */
function parseGrade(raw) {
  // Explicit null/undefined check
  if (raw === null || raw === undefined) return NaN;

  // If it's a string, check for empty or whitespace-only
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    // Empty string after trimming = missing grade
    if (trimmed === '') return NaN;
    
    // Try to parse the trimmed string
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : NaN;
  }

  // If it's already a number, use it directly
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : NaN;
  }

  // Anything else (objects, arrays, etc.) is invalid
  return NaN;
}

/**
 * Return only valid numeric grades (0 allowed). Uses parseGrade.
 */
function validGrades(records) {
  return records
    .map(r => parseGrade(r.grade))
    .filter(n => !Number.isNaN(n));
}

/**
 * Categorize assignments by subject/type using keyword matching
 */
function categorizeAssignment(assignmentName) {
  const name = (assignmentName || '').toLowerCase();
  
  if (name.match(/math|algebra|geometry|calculus|trigonometry|statistics|equation|formula|number|decimal|fraction/)) {
    return 'Math';
  }
  
  if (name.match(/science|biology|chemistry|physics|lab|experiment|hypothesis/)) {
    return 'Science';
  }
  
  if (name.match(/english|essay|writing|literature|reading|grammar|composition|poetry|novel|language|capitalization|comma|colon|semi-colon/)) {
    return 'English';
  }
  
  if (name.match(/history|social studies|geography|civics|government|historical/)) {
    return 'Social Studies';
  }
  
  if (name.match(/project|presentation|research|portfolio|profile|instagram/)) {
    return 'Project';
  }
  
  if (name.match(/test|quiz|exam|midterm|final/)) {
    return 'Assessment';
  }
  
  if (name.match(/homework|hw|assignment|practice|exit|ticket/)) {
    return 'Homework';
  }
  
  return 'Other';
}

/**
 * Analyze a student's performance and return formatted text
 * @param {string} studentName
 * @param {Array} studentRecords - array of { assignment, grade } OR { name, assignment, grade }
 * @returns {string} - Formatted analysis text
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

  // Overall summary stats - ONLY uses valid grades
  const average = grades.reduce((a, b) => a + b, 0) / grades.length;
  const highest = Math.max(...grades);
  const lowest = Math.min(...grades);
  const range = highest - lowest;

  console.log('Calculated average:', average);

  // Group by category
  const byCategory = {};
  records.forEach(r => {
    const cat = categorizeAssignment(r.assignment);
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r);
  });

  // Category summaries - ONLY count graded items
  const categoryStats = Object.entries(byCategory).map(([cat, catRecords]) => {
    const catGrades = validGrades(catRecords);
    const avg = catGrades.length > 0
      ? catGrades.reduce((a, b) => a + b, 0) / catGrades.length
      : 0;
    return { category: cat, average: avg, count: catGrades.length, records: catRecords };
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

    if (strongest && strongest.count > 0) {
      response += `✅ Strongest: ${strongest.category} (${strongest.average.toFixed(1)}%)\n`;
    }

    if (strongest && weakest && (strongest.average - weakest.average > 10)) {
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
  analyzeStudentPerformance,
  parseGrade,
  validGrades,
  categorizeAssignment
};
