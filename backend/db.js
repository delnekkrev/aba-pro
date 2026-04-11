// db.js — SQLite database setup (uses Node.js built-in sqlite — no install needed)
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'aba_coach.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for better performance
db.exec('PRAGMA journal_mode = WAL;');

// Create users table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'Behavior Technician',
    org         TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

console.log('✅ Database ready at:', DB_PATH);

module.exports = db;
