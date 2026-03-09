const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "..", "data", "medchain.db");

let db = null;

function getDb() {
  if (db) return db;

  const fs = require("fs");
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema();
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS drugs (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      form TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      shelf_life_months INTEGER NOT NULL,
      manufacturer TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('hospital', 'pharmacy', 'clinic')),
      region TEXT NOT NULL,
      distance_km REAL NOT NULL,
      hours TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS facility_stock (
      facility_id TEXT NOT NULL,
      drug_code TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (facility_id, drug_code),
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (drug_code) REFERENCES drugs(code)
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      patient_wallet TEXT NOT NULL,
      drug_code TEXT NOT NULL,
      form TEXT NOT NULL,
      dosage TEXT NOT NULL,
      doctor TEXT NOT NULL,
      hospital TEXT NOT NULL,
      prescribed_date TEXT NOT NULL,
      duration TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('active', 'past')),
      refills_total INTEGER NOT NULL DEFAULT 0,
      refills_used INTEGER NOT NULL DEFAULT 0,
      next_refill_date TEXT,
      completed_date TEXT,
      FOREIGN KEY (drug_code) REFERENCES drugs(code)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_wallet TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      drug TEXT,
      drug_code TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      action_label TEXT,
      action_target TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_wallet TEXT NOT NULL,
      target_role TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'high',
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      batch_id TEXT,
      drug TEXT,
      region TEXT,
      reported_by TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, closeDb };
