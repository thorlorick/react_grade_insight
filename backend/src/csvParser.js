const fs = require('fs');
const csv = require('csv-parser');

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

        const dateRow = rows[1];
        const pointsRow = rows[2];

        // Build assignments array safely
        const assignments = assignmentNames.map(name => {
          let dateVal = dateRow[name]?.trim() || null;
          if (dateVal === '-' || !dateVal) dateVal = null;

          let pointsVal = Number(pointsRow[name]);
          if (!Number.isFinite(pointsVal)) pointsVal = null;

          return {
            name,
            date: dateVal,
            max_points: pointsVal,
          };
        });

        const studentRows = rows.slice(3);
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

        resolve({ assignments, students });
      })
      .on('error', err => reject(err));
  });
}

module.exports = { parseTemplate };
