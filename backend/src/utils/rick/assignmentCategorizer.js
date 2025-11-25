// backend/src/utils/rick/assignmentCategorizer.js

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
 * Categorize assignments by subject/type using keyword matching
 */
function categorizeAssignment(assignmentName) {
  const name = (assignmentName || '').toLowerCase();
  
  // Math-related keywords
  if (name.match(/math|algebra|geometry|calculus|trigonometry|statistics|equation|formula|number|decimal|fraction/)) {
    return 'Math';
  }
  
  // Science keywords
  if (name.match(/science|biology|chemistry|physics|lab|experiment|hypothesis/)) {
    return 'Science';
  }
  
  // English/Language Arts
  if (name.match(/english|essay|writing|literature|reading|grammar|composition|poetry|novel|language|capitalization|comma|colon|semi-colon/)) {
    return 'English';
  }
  
  // History/Social Studies
  if (name.match(/history|social studies|geography|civics|government|historical/)) {
    return 'Social Studies';
  }
  
  // Project-based
  if (name.match(/project|presentation|research|portfolio|profile|instagram/)) {
    return 'Project';
  }
  
  // Tests/Quizzes
  if (name.match(/test|quiz|exam|midterm|final/)) {
    return 'Assessment';
  }
  
  // Homework
  if (name.match(/homework|hw|assignment|practice|exit|ticket/)) {
    return 'Homework';
  }
  
  return 'Other';
}

/**
 * Group grades by category and calculate stats
 * Now properly handles empty/missing grades
 */
function analyzeByCategory(grades) {
  // Group by category
  const byCategory = {};
  
  grades.forEach(grade => {
    // Use parseGrade to properly handle empty strings, null, undefined
    const parsedGrade = parseGrade(grade.grade);
    
    // Skip invalid/missing grades (NaN)
    if (Number.isNaN(parsedGrade)) return;
    
    const category = categorizeAssignment(grade.assignment_name);
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(parsedGrade);
  });
  
  // Calculate stats for each category
  const categoryStats = Object.entries(byCategory).map(([category, gradeValues]) => {
    const avg = gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length;
    return {
      category,
      average: parseFloat(avg.toFixed(1)),
      count: gradeValues.length,
      highest: Math.max(...gradeValues),
      lowest: Math.min(...gradeValues)
    };
  }).sort((a, b) => b.average - a.average); // Sort by average descending
  
  return categoryStats;
}

/**
 * Calculate overall average from grades, excluding empty/missing grades
 */
function calculateAverage(grades) {
  const validGrades = grades
    .map(g => parseGrade(g.grade))
    .filter(n => !Number.isNaN(n));
  
  if (validGrades.length === 0) return 0;
  
  return validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
}

/**
 * Generate insight text about performance
 */
function generateInsights(studentName, average, categoryStats) {
  if (categoryStats.length === 0) {
    return '';
  }
  
  let insights = '';
  
  // Overall performance level
  if (average >= 90) {
    insights += `${studentName} is performing at an excellent level. `;
  } else if (average >= 80) {
    insights += `${studentName} is performing at a strong level. `;
  } else if (average >= 70) {
    insights += `${studentName} is performing at a satisfactory level. `;
  } else if (average >= 60) {
    insights += `${studentName} is passing but could use support. `;
  } else {
    insights += `${studentName} may need additional support. `;
  }
  
  // Subject strengths/weaknesses (if multiple categories)
  if (categoryStats.length > 1) {
    const strongest = categoryStats[0];
    const weakest = categoryStats[categoryStats.length - 1];
    
    insights += `Strongest area: ${strongest.category} (${strongest.average}%). `;
    
    if (strongest.average - weakest.average > 10) {
      insights += `Needs support in ${weakest.category} (${weakest.average}%). `;
    }
  }
  
  return insights;
}

module.exports = {
  categorizeAssignment,
  analyzeByCategory,
  generateInsights,
  calculateAverage,
  parseGrade
};
