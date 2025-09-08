const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

// Minimum number of filled grades required to keep an assignment
const MIN_FILLED_COUNT = process.env.MIN_FILLED_COUNT
  ? Number(process.env.MIN_FILLED_COUNT)
  : 1; // default: at least one student must have a grade

async function parseTemplate(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/\s+/g, '_')
      }))
      .on('data', row => rows.push(row))
      .on('end', () => {
        if (rows.length < 3) return reject(new Error('CSV must have at least 3 rows'));

        const headers = Object.keys(rows[0]);

        // First 3 columns are always: last_name, first_name, email
        const lastNameCol = headers[0];
        const firstNameCol = headers[1];
        const emailCol = headers[2];
        const assignmentNames = headers.slice(3);

        const dateRow = rows[0];
        const pointsRow = rows[1];

        // Build assignments
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

        // Student rows
        const studentRows = rows.slice(2);
        const students = studentRows.map(r => ({
          last_name: r[lastNameCol]?.trim() || null,
          first_name: r[firstNameCol]?.trim() || null,
          email: r[emailCol]?.trim() || null,
          grades: assignmentNames.map(name => {
            const raw = r[name]?.trim();
            if (raw === undefined || raw === '' || raw === '-') {
              return null; // treat blank/missing as "not done"
            }
            const num = Number(raw);
            return Number.isFinite(num) ? num : null;
          }),
        }));

        // Filter out students missing identifiers
        const validStudents = students.filter(s => {
          if (!s.last_name || !s.first_name || !s.email) {
            console.log(`Skipping student with missing required fields:`, {
              last_name: s.last_name,
              first_name: s.first_name,
              email: s.email
            });
            return false;
          }
          return true;
        });

        // Filter assignments with < MIN_FILLED_COUNT grades
        const keepIndices = [];
        const filteredAssignments = assignments.filter((assignment, index) => {
          const filledCount = validStudents.filter(s => s.grades[index] !== null).length;
          if (filledCount < MIN_FILLED_COUNT) {
            console.log(`Skipping assignment "${assignment.name}" — only ${filledCount} filled`);
            return false;
          }
          keepIndices.push(index);
          return true;
        });

        // Strip dropped assignment grades
        const filteredStudents = validStudents.map(s => ({
          ...s,
          grades: keepIndices.map(i => s.grades[i]),
        }));

        resolve({ assignments: filteredAssignments, students: filteredStudents });
      })
      .on('error', err => reject(err));
  });
}

module.exports = { parseTemplate };
