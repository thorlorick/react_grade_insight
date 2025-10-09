const fs = require('fs');
const csv = require('csv-parser');
const { parseDate } = require('./dateParser');

require('dotenv').config();

// Minimum number of filled grades required to keep an assignment
const MIN_FILLED_COUNT = process.env.MIN_FILLED_COUNT
  ? Number(process.env.MIN_FILLED_COUNT)
  : 1; // default: at least one student must have a grade

async function parseTemplate(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) =>
            header.trim().toLowerCase().replace(/\s+/g, '_'),
        })
      )
      .on('data', (row) => rows.push(row))
      .on('end', () => {
        if (rows.length < 3)
          return reject(new Error('CSV must have at least 3 rows'));

        const headers = Object.keys(rows[0]);

        // First 3 columns are always: last_name, first_name, email
        const lastNameCol = headers[0];
        const firstNameCol = headers[1];
        const emailCol = headers[2];
        const assignmentNames = headers.slice(3);

        const dateRow = rows[0];
        const pointsRow = rows[1];

        // === Build and merge assignments by name ===
        const assignmentMap = {};

        assignmentNames.forEach((name, idx) => {
          const baseName = name.trim().toLowerCase(); // normalize
          const dateVal = parseDate(dateRow[name]);
          let pointsVal = Number(pointsRow[name]);
          if (!Number.isFinite(pointsVal)) pointsVal = null;

          if (!assignmentMap[baseName]) {
            assignmentMap[baseName] = {
              name: baseName,
              dates: [dateVal],
              max_points: pointsVal,
              indices: [idx],
            };
          } else {
            assignmentMap[baseName].dates.push(dateVal);
            assignmentMap[baseName].indices.push(idx);
          }
        });

        // Convert map to array
        const assignments = Object.values(assignmentMap).map((a) => ({
          name: a.name,
          date: a.dates[0], // keep first or latest date if needed
          max_points: a.max_points,
        }));

        // === Build student data ===
        const studentRows = rows.slice(2);
        const students = studentRows.map((r) => {
          const grades = Object.values(assignmentMap).map((a) => {
            // Look up all columns that belong to the same project
            const gradeValues = a.indices.map((i) => {
              const colName = assignmentNames[i];
              const raw = r[colName]?.trim();
              if (!raw || raw === '-') return null;
              const num = Number(raw);
              return Number.isFinite(num) ? num : null;
            });

            // Take the latest non-null grade
            const lastGrade = gradeValues.reverse().find((g) => g !== null) ?? null;
            return lastGrade;
          });

          return {
            last_name: r[lastNameCol]?.trim() || null,
            first_name: r[firstNameCol]?.trim() || null,
            email: r[emailCol]?.trim() || null,
            grades,
          };
        });

        // Filter out students missing identifiers
        const validStudents = students.filter((s) => {
          if (!s.last_name || !s.first_name || !s.email) {
            console.log(`Skipping student with missing required fields:`, {
              last_name: s.last_name,
              first_name: s.first_name,
              email: s.email,
            });
            return false;
          }
          return true;
        });

        // Filter assignments with < MIN_FILLED_COUNT grades
        const keepIndices = [];
        const filteredAssignments = assignments.filter((assignment, index) => {
          const filledCount = validStudents.filter(
            (s) => s.grades[index] !== null
          ).length;
          if (filledCount < MIN_FILLED_COUNT) {
            console.log(
              `Skipping assignment "${assignment.name}" — only ${filledCount} filled`
            );
            return false;
          }
          keepIndices.push(index);
          return true;
        });

        // Strip dropped assignment grades
        const filteredStudents = validStudents.map((s) => ({
          ...s,
          grades: keepIndices.map((i) => s.grades[i]),
        }));

        resolve({ assignments: filteredAssignments, students: filteredStudents });
      })
      .on('error', (err) => reject(err));
  });
}

module.exports = { parseTemplate };
