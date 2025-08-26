const fs = require('fs');
const csv = require('csv-parser');

/**
 * Parses a CSV template file into assignments and students.
 * Expects CSV like:
 * last_name,first_name,email,Math Test,Essay 1,Science Lab
 * DATE,-,-,2025-06-01,2025-06-03,2025-06-05
 * POINTS,-,-,100,98,10
 * Smith,Alice,alice.smith@example.com,85,90,7
 */
async function parseTemplate(filePath) {
  const rows = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => {
        try {
          if (rows.length < 3) throw new Error('CSV must have at least 3 rows');

          // First row: assignment names
          const headers = Object.keys(rows[0]);
          const assignmentNames = headers.slice(3); // skip last_name, first_name, email

          // Second row: dates
          const dateRow = rows[0]; // usually the first row in your CSV
          const dateValues = rows[1]; // DATE row
          const pointsRow = rows[2]; // POINTS row

          const assignments = assignmentNames.map((name, i) => ({
            name,
            date: dateValues[name],
            max_points: parseFloat(pointsRow[name])
          }));

          // Remaining rows: students
          const students = rows.slice(3).map((r) => ({
            last_name: r['last_name'],
            first_name: r['first_name'],
            email: r['email'],
            grades: assignmentNames.map((a) => parseFloat(r[a]))
          }));

          resolve({ assignments, students });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

module.exports = { parseTemplate };
