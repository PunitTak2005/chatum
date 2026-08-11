import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../chat.db');

const verboseSqlite = sqlite3.verbose();
const db = new verboseSqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Promisified helper methods
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Initialize schema
export const initDatabase = async () => {
  try {
    // Users table for dummy authentication & presence persistence
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        avatar TEXT,
        status TEXT DEFAULT 'offline',
        lastSeenAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safe migration: ensure status column exists on pre-existing users tables
    try {
      await run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'offline'`);
    } catch {
      // Column already exists, ignore error
    }

    // Rooms table
    await run(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Messages table
    await run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        room TEXT NOT NULL,
        sender TEXT NOT NULL,
        senderAvatar TEXT,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'delivered',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room) REFERENCES rooms(id)
      )
    `);

    // Create index on room & timestamp for fast queries
    await run(`
      CREATE INDEX IF NOT EXISTS idx_messages_room_timestamp 
      ON messages(room, timestamp DESC)
    `);

    // Seed default rooms if none exist
    const defaultRooms = [
      { id: 'general', name: 'General Chat', description: 'Open discussions and casual conversations' },
      { id: 'tech', name: 'Tech Talk', description: 'Coding, frameworks, development & tech' },
      { id: 'random', name: 'Random Hub', description: 'Memes, music, games & off-topic fun' }
    ];

    for (const room of defaultRooms) {
      const existing = await getOne('SELECT id FROM rooms WHERE id = ?', [room.id]);
      if (!existing) {
        await run('INSERT INTO rooms (id, name, description) VALUES (?, ?, ?)', [
          room.id,
          room.name,
          room.description
        ]);
      }
    }

    console.log('✅ Database schema and seed data initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};

export default db;
