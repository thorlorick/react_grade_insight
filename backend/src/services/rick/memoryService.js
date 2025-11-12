// backend/services/memoryService.js
const mysql = require('mysql2/promise');
const path = require('path');
const config = require('../../config/rickConfig');

// Create connection pool
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Save a new memory
 */
const saveMemory = async (teacherId, memoryContent) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO rick_memory 
       (teacher_id, memory_content, created_at) 
       VALUES (?, ?, NOW())`,
      [teacherId, memoryContent]
    );

    return { success: true, memoryId: result.insertId, message: 'Memory saved successfully' };
  } catch (error) {
    console.error('Error saving memory:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get memories for a teacher (limit by number)
 */
const getMemories = async (teacherId, limit = 5) => {
  try {
    const [memories] = await pool.execute(
      `SELECT id, memory_content, created_at
       FROM rick_memory
       WHERE teacher_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [teacherId, limit]
    );

    return {
      success: true,
      memories: memories.map(m => ({
        id: m.id,
        content: m.memory_content,
        createdAt: m.created_at
      }))
    };
  } catch (error) {
    console.error('Error fetching memories:', error);
    return { success: false, memories: [], error: error.message };
  }
};

/**
 * Delete a memory
 */
const deleteMemory = async (teacherId, memoryId) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM rick_memory WHERE id = ? AND teacher_id = ?',
      [memoryId, teacherId]
    );

    if (result.affectedRows === 0)
      return { success: false, error: 'Memory not found or permission denied' };

    return { success: true, message: 'Memory deleted successfully' };
  } catch (error) {
    console.error('Error deleting memory:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { saveMemory, getMemories, deleteMemory };
