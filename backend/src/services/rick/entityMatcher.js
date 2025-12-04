// backend/src/services/rick/entityMatcher.js

const Fuse = require('fuse.js');
const { pool: db } = require('../../db');
const { findBestMatch } = require('../../utils/assignmentNormalizer');

/**
 * Fuzzy find student by name
 */
async function fuzzyFindStudent(name, teacherId) {
  const [students] = await db.query(`
    SELECT DISTINCT s.id, s.first_name, s.last_name,
           CONCAT(s.first_name, ' ', s.last_name) as full_name
    FROM students s
    JOIN grades g ON s.id = g.student_id
    WHERE g.teacher_id = ?
  `, [teacherId]);
  
  if (students.length === 0) {
    throw new Error('No students found for this teacher');
  }
  
  const fuse = new Fuse(students, {
    keys: ['first_name', 'last_name', 'full_name'],
    threshold: 0.4,
    includeScore: true
  });
  
  const results = fuse.search(name);
  
  if (results.length === 0) {
    throw new Error(`No student found matching "${name}"`);
  }
  
  if (results.length === 1 || results[0].score < 0.2) {
    return results[0].item;
  }
  
  return {
    needsClarification: true,
    options: results.slice(0, 3).map(r => r.item)
  };
}

/**
 * Fuzzy find assignment by name using smart normalizer
 */
async function fuzzyFindAssignment(name, teacherId) {
  const [assignments] = await db.query(`
    SELECT id, name, due_date, max_points
    FROM assignments
    WHERE teacher_id = ?
  `, [teacherId]);
  
  if (assignments.length === 0) {
    throw new Error('No assignments found');
  }
  
  const result = findBestMatch(name, assignments);
  
  if (!result.found) {
    if (result.needsClarification) {
      return {
        needsClarification: true,
        options: result.matches
      };
    }
    throw new Error(result.error);
  }
  
  const { tokens, matchScore, ...assignment } = result.assignment;
  return assignment;
}

module.exports = {
  fuzzyFindStudent,
  fuzzyFindAssignment
};
