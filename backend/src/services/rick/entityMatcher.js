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
  
  // Check if we have multiple matches with similar scores
  if (results.length > 1) {
    const topScore = results[0].score;
    const secondScore = results[1].score;
    
    // If top two matches are very close in score (within 0.1), need clarification
    if (Math.abs(topScore - secondScore) < 0.1) {
      return {
        needsClarification: true,
        options: results.slice(0, 3).map(r => r.item)
      };
    }
  }
  
  // Single match or clear winner
  if (results.length === 1 || results[0].score < 0.2) {
    return results[0].item;
  }
  
  // Multiple matches but first one is significantly better
  return results[0].item;
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
