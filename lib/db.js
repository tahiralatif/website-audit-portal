import Database from 'better-sqlite3';
import path from 'path';

let _db = null;

function getDb() {
  if (!_db) {
    const dbPath = path.join(process.cwd(), 'audit.db');
    _db = new Database(dbPath);
    _db.pragma('journal_mode = WAL');

    _db.exec(`
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

    try {
      _db.exec(`ALTER TABLE audits ADD COLUMN user_id INTEGER`);
    } catch (e) {
      // column already exists
    }
  }
  return _db;
}

export function createAudit(url, userId) {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO audits (url, user_id, status) VALUES (?, ?, ?)'
  );
  const result = stmt.run(url, userId, 'pending');
  return { id: result.lastInsertRowid, url, status: 'pending' };
}

export function getAudit(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM audits WHERE id = ?').get(id);
  if (row && row.results) {
    row.results = JSON.parse(row.results);
  }
  return row;
}

export function updateAudit(id, updates) {
  const db = getDb();
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'results') {
      fields.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  db.prepare(`UPDATE audits SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

export function listAudits(limit = 50) {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM audits ORDER BY created_at DESC LIMIT ?').all(limit);
  return rows.map((row) => {
    if (row.results) {
      row.results = JSON.parse(row.results);
    }
    return row;
  });
}

export function createUser({ name, email, passwordHash }) {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
  );
  const result = stmt.run(name, email, passwordHash);
  return { id: result.lastInsertRowid, name, email };
}

export function getUserByEmail(email) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function getUserByToken(token) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE token = ?').get(token);
}

export function setUserToken(id, token) {
  const db = getDb();
  db.prepare('UPDATE users SET token = ? WHERE id = ?').run(token, id);
}

export default getDb;
