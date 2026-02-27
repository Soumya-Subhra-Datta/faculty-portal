/**
 * Database Configuration
 * MySQL Database Connection Setup
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'faculty_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Helper function to execute queries
const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

// Helper function to get single row
const getSingleRow = async (query, params = []) => {
  const results = await executeQuery(query, params);
  return results[0] || null;
};

// Helper function to get multiple rows
const getMultipleRows = async (query, params = []) => {
  return await executeQuery(query, params);
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  getSingleRow,
  getMultipleRows
};
