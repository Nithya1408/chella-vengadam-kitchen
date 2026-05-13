const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool (better than single connection for web apps)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Use promise wrapper so we can use async/await
const db = pool.promise();

// Test connection on startup
db.getConnection()
  .then(conn => {
    console.log('Connected to MySQL (Chella Vengadam DB)');
    conn.release();
  })
  .catch(err => {
    console.error('MySQL connection failed:', err.message);
  });

module.exports = db;