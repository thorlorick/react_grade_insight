// backend/src/utils/gradeUtils.js

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
 * @param {Array} records - Array of objects with .grade property
 * @returns {Array} - Array of valid numeric grades
 */
function validGrades(records) {
  return records
    .map(r => parseGrade(r.grade))
    .filter(n => !Number.isNaN(n));
}

/**
 * Categorize assignments by subject/type using keyword matching
 * @param {string} assignmentName - Name of the assignment
 * @returns {string} - Category name
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

  if (name.match(/french|français|vocab|vocabulary|verbe|verb|conjugation|conjugaison|lecture|écriture|dictée/)) {
    return 'French';
  }
  /*
  if (name.match(/project|presentation|research|portfolio|profile|instagram/)) {
    return 'Project';
  }
  
  if (name.match(/test|quiz|exam|midterm|final/)) {
    return 'Assessment';
  }

  */
  if (name.match(/homework|hw|practice|exit|ticket/)) {
    return 'Homework';
  }
  
  
  return 'Other';
}

/**
 * Calculate basic statistics for an array of grades
 * @param {Array} grades - Array of numeric grades
 * @returns {Object} - Stats object with average, min, max, stdDev
 */
function calculateStats(grades) {
  if (!grades || grades.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      count: 0,
      stdDev: 0
    };
  }

  const average = grades.reduce((a, b) => a + b, 0) / grades.length;
  const min = Math.min(...grades);
  const max = Math.max(...grades);
  
  // Standard deviation
  const variance = grades.reduce((sum, g) => sum + Math.pow(g - average, 2), 0) / grades.length;
  const stdDev = Math.sqrt(variance);

  return {
    average: parseFloat(average.toFixed(1)),
    min,
    max,
    count: grades.length,
    stdDev: parseFloat(stdDev.toFixed(1))
  };
}

/**
 * Group records by category and calculate stats for each
 * @param {Array} records - Array of objects with .assignment and .grade properties
 * @returns {Array} - Array of category stats objects
 */
function groupByCategory(records) {
  const byCategory = {};
  
  records.forEach(r => {
    const cat = categorizeAssignment(r.assignment || r.assignment_name);
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r);
  });

  // Calculate stats for each category (only graded items)
  const categoryStats = Object.entries(byCategory).map(([category, catRecords]) => {
    const catGrades = validGrades(catRecords);
    const stats = calculateStats(catGrades);
    
    return {
      category,
      ...stats,
      records: catRecords
    };
  }).sort((a, b) => b.average - a.average);

  return categoryStats;
}

module.exports = {
  parseGrade,
  validGrades,
  categorizeAssignment,
  calculateStats,
  groupByCategory
};
