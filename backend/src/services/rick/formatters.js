// backend/src/services/rick/formatters.js

/**
 * Format grades list for a student
 */
function formatGradesList(result) {
  if (!result.grades || result.grades.length === 0) {
    return result.message || 'No grades found';
  }
  
  const gradesList = result.grades.map(g => 
    `  • ${g.assignment_name}: ${g.grade}%`
  ).join('\n');
  
  return `**${result.studentName}**\n` +
         `Average: ${result.average}% (${result.count} assignments)\n\n` +
         `Recent grades:\n${gradesList}`;
}

/**
 * Format student list by status
 */
function formatStudentList(result) {
  if (result.count === 0) {
    return `No students are currently ${result.status}.`;
  }
  
  const studentsList = result.students.map(s => 
    `  • ${s.first_name} ${s.last_name}: ${parseFloat(s.avg_grade).toFixed(1)}% (${s.assignment_count} assignments)`
  ).join('\n');
  
  return `**Students ${result.status}** (below ${result.threshold}%):\n` +
         `Found ${result.count} student${result.count === 1 ? '' : 's'}:\n\n` +
         studentsList;
}

/**
 * Format class average statistics
 */
function formatClassAverage(result) {
  if (result.message) {
    return result.message;
  }
  
  return `**Class Performance Summary**\n\n` +
         `📊 Average: ${result.average}%\n` +
         `📈 Highest: ${result.highest}%\n` +
         `📉 Lowest: ${result.lowest}%\n\n` +
         `👥 ${result.studentCount} students • ${result.totalGrades} total grades`;
}

module.exports = {
  formatGradesList,
  formatStudentList,
  formatClassAverage
};
