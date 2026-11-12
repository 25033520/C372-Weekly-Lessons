const mysql = require('mysql2');

// MySQL connection pool
// A pool lets the booking feature borrow ONE connection for a whole transaction,
// while other models keep using pool.query() exactly as before.
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'RP738964$',
  database: 'petcare',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
