const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config(); // load env variables

// Minimum percent of filled grades required to keep an assignment
const MIN_FILLED_PERCENT = process.env.MIN_FILLED_PERCENT
  ? Number(process.env.MIN_FILLED_PERCENT)
  : 0.4; // default 40%

/**
 * Parse CSV into assignments and students
 * CSV format:
 * last_name,first_name,email,Math Test,Essay 1,Science Lab
 * DATE,-,-,2025-06-01,2025-06-03,2025-06-05
 * POINTS,-,-,100,98,10
 */
async function parseTemplate(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', row => rows.push(row))
      .on('end', () => {
        if (rows.length < 3) return reject(new Error('CSV must have at least 3 rows'));

        const headers = Object.keys(rows[0]);
        const assignmentNames = headers.slice(3);

        // Fix: csv-parser treats first row as headers, so:
        // rows[0] = DATE row
        // rows[1] = POINTS row  
        // rows[2+] = student data
        const dateRow = rows[0];
        const pointsRow = rows[1];

        // Build assignments array
        const assignments = assignmentNames.map(name => {
          let dateVal = dateRow[name]?.trim() || null;
          if (!dateVal || dateVal === '-' || !/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
            dateVal = null;
          }

          let pointsVal = Number(pointsRow[name]);
          if (!Number.isFinite(pointsVal)) pointsVal = null;

          return {
            name,
            date: dateVal,
            max_points: pointsVal,
          };
        });

        // Parse student rows (start from index 2)
        const studentRows = rows.slice(2);
        const students = studentRows.map(r => ({
          last_name: r['last_name'],
          first_name: r['first_name'],
          email: r['email'],
          grades: assignmentNames.map(name => {
            const val = r[name]?.trim();
            const num = Number(val);
            return Number.isFinite(num) ? num : null;
          }),
        }));

        // Filter assignments with < MIN_FILLED_PERCENT filled grades
        const filteredAssignments = assignments.filter((assignment, index) => {
          const filledCount = students.filter(s => s.grades[index] !== null).length;
          const filledPercent = filledCount / students.length;
          if (filledPercent < MIN_FILLED_PERCENT) {
            console.log(`Skipping assignment "${assignment.name}" — only ${Math.round(filledPercent * 100)}% filled`);
            return false;
          }
          return true;
        });

        // Remove corresponding grades from students
        const filteredStudents = students.map(s => {
          return {
            ...s,
            grades: s.grades.filter((_, i) => filteredAssignments.includes(assignments[i])),
          };
        });

        resolve({ assignments: filteredAssignments, students: filteredStudents });
      })
      .on('error', err => reject(err));
  });
}

module.exports = { parseTemplate };