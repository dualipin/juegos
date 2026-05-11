import LoteriaService from '../service/loteria.service.js'
import { v4 as uuidv4 } from 'uuid'

const loteriaService = new LoteriaService()

/**
 * Generar código de sala único de 6 caracteres
 */
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function obtenerSalas(req, res) {
  try {
    const rooms = loteriaService.getActiveRooms()
    res.json(rooms)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function crearSala(req, res) {
  try {
    const { playerName } = req.body

    if (!playerName) {
      return res.status(400).json({ error: 'El nombre del jugador es requerido' })
    }

    const playerId = uuidv4()
    const roomCode = generateRoomCode()

    loteriaService.createRoom(roomCode, playerId, playerName)
    const room = loteriaService.joinRoom(roomCode, playerId, playerName)
    const player = room.players.find((p) => p.id === playerId)

    res.status(201).json({
      roomCode,
      playerId,
      playerName,
      isHost: true,
      card: player?.board || [],
      players: room.players.map((p) => ({ id: p.id, name: p.name })),
      drawnCards: room.drawnCards || [],
      gameStarted: room.gameStarted,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function unirseSala(req, res) {
  try {
    const { roomCode, playerName } = req.body

    if (!roomCode || !playerName) {
      return res.status(400).json({ error: 'Código de sala y nombre del jugador son requeridos' })
    }

    const playerId = uuidv4()
    const room = loteriaService.joinRoom(roomCode, playerId, playerName)
    const player = room.players.find((p) => p.id === playerId)

    res.status(200).json({
      roomCode,
      playerId,
      playerName,
      isHost: room.creatorId === playerId,
      card: player?.board || [],
      players: room.players.map((p) => ({ id: p.id, name: p.name })),
      drawnCards: room.drawnCards || [],
      gameStarted: room.gameStarted,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function obtenerSala(req, res) {
  try {
    const { roomCode } = req.params

    const room = loteriaService.getRoom(roomCode)

    res.json({
      code: room.code,
      players: room.players.map((p) => ({ id: p.id, name: p.name })),
      drawnCards: room.drawnCards,
      gameStarted: room.gameStarted,
      winner: room.winner,
    })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}