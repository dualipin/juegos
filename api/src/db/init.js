import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// DB en la raíz del proyecto
const dbPath = path.join(__dirname, '../../../juegos.db')

export function initializeDatabase() {
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Crear tabla de salas
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      creator_id TEXT NOT NULL,
      creator_name TEXT NOT NULL,
      game_started BOOLEAN DEFAULT 0,
      winner_id TEXT,
      winner_name TEXT,
      deck TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Crear tabla de jugadores
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      room_code TEXT NOT NULL,
      name TEXT NOT NULL,
      board TEXT NOT NULL,
      connected BOOLEAN DEFAULT 1,
      connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      disconnected_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
    )
  `)

  // Crear tabla de cartas lanzadas
  db.exec(`
    CREATE TABLE IF NOT EXISTS drawn_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT NOT NULL,
      card TEXT NOT NULL,
      drawn_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE,
      UNIQUE(room_code, card)
    )
  `)

  // Crear índices
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
    CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_code);
    CREATE INDEX IF NOT EXISTS idx_drawn_cards_room ON drawn_cards(room_code);
  `)

  return db
}

export function getDatabase() {
  const db = new Database(dbPath)
  db.pragma('foreign_keys = ON')
  return db
}
