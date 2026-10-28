const connection = require('../config/db');

function create(username, hashedPassword, name, role, callback) {
  const sql = 'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)';
  connection.query(sql, [username, hashedPassword, name, role], callback);
}

function findByCredentials(username, hashedPassword, callback) {
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(sql, [username, hashedPassword], callback);
}

function findAll(callback) {
  const sql = 'SELECT id, name, username, role FROM users';
  connection.query(sql, callback);
}

function findById(userId, callback) {
  const sql = 'SELECT id, name, username, role FROM users WHERE id = ?';
  connection.query(sql, [userId], callback);
}

function deleteById(userId, callback) {
  const sql = 'DELETE FROM users WHERE id = ?';
  connection.query(sql, [userId], callback);
}

module.exports = {
  create,
  findByCredentials,
  findAll,
  findById,
  deleteById
};
