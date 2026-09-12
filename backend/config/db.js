const mysql = require('mysql2/promise');
require('dotenv').config();

// A connection pool is used instead of a single connection so the server
// can handle multiple requests at once without waiting on one connection.
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

module.exports = pool;
