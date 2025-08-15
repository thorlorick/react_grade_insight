const pool = require('./db');

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log('Database connected, test query result:', rows[0].solution);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
