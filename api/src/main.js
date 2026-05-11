import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { router } from './routes/index.js'
import { initializeDatabase } from './db/init.js'
import LoteriaService from './service/loteria.service.js'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

const port = 3000

// Inicializar base de datos
console.log('Inicializando base de datos...')
initializeDatabase()
console.log('Base de datos inicializada ✓')

const loteriaService = new LoteriaService()

// Limpiar salas inactivas cada 5 minutos
setInterval(() => {
  try {
    loteriaService.cleanupInactiveRooms(15)
  } catch (error) {
    console.error('Error cleaning inactive rooms:', error)
  }
}, 5 * 60 * 1000)

// Almacenar conexiones activas por sala
const roomConnections = new Map()

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use('/api', router)

// WebSocket para Lotería
wss.on('connection', (ws, req) => {
  const urlParts = req.url.split('/')
  const roomCode = urlParts[urlParts.length - 2]
  const playerId = urlParts[urlParts.length - 1]

  if (!roomCode || !playerId) {
    ws.close()
    return
  }

  // Agregar conexión a la sala
  if (!roomConnections.has(roomCode)) {
    roomConnections.set(roomCode, new Map())
  }
  roomConnections.get(roomCode).set(playerId, ws)

  // Obtener información del jugador y sala
  try {
    const room = loteriaService.getRoom(roomCode)
    const player = room.players.find((p) => p.id === playerId)

    if (!player) {
      ws.close()
      return
    }

    loteriaService.markPlayerConnected(playerId, roomCode)

    // Enviar estado actual al cliente que se conecta
    ws.send(
      JSON.stringify({
        type: 'connected',
        roomCode,
        playerId,
        players: room.players.map((p) => ({ id: p.id, name: p.name })),
        drawnCards: room.drawnCards,
        gameStarted: room.gameStarted,
        winner: room.winner,
      })
    )

    // Notificar a otros jugadores que alguien se conectó
    broadcastToRoom(roomCode, playerId, {
      type: 'playerConnected',
      playerId,
      playerName: player.name,
      players: room.players.map((p) => ({ id: p.id, name: p.name })),
    })
  } catch (error) {
    console.error('Error on connection:', error.message)
    ws.close()
    return
  }

  // Manejar mensajes del cliente
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      handleLotteryMessage(message, roomCode, playerId, ws)
    } catch (error) {
      console.error('Error parsing message:', error)
    }
  })

  // Manejar desconexión
  ws.on('close', () => {
    const roomConnMap = roomConnections.get(roomCode)
    if (roomConnMap) {
      roomConnMap.delete(playerId)
      if (roomConnMap.size === 0) {
        roomConnections.delete(roomCode)
      }
    }

    // Notificar a otros que el jugador se desconectó
    try {
      loteriaService.removePlayer(playerId, roomCode)
      const room = loteriaService.getRoom(roomCode)
      broadcastToRoom(roomCode, null, {
        type: 'playerDisconnected',
        playerId,
        players: room.players.map((p) => ({ id: p.id, name: p.name })),
      })
    } catch (error) {
      console.error('Error on disconnect:', error)
    }
  })
})

/**
 * Manejar mensajes del juego de Lotería
 */
function handleLotteryMessage(message, roomCode, playerId, ws) {
  const { action } = message

  try {
    const room = loteriaService.getRoom(roomCode)
    const player = room.players.find((p) => p.id === playerId)

    if (!player) {
      return
    }

    switch (action) {
      case 'draw': {
        const result = loteriaService.drawCard(roomCode, playerId)
        broadcastToRoom(roomCode, null, {
          type: 'cardDrawn',
          card: result.card,
          drawnCount: result.drawnCount,
          totalCards: room.deck.length,
        })
        break
      }

      case 'bingo': {
        const hasWon = loteriaService.checkWin(roomCode, playerId)
        if (hasWon) {
          broadcastToRoom(roomCode, null, {
            type: 'winner',
            winnerId: playerId,
            winnerName: player.name,
          })
        } else {
          ws.send(
            JSON.stringify({
              type: 'bingoFailed',
              message: 'No has completado tu cartón',
            })
          )
        }
        break
      }

      default:
        break
    }
  } catch (error) {
    console.error('Error handling message:', error)
    ws.send(
      JSON.stringify({
        type: 'error',
        message: error.message,
      })
    )
  }
}

/**
 * Enviar mensaje a todos los jugadores de una sala
 */
function broadcastToRoom(roomCode, excludePlayerId, message) {
  const roomConnMap = roomConnections.get(roomCode)
  if (!roomConnMap) {
    return
  }

  for (const [playerId, connection] of roomConnMap.entries()) {
    if (excludePlayerId && playerId === excludePlayerId) {
      continue
    }
    if (connection.readyState === 1) {
      // 1 = OPEN
      connection.send(JSON.stringify(message))
    }
  }
}

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})