import { getDatabase } from '../db/init.js'

/**
 * Genera una baraja de loteria (1-54)
 */
function generateDeck() {
  const deck = []

  for (let i = 1; i <= 54; i += 1) {
    deck.push(String(i))
  }

  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }

  return deck
}

/**
 * Genera un board de 4x4 aleatorio sin repeticiones
 */
function generatePlayerBoard(deck) {
  const board = new Set()
  while (board.size < 16) {
    board.add(deck[Math.floor(Math.random() * deck.length)])
  }
  return Array.from(board)
}

function parseCardList(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value !== 'string') {
    return []
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }

  if (trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return []
    }
  }

  return trimmed.split(',').map((card) => card.trim()).filter(Boolean)
}

class LoteriaService {
  constructor() {
    this.db = getDatabase()
  }

  /**
   * Actualizar marca de actividad de la sala
   */
  touchRoom(roomCode) {
    this.db
      .prepare('UPDATE rooms SET updated_at = CURRENT_TIMESTAMP WHERE code = ?')
      .run(roomCode)
  }

  /**
   * Crear una nueva sala
   */
  createRoom(roomCode, creatorId, creatorName) {
    const deck = generateDeck()
    const deckJson = JSON.stringify(deck)

    try {
      const stmt = this.db.prepare(`
        INSERT INTO rooms (code, creator_id, creator_name, deck)
        VALUES (?, ?, ?, ?)
      `)
      stmt.run(roomCode, creatorId, creatorName, deckJson)

      this.touchRoom(roomCode)

      return this.getRoom(roomCode)
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('La sala ya existe')
      }
      throw error
    }
  }

  /**
   * Unirse a una sala
   */
  joinRoom(roomCode, playerId, playerName) {
    const room = this.getRoom(roomCode)

    // Verificar si el jugador ya existe (reconexión)
    const existingPlayer = this.db
      .prepare('SELECT * FROM players WHERE id = ? AND room_code = ?')
      .get(playerId, roomCode)

    if (existingPlayer) {
      // Actualizar nombre si cambió y marcar como conectado
      this.db
        .prepare('UPDATE players SET name = ?, connected = 1, connected_at = CURRENT_TIMESTAMP, disconnected_at = NULL WHERE id = ? AND room_code = ?')
        .run(playerName, playerId, roomCode)

      this.touchRoom(roomCode)
      return this.getRoom(roomCode)
    }

    /* Permitir unirse incluso si el juego inició */
    // if (room.gameStarted) {
    //   throw new Error('El juego ya ha iniciado')
    // }

    const deck = parseCardList(room.deck)
    const board = generatePlayerBoard(deck)
    const boardJson = JSON.stringify(board)

    // Insertar nuevo jugador
    const stmt = this.db.prepare(`
      INSERT INTO players (id, room_code, name, board, connected)
      VALUES (?, ?, ?, ?, 1)
    `)
    stmt.run(playerId, roomCode, playerName, boardJson)

    // Si ya hay 2+ jugadores, iniciar el juego automáticamente
    const playerCount = this.db
      .prepare('SELECT COUNT(*) as count FROM players WHERE room_code = ?')
      .get(roomCode).count

    if (playerCount > 1 && !room.gameStarted) {
      this.db.prepare('UPDATE rooms SET game_started = 1 WHERE code = ?').run(roomCode)
    }

    this.touchRoom(roomCode)

    return this.getRoom(roomCode)
  }

  /**
   * Reiniciar sala
   */
  resetRoom(roomCode, playerId) {
    const room = this.getRoom(roomCode)

    if (playerId !== room.creatorId) {
      throw new Error('Solo el anfitrión puede reiniciar la sala')
    }

    const newDeck = generateDeck()
    const deckJson = JSON.stringify(newDeck)

    // Limpiar cartas lanzadas y resetear estado de la sala
    this.db.transaction(() => {
      // Borrar cartas lanzadas
      this.db.prepare('DELETE FROM drawn_cards WHERE room_code = ?').run(roomCode)
      
      // Resetear sala
      this.db.prepare(`
        UPDATE rooms 
        SET game_started = 1, 
            winner_id = NULL, 
            winner_name = NULL, 
            deck = ?,
            updated_at = CURRENT_TIMESTAMP 
        WHERE code = ?
      `).run(deckJson, roomCode)

      // Generar nuevos cartones para todos los jugadores
      const players = this.db.prepare('SELECT id FROM players WHERE room_code = ?').all(roomCode)
      const updateBoardStmt = this.db.prepare('UPDATE players SET board = ? WHERE id = ? AND room_code = ?')
      
      for (const p of players) {
        const newBoard = generatePlayerBoard(newDeck)
        updateBoardStmt.run(JSON.stringify(newBoard), p.id, roomCode)
      }
    })()

    return this.getRoom(roomCode)
  }

  /**
   * Obtener una sala
   */
  getRoom(roomCode) {
    const room = this.db
      .prepare('SELECT * FROM rooms WHERE code = ?')
      .get(roomCode)

    if (!room) {
      throw new Error('La sala no existe')
    }

    // Obtener jugadores
    const players = this.db
      .prepare('SELECT id, name, board, connected FROM players WHERE room_code = ?')
      .all(roomCode)

    // Obtener cartas lanzadas
    const drawnCards = this.db
      .prepare('SELECT card FROM drawn_cards WHERE room_code = ? ORDER BY drawn_at')
      .all(roomCode)
      .map((r) => r.card)

    return {
      code: room.code,
      creatorId: room.creator_id,
      creatorName: room.creator_name,
      players: players.map((p) => ({
        id: p.id,
        name: p.name,
        board: parseCardList(p.board),
        connected: p.connected === 1,
      })),
      deck: parseCardList(room.deck),
      drawnCards,
      gameStarted: room.game_started === 1,
      winner: room.winner_name,
      createdAt: room.created_at,
    }
  }

  /**
   * Obtener información del jugador
   */
  getPlayer(playerId, roomCode) {
    const player = this.db
      .prepare('SELECT * FROM players WHERE id = ? AND room_code = ?')
      .get(playerId, roomCode)

    if (!player) {
      throw new Error('El jugador no existe')
    }

    return {
      id: player.id,
      name: player.name,
      roomCode: player.room_code,
      board: parseCardList(player.board),
      connected: player.connected === 1,
    }
  }

  /**
   * Marcar jugador como conectado
   */
  markPlayerConnected(playerId, roomCode) {
    this.db
      .prepare('UPDATE players SET connected = 1, connected_at = CURRENT_TIMESTAMP, disconnected_at = NULL WHERE id = ? AND room_code = ?')
      .run(playerId, roomCode)

    this.touchRoom(roomCode)
  }

  /**
   * Lanzar una carta
   */
  drawCard(roomCode, playerId) {
    const room = this.getRoom(roomCode)
    const player = room.players.find((p) => p.id === playerId)

    if (!player) {
      throw new Error('El jugador no existe')
    }

    if (playerId !== room.creatorId) {
      throw new Error('Solo el anfitrión puede lanzar cartas')
    }

    if (room.drawnCards.length >= room.deck.length) {
      throw new Error('Se han lanzado todas las cartas')
    }

    // Obtener la siguiente carta no lanzada
    let nextCard
    do {
      nextCard = room.deck[Math.floor(Math.random() * room.deck.length)]
    } while (room.drawnCards.includes(nextCard))

    // Insertar la carta lanzada
    try {
      this.db
        .prepare('INSERT INTO drawn_cards (room_code, card) VALUES (?, ?)')
        .run(roomCode, nextCard)
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        // La carta ya fue lanzada, obtener otra
        return this.drawCard(roomCode, playerId)
      }
      throw error
    }

    this.touchRoom(roomCode)

    return {
      card: nextCard,
      drawnCount: room.drawnCards.length + 1,
    }
  }

  /**
   * Verificar si un jugador ganó
   */
  checkWin(roomCode, playerId) {
    const room = this.getRoom(roomCode)
    const player = room.players.find((p) => p.id === playerId)

    if (!player) {
      throw new Error('El jugador no existe')
    }

    // Verificar si todas las cartas del jugador han sido lanzadas
    const hasWon = player.board.every((card) => room.drawnCards.includes(card))

    if (hasWon && !room.winner) {
      this.db
        .prepare('UPDATE rooms SET winner_id = ?, winner_name = ? WHERE code = ?')
        .run(playerId, player.name, roomCode)
      this.touchRoom(roomCode)
      return true
    }

    this.touchRoom(roomCode)

    return false
  }

  /**
   * Obtener lista de salas activas
   */
  getActiveRooms() {
    const rooms = this.db
      .prepare(`
        SELECT 
          r.code,
          r.creator_name,
          r.game_started,
          r.winner_name,
          COUNT(p.id) as player_count
        FROM rooms r
        LEFT JOIN players p ON r.code = p.room_code AND p.connected = 1
        WHERE r.created_at > datetime('now', '-1 day')
        GROUP BY r.code
        ORDER BY r.created_at DESC
      `)
      .all()

    return rooms.map((room) => ({
      code: room.code,
      creatorName: room.creator_name,
      playerCount: room.player_count,
      gameStarted: room.game_started === 1,
      winner: room.winner_name,
    }))
  }

  /**
   * Remover jugador (desconexión)
   */
  removePlayer(playerId, roomCode) {
    this.db
      .prepare('UPDATE players SET connected = 0, disconnected_at = CURRENT_TIMESTAMP WHERE id = ? AND room_code = ?')
      .run(playerId, roomCode)

    this.touchRoom(roomCode)
  }

  /**
   * Limpiar salas inactivas
   */
  cleanupInactiveRooms(maxMinutes = 15) {
    this.db
      .prepare(`
        DELETE FROM rooms
        WHERE updated_at < datetime('now', '-' || ? || ' minutes')
          AND NOT EXISTS (
            SELECT 1 FROM players p
            WHERE p.room_code = rooms.code AND p.connected = 1
          )
      `)
      .run(maxMinutes)
  }

  /**
   * Eliminar una sala
   */
  deleteRoom(roomCode, playerId) {
    const room = this.getRoom(roomCode)

    if (playerId !== room.creatorId) {
      throw new Error('Solo el anfitrión puede eliminar la sala')
    }

    this.db.prepare('DELETE FROM rooms WHERE code = ?').run(roomCode)
  }
}

export default LoteriaService