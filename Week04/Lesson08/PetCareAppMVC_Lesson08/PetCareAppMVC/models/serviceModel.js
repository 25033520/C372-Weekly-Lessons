const db = require('../config/db');

// Active services only, ordered by name
function getActiveServices(callback) {
  const sql = 'SELECT id, name, price FROM services WHERE is_active = 1 ORDER BY name';
  db.query(sql, callback);
}

module.exports = { getActiveServices };
