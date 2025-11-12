// backend/services/memoryService.js

const mysql = require('mysql2/promise');
const path = require('path');
const config = require('../../config/rickConfig');
const { extractStudentNames } = require(path.resolve(__dirname, '../../utils/rick/contextBuilder'));

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
    const tags = extractStudentNames(memoryContent); // optional keywords

    const [result] = await pool.execute(
      `INSERT INTO rick_memory 
       (teacher_id, memory_content, tags, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [teacherId, memoryContent, JSON.stringify(tags)]
    );

    return {
      success: true,
      memoryId: result.insertId,
      message: 'Memory saved successfully'
    };
  } catch (error) {
    console.error('Error saving memory:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get memories for a teacher
 */
const getMemories = async (teacherId, limit = 20) => {
  limit = parseInt(limit, 10);
  try {
    const query = `
      SELECT * 
      FROM rick_memory
      WHERE teacher_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;
    const [memories] = await pool.query(query, [teacherId, limit]);

    return {
      success: true,
      memories: memories.map(m => ({
        id: m.id,
        content: m.memory_content,
        tags: JSON.parse(m.tags || '[]'),
        createdAt: m.created_at
      }))
    };
  } catch (error) {
    console.error('Error fetching memories:', error);
    return {
      success: false,
      memories: [],
      error: error.message
    };
  }
};

/**
 * Get relevant memories based on keywords in message
 */
const getRelevantMemories = async (teacherId, message, limit = 5) => {
  try {
    const keywords = extractStudentNames(message)
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywords.length === 0) {
      return getMemories(teacherId, limit);
    }

    const placeholders = keywords.map(() => 'memory_content LIKE ?').join(' OR ');
    const params = [teacherId, ...keywords.map(k => `%${k}%`), limit];

    const query = `
      SELECT * 
      FROM rick_memory
      WHERE teacher_id = ? AND (${placeholders})
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const [memories] = await pool.execute(query, params);

    return {
      success: true,
      memories: memories.map(m => ({
        id: m.id,
        content: m.memory_content,
        tags: JSON.parse(m.tags || '[]'),
        createdAt: m.created_at
      }))
    };
  } catch (error) {
    console.error('Error fetching relevant memories:', error);
    return {
      success: false,
      memories: [],
      error: error.message
    };
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

    if (result.affectedRows === 0) {
      return {
        success: false,
        error: 'Memory not found or you do not have permission to delete it'
      };
    }

    return {
      success: true,
      message: 'Memory deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting memory:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update a memory
 */
const updateMemory = async (teacherId, memoryId, newContent) => {
  try {
    const tags = extractStudentNames(newContent);

    const [result] = await pool.execute(
      `UPDATE rick_memory
       SET memory_content = ?, tags = ?, updated_at = NOW()
       WHERE id = ? AND teacher_id = ?`,
      [newContent, JSON.stringify(tags), memoryId, teacherId]
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        error: 'Memory not found or you do not have permission to update it'
      };
    }

    return {
      success: true,
      message: 'Memory updated successfully'
    };
  } catch (error) {
    console.error('Error updating memory:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get memory count for a teacher
 */
const getMemoryCount = async (teacherId) => {
  try {
    const [result] = await pool.execute(
      'SELECT COUNT(*) as count FROM rick_memory WHERE teacher_id = ?',
      [teacherId]
    );

    return {
      success: true,
      count: result[0].count
    };
  } catch (error) {
    console.error('Error counting memories:', error);
    return {
      success: false,
      count: 0,
      error: error.message
    };
  }
};

module.exports = {
  saveMemory,
  getMemories,
  getRelevantMemories,
  deleteMemory,
  updateMemory,
  getMemoryCount
};
