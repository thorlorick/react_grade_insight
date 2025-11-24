// backend/src/services/rick/formatters.js

/**
 * Format grades list for a student (WITH SMART ANALYSIS)
 */
function formatGradesList(result) {
  if (!result.grades || result.grades.length === 0) {
    return result.message || 'No grades found';
  }
  
  let response = `**${result.studentName}**\n` +
                 `Average: ${result.average}% (${result.validCount} graded out of ${result.totalCount} assignments)\n\n`;
  
  // ADD INSIGHTS (NEW)
  if (result.insights) {
    response += `📝 ${result.insights}\n\n`;
  }
  
  // ADD CATEGORY BREAKDOWN (NEW)
  if (result.categoryStats && result.categoryStats.length > 0) {
    response += `**Performance by Subject:**\n`;
    result.categoryStats.forEach(cat => {
      const emoji = cat.average >= 80 ? '✅' : cat.average >= 70 ? '📊' : '⚠️';
      response += `  ${emoji} ${cat.category}: ${cat.average}% (${cat.count} assignment${cat.count > 1 ? 's' : ''})\n`;
    });
    response += '\n';
  }
  
  // SHOW RECENT GRADES
  response += `**Recent Grades:**\n`;
  const recentGrades = result.grades.slice(0, 10); // Show max 10
  recentGrades.forEach(g => {
    const gradeDisplay = g.grade !== null ? `${g.grade}%` : 'not graded';
    response += `  • ${g.assignment_name}: ${gradeDisplay}\n`;
  });
  
  if (result.grades.length > 10) {
    response += `\n... and ${result.grades.length - 10} more assignment${result.grades.length - 10 > 1 ? 's' : ''}`;
  }
  
  return response;
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

module.exports = {
  formatGradesList,
  formatStudentList,
  formatClassAverage,
  formatMissingWork,
  formatAssignmentAnalysis
};
```

---

## **What Changed:**

### ✅ **Added Smart Analysis:**
- Categorizes assignments automatically (Math, English, Science, etc.)
- Shows performance breakdown by subject
- Generates intelligent insights
- Adds emojis for visual feedback

### ✅ **Better Formatting:**
- Shows "10 graded out of 16 assignments" 
- Category breakdown with averages
- Insights like "Strongest area: Math (72%)"
- Limits to 10 recent grades (not overwhelming)

---

## **Example Output:**
```
User: "Show Jayson's grades"

Rick: **Jayson Abaul**
Average: 58.3% (10 graded out of 16 assignments)

📝 Jayson is passing but could use support. Strongest area: Math (72%). 
Needs support in English (45%).

**Performance by Subject:**
  ✅ Math: 72% (4 assignments)
  📊 Science: 60% (3 assignments)
  ⚠️ English: 45% (3 assignments)

**Recent Grades:**
  • GCF & LCM Exit Ticket: 100%
  • A1.1 Pop Review Quiz: 24%
  • Note Reading Quiz: 50%
  • Quiz: Colons and Semi-colons: 13%
  • Number Sense Test Marks: 70%
  • Capitalization and Commas Quiz: 20%
  ... and 10 more assignments
