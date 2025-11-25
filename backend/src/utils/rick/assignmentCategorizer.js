// backend/src/utils/rick/assignmentCategorizer.js
// This file now just re-exports from studentAnalyzer for backwards compatibility

const {
  parseGrade,
  categorizeAssignment,
  analyzeStudentPerformance
} = require('../../services/rick/studentAnalyzer');

// Keep old function names for backwards compatibility
function analyzeByCategory(grades) {
  const byCategory = {};
  
  grades.forEach(grade => {
    const parsedGrade = parseGrade(grade.grade);
    if (Number.isNaN(parsedGrade)) return;
    
    const category = categorizeAssignment(grade.assignment_name);
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(parsedGrade);
  });
  
  const categoryStats = Object.entries(byCategory).map(([category, gradeValues]) => {
    const avg = gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length;
    return {
      category,
      average: parseFloat(avg.toFixed(1)),
      count: gradeValues.length,
      highest: Math.max(...gradeValues),
      lowest: Math.min(...gradeValues)
    };
  }).sort((a, b) => b.average - a.average);
  
  return categoryStats;
}

function generateInsights(studentName, average, categoryStats) {
  if (categoryStats.length === 0) return '';
  
  let insights = '';
  
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
  parseGrade
};
