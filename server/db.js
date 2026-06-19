import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.DB_PATH || './data/tekken3.db';

// Ensure data directory exists
mkdirSync(dirname(DB_PATH), { recursive: true });

let db;

// ── Initialize database ───────────────────────────────────────────
export async function initDB() {
  const SQL = await initSqlJs();

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Enable WAL-like behavior (sql.js doesn't have WAL, but we can still create tables)
  db.run('PRAGMA foreign_keys = ON');

  // ── Create tables ─────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      origin TEXT DEFAULT '',
      style TEXT DEFAULT '',
      difficulty INTEGER DEFAULT 5,
      accent_color TEXT DEFAULT '#e63946',
      quote TEXT DEFAULT '',
      description TEXT DEFAULT '',
      backstory TEXT DEFAULT '',
      image TEXT DEFAULT '',
      arcade_score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS character_traits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id TEXT NOT NULL,
      trait TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS character_moves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id TEXT NOT NULL,
      name TEXT NOT NULL,
      input TEXT DEFAULT '',
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    )
  `);

  // ── Seed default admin ────────────────────────────────────────
  const adminRows = db.exec(
    `SELECT id FROM users WHERE email = '${(process.env.ADMIN_EMAIL || 'waleedsajid269@gmail.com').replace(/'/g, "''")}'`
  );
  if (adminRows.length === 0 || adminRows[0].values.length === 0) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'uiopjkl', 10);
    db.run(
      `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`,
      [process.env.ADMIN_EMAIL || 'waleedsajid269@gmail.com', hash, 'admin']
    );
    console.log('[DB] Default admin user created');
  }

  saveDB();
  console.log('[DB] SQLite database initialized');

  return db;
}

// ── Persist to disk ───────────────────────────────────────────────
export function saveDB() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(DB_PATH, buffer);
}

// ── Helper: get all rows from a SELECT query ──────────────────────
export function dbAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// ── Helper: get single row ────────────────────────────────────────
export function dbGet(sql, params = []) {
  const rows = dbAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// ── Helper: run INSERT/UPDATE/DELETE ──────────────────────────────
export function dbRun(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

// ── Get database instance ─────────────────────────────────────────
export function getDB() {
  return db;
}
