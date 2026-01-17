import * as dotenv from 'dotenv';
import Database, { Database as DatabaseType } from 'better-sqlite3';

dotenv.config();

export const db: DatabaseType = new Database(process.env['DB_PATH'] || 'scraper.db');

export function initDatabase() {
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      url TEXT UNIQUE,
      status TEXT DEFAULT 'processing' CHECK(status IN ('active', 'inactive', 'processing')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER,
      title TEXT,
      url TEXT,
      type TEXT CHECK(type IN ('image', 'video')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
    );
  `);
}