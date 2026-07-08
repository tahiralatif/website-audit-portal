// scripts/seed-demo-user.js
// Run with: node scripts/seed-demo-user.js

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'audit.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    current_tool TEXT,
    results TEXT,
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const DEMO_EMAIL = 'demo@auditportal.com';
const DEMO_PASSWORD = 'Demo@2026';
const DEMO_NAME = 'Demo User';

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_EMAIL);
if (existing) {
  console.log(`Demo user already exists (id: ${existing.id}). Skipping.`);
  db.close();
  process.exit(0);
}

const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(
  DEMO_NAME,
  DEMO_EMAIL,
  hash
);

console.log('Demo user created successfully!');
console.log(`  ID:    ${result.lastInsertRowid}`);
console.log(`  Email: ${DEMO_EMAIL}`);
console.log(`  Pass:  ${DEMO_PASSWORD}`);

db.close();
