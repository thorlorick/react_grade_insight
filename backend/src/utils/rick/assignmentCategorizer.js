// backend/src/utils/rick/assignmentCategorizer.js

/**
 * Categorize assignments by subject/type using keyword matching
 */
function categorizeAssignment(assignmentName) {
  const name = assignmentName.toLowerCase();
  
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
 */
function analyzeByCategory(grades) {
  // Group by category
  const byCategory = {};
  
  grades.forEach(grade => {
    if (grade.grade === null || grade.grade === undefined) return; // Skip ungraded
    
    const category = categorizeAssignment(grade.assignment_name);
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(parseFloat(grade.grade));
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
  generateInsights
};
