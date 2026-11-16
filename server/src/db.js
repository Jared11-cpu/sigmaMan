const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

function ensureColumn(db, table, col, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
  if (!cols.includes(col)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
  }
}

function initDb(dbPath) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      goal REAL NOT NULL DEFAULT 245,
      days TEXT NOT NULL DEFAULT '[1,2,6,0]',
      study_goal REAL NOT NULL DEFAULT 120,
      study_days TEXT NOT NULL DEFAULT '[1,2,3,4,5,6]',
      members TEXT NOT NULL DEFAULT '["林舟","陈默","苏晴"]',
      sport_date_plan TEXT NOT NULL DEFAULT '{}',
      study_date_plan TEXT NOT NULL DEFAULT '{}',
      version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS records_sport (
      id INTEGER PRIMARY KEY,
      room_code TEXT NOT NULL,
      person TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      km REAL NOT NULL,
      minutes INTEGER NOT NULL,
      feel INTEGER NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      photo TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'manual',
      likes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS records_study (
      id INTEGER PRIMARY KEY,
      room_code TEXT NOT NULL,
      person TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      hours REAL NOT NULL,
      minutes INTEGER NOT NULL,
      seconds INTEGER NOT NULL DEFAULT 0,
      focus INTEGER NOT NULL,
      target_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      photo TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'manual',
      likes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS study_targets (
      id TEXT NOT NULL,
      room_code TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      target_hours REAL NOT NULL,
      done_hours REAL NOT NULL DEFAULT 0,
      base_hours REAL NOT NULL DEFAULT 0,
      color TEXT NOT NULL,
      deadline TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (room_code, id)
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT NOT NULL,
      room_code TEXT NOT NULL,
      title TEXT NOT NULL,
      tag TEXT NOT NULL,
      icon TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (room_code, id)
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      room_code TEXT NOT NULL,
      person TEXT NOT NULL,
      date TEXT NOT NULL,
      habit_ids TEXT NOT NULL DEFAULT '[]',
      PRIMARY KEY (room_code, person, date)
    );

    CREATE TABLE IF NOT EXISTS record_likes (
      room_code TEXT NOT NULL,
      kind TEXT NOT NULL,
      record_id INTEGER NOT NULL,
      person TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (room_code, kind, record_id, person)
    );

    CREATE TABLE IF NOT EXISTS processed_ops (
      room_code TEXT NOT NULL,
      op_id TEXT NOT NULL,
      result_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (room_code, op_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sport_room ON records_sport(room_code, date, person);
    CREATE INDEX IF NOT EXISTS idx_study_room ON records_study(room_code, date, person);
    CREATE INDEX IF NOT EXISTS idx_habit_logs ON habit_logs(room_code, person, date);
    CREATE INDEX IF NOT EXISTS idx_likes ON record_likes(room_code, kind, record_id);
  `);

  // Backward-compatible schema migrations for existing SQLite files
  ensureColumn(db, 'rooms', 'sport_date_plan', "TEXT NOT NULL DEFAULT '{}'");
  ensureColumn(db, 'rooms', 'study_date_plan', "TEXT NOT NULL DEFAULT '{}'");
  ensureColumn(db, 'rooms', 'version', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn(db, 'records_sport', 'source', "TEXT NOT NULL DEFAULT 'manual'");
  ensureColumn(db, 'records_study', 'seconds', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'records_study', 'source', "TEXT NOT NULL DEFAULT 'manual'");
  ensureColumn(db, 'study_targets', 'archived', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'study_targets', 'base_hours', 'REAL NOT NULL DEFAULT 0');
  ensureColumn(db, 'habits', 'archived', 'INTEGER NOT NULL DEFAULT 0');

  return db;
}

module.exports = { initDb };
