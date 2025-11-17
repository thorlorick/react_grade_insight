// backend/src/services/rick/formatters.js

console.log("FORMATTERS LOADED", new Date().toISOString());

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

  return `**Class Average**\n` +
         `Overall Average: ${result.average}%\n` +
         `Assignments Counted: ${result.count}`;
}
  
 /**
 * Format missing work results
 */
function formatMissingWork(result) {
  if (result.count === 0) {
    return result.studentName 
      ? `${result.studentName} has no missing work! ✅`
      : result.assignmentName
        ? `No students are missing ${result.assignmentName}! ✅`
        : 'No missing work found! ✅';
  }
  
  // Group by student
  const byStudent = {};
  result.missing.forEach(m => {
    const key = `${m.first_name} ${m.last_name}`;
    if (!byStudent[key]) byStudent[key] = [];
    byStudent[key].push(m.assignment_name);
  });
  
  const list = Object.entries(byStudent).map(([name, assignments]) => 
    `  • ${name}: ${assignments.length} missing (${assignments.slice(0, 3).join(', ')}${assignments.length > 3 ? '...' : ''})`
  ).join('\n');
  
  return `**Missing Work**\n` +
         `${result.count} missing assignment${result.count === 1 ? '' : 's'} found:\n\n` +
         list;
}

/**
 * Format assignment analysis
 */
function formatAssignmentAnalysis(result) {
  const stats = result.stats;
  const passRate = stats.graded_count > 0 
    ? ((stats.passed_count / stats.graded_count) * 100).toFixed(0)
    : 0;
  
  return `**${result.assignmentName}**\n` +
         `Due: ${result.dueDate ? new Date(result.dueDate).toLocaleDateString() : 'N/A'}\n` +
         `Max Points: ${result.maxPoints || 'N/A'}\n\n` +
         `📊 Average: ${parseFloat(stats.average).toFixed(1)}%\n` +
         `📈 Highest: ${stats.highest}%\n` +
         `📉 Lowest: ${stats.lowest}%\n` +
         `✅ Pass Rate: ${passRate}% (${stats.passed_count}/${stats.graded_count})\n\n` +
         `${stats.graded_count} students graded`;
}

// Add to module.exports:
module.exports = {
  formatGradesList,
  formatStudentList,
  formatClassAverage,
  formatMissingWork,           // NEW
  formatAssignmentAnalysis     // NEW
};
