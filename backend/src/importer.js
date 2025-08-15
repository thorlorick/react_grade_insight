// backend/src/importer.js
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const pool = require('./db');

function sanitizeStudentNumber(base) {
  // derive from email user part, max 50 chars, alnum+underscore
  return base.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 50);
}

async function findOrCreateStudent(conn, { firstName, lastName, email }) {
  // Try by email (treat email as unique in practice)
  const [rows] = await conn.execute(
    'SELECT id, student_number FROM students WHERE email = ? LIMIT 1',
    [email]
  );
  if (rows.length) return rows[0];

  // Need a student_number — derive from email user part
  const local = email.split('@')[0] || 'student';
  let candidate = sanitizeStudentNumber(local);
  let suffix = 1;

  // Ensure uniqueness against students.student_number
  // try candidate, then candidate_1, candidate_2, ...
  // (We could also catch duplicate-key and loop, but this is simple.)
  /* eslint no-constant-condition: 0 */
  while (true) {
    try {
      const [res] = await conn.execute(
        `INSERT INTO students (student_number, first_name, last_name, email)
         VALUES (?, ?, ?, ?)`,
        [candidate, firstName, lastName, email]
      );
      return { id: res.insertId, student_number: candidate };
    } catch (e) {
      if (e && e.code === 'ER_DUP_ENTRY') {
        candidate = sanitizeStudentNumber(`${local}_${suffix++}`);
        continue;
      }
      throw e;
    }
  }
}

async function findOrCreateAssignment(conn, { teacherId, uploadId, name, dueDate, maxPoints }) {
  const [rows] = await conn.execute(
    `SELECT id FROM assignments WHERE teacher_id = ? AND name = ? LIMIT 1`,
    [teacherId, name]
  );
  if (rows.length) {
    // Optionally refresh due/max (don’t overwrite with empty)
    await conn.execute(
      `UPDATE assignments SET due_date = COALESCE(?, due_date),
                              max_points = COALESCE(?, max_points),
                              upload_id = COALESCE(?, upload_id)
       WHERE id = ?`,
      [dueDate || null, maxPoints ?? null, uploadId || null, rows[0].id]
    );
    return rows[0].id;
  }

  const [res] = await conn.execute(
    `INSERT INTO assignments (teacher_id, upload_id, name, due_date, max_points)
     VALUES (?, ?, ?, ?, ?)`,
    [teacherId, uploadId || null, name, dueDate || null, maxPoints ?? null]
  );
  return res.insertId;
}

async function upsertGrade(conn, { studentId, assignmentId, teacherId, uploadId, grade }) {
  // Check existing grade
  const [rows] = await conn.execute(
    `SELECT id FROM grades WHERE student_id = ? AND assignment_id = ? LIMIT 1`,
    [studentId, assignmentId]
  );
  if (rows.length) {
    await conn.execute(
      `UPDATE grades SET grade = ?, teacher_id = ?, upload_id = ?
       WHERE id = ?`,
      [grade, teacherId, uploadId || null, rows[0].id]
    );
    return rows[0].id;
  }
  const [res] = await conn.execute(
    `INSERT INTO grades (student_id, assignment_id, teacher_id, upload_id, grade)
     VALUES (?, ?, ?, ?, ?)`,
    [studentId, assignmentId, teacherId, uploadId || null, grade]
  );
  return res.insertId;
}

/**
 * Import CSV in your special template format.
 * @param {string} filePath - path to CSV file
 * @param {number} teacherId - existing teachers.id
 * @param {string} [notes] - optional notes for uploads row
 * @returns {object} summary
 */
async function importTemplate(filePath, teacherId, notes = '') {
  const csvBuffer = fs.readFileSync(filePath);
  const rows = parse(csvBuffer, { trim: true, skip_empty_lines: true });

  if (rows.length < 4) {
    throw new Error('CSV too short. Expect header + DATE + POINTS + data rows.');
  }

  const header = rows[0]; // e.g. last_name,first_name,email,Math Test,Essay 1,Science Lab
  const dateRow = rows[1]; // DATE,-,-,2025-06-01,...
  const pointsRow = rows[2]; // POINTS,-,-,100,...

  // Validate first three header fields
  if (
    header[0]?.toLowerCase() !== 'last_name' ||
    header[1]?.toLowerCase() !== 'first_name' ||
    header[2]?.toLowerCase() !== 'email'
  ) {
    throw new Error('First three header columns must be last_name, first_name, email.');
  }

  // Assignment columns start at index 3
  const assignmentNames = header.slice(3);
  const dueDates = dateRow.slice(3);
  const maxPoints = pointsRow.slice(3);

  // Open a transaction
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Ensure uploads directory row
    const fileNameOnly = filePath.split('/').pop();
    const [uploadRes] = await conn.execute(
      `INSERT INTO uploads (teacher_id, filename, notes) VALUES (?, ?, ?)`,
      [teacherId, fileNameOnly, notes || null]
    );
    const uploadId = uploadRes.insertId;

    // Prepare assignments
    const assignmentIds = [];
    for (let i = 0; i < assignmentNames.length; i++) {
      const name = assignmentNames[i]?.trim();
      if (!name) { assignmentIds.push(null); continue; }

      const due = (dueDates[i] && dueDates[i] !== '-') ? dueDates[i] : null;
      const ptsRaw = (maxPoints[i] && maxPoints[i] !== '-') ? maxPoints[i] : null;
      const pts = ptsRaw != null && ptsRaw !== '' ? Number(ptsRaw) : null;

      const assignmentId = await findOrCreateAssignment(conn, {
        teacherId,
        uploadId,
        name,
        dueDate: due,
        maxPoints: (Number.isFinite(pts) ? pts : null)
      });
      assignmentIds.push(assignmentId);
    }

    // Students + Grades
    let studentsCreated = 0, gradesUpserted = 0;
    for (let r = 3; r < rows.length; r++) {
      const row = rows[r];
      if (!row?.length) continue;

      const lastName = row[0]?.trim() || '';
      const firstName = row[1]?.trim() || '';
      const email = row[2]?.trim() || '';
      if (!lastName || !firstName || !email) continue; // skip bad rows

      const student = await findOrCreateStudent(conn, {
        firstName,
        lastName,
        email
      });
      if (!student) continue;
      if (!student.student_number) studentsCreated++; // heuristic

      // Grades for each assignment col
      for (let c = 3; c < row.length; c++) {
        const gradeCell = (row[c] ?? '').toString().trim();
        const assignmentId = assignmentIds[c - 3];
        if (!assignmentId) continue;

        if (gradeCell === '' || gradeCell === '-' ) continue;

        const val = Number(gradeCell);
        if (!Number.isFinite(val)) continue;

        await upsertGrade(conn, {
          studentId: student.id,
          assignmentId,
          teacherId,
          uploadId,
          grade: val
        });
        gradesUpserted++;
      }
    }

    await conn.commit();
    return {
      uploadId,
      assignmentsCreatedOrUpdated: assignmentIds.filter(Boolean).length,
      studentsCreatedEstimate: studentsCreated,
      gradesUpserted
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

module.exports = { importTemplate };
