// backend/src/csvParser.js
const fs = require('fs');
const csv = require('csv-parser');

/**
 * Parse CSV into assignments and students
 * CSV expected format:
 * last_name,first_name,email,Math Test,Essay 1,Science Lab
 * DATE,-,-,2025-06-01,2025-06-03,2025-06-05
 * POINTS,-,-,100,98,10
 * Smith,Alice,alice.smith@example.com,85,90,7
 */
async function parseTemplate(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', row => rows.push(row))
      .on('end', () => {
        if (rows.length < 3) return reject(new Error('CSV must have at least 3 rows'));

        // First row: headers (assignments start from index 3)
        const headers = Object.keys(rows[0]);
        const assignmentNames = headers.slice(3);

        // Second row: DATE
        const dateRow = rows[1];
        const assignmentDates = assignmentNames.map(name => dateRow[name]);

        // Third row: POINTS
        const pointsRow = rows[2];
        const assignmentPoints = assignmentNames.map(name => Number(pointsRow[name]));

        // Build assignments array
        const assignments = assignmentNames.map((name, idx) => ({
          name,
          date: assignmentDates[idx],
          max_points: assignmentPoints[idx],
        }));

        // Remaining rows: students
        const studentRows = rows.slice(3);
        const students = studentRows.map(r => ({
          last_name: r['last_name'],
          first_name: r['first_name'],
          email: r['email'],
          grades: assignmentNames.map(name => Number(r[name]))
        }));

        resolve({ assignments, students });
      })
      .on('error', err => reject(err));
  });
}

module.exports = { parseTemplate };
