import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { router } from "./routes/index.js";
import { initializeDatabase } from "./db/init.js";
import LoteriaService from "./service/loteria.service.js";
import dotenv from "dotenv";
import { Console } from "console";
dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const port = 3000;

// Inicializar base de datos
console.log("Inicializando base de datos...");
initializeDatabase();
console.log("Base de datos inicializada ✓");

const loteriaService = new LoteriaService();

// Limpiar salas inactivas cada 5 minutos
setInterval(
  () => {
    try {
      loteriaService.cleanupInactiveRooms(15);
    } catch (error) {
      console.error("Error cleaning inactive rooms:", error);
    }
  },
  5 * 60 * 1000,
);

// Almacenar conexiones activas por sala
const roomConnections = new Map();

// Configurar CORS para desarrollo y producción
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://juegos-macuspana.vercel.app",
  process.env.WEB_HOST || "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api", router);

// WebSocket para Lotería
wss.on("connection", (ws, req) => {
  const urlParts = req.url.split("/");
  const roomCode = urlParts[urlParts.length - 2];
  const playerId = urlParts[urlParts.length - 1];

  if (!roomCode || !playerId) {
    ws.close();
    return;
  }

  // Agregar conexión a la sala
  if (!roomConnections.has(roomCode)) {
    roomConnections.set(roomCode, new Map());
  }
  roomConnections.get(roomCode).set(playerId, ws);

  // Obtener información del jugador y sala
  try {
    const room = loteriaService.getRoom(roomCode);
    const player = room.players.find((p) => p.id === playerId);

    if (!player) {
      ws.close();
      return;
    }

    loteriaService.markPlayerConnected(playerId, roomCode);
    const updatedRoom = loteriaService.getRoom(roomCode);
    const connectedPlayers = updatedRoom.players
      .filter((p) => p.connected)
      .map((p) => ({ id: p.id, name: p.name }));

    // Enviar estado actual al cliente que se conecta
    ws.send(
      JSON.stringify({
        type: "connected",
        roomCode,
        playerId,
        creatorId: updatedRoom.creatorId,
        players: connectedPlayers,
        drawnCards: updatedRoom.drawnCards,
        gameStarted: updatedRoom.gameStarted,
        winner: updatedRoom.winner,
      }),
    );

    // Notificar a otros jugadores que alguien se conectó
    broadcastToRoom(roomCode, playerId, {
      type: "playerConnected",
      playerId,
      playerName: player.name,
      creatorId: updatedRoom.creatorId,
      players: connectedPlayers,
    });
  } catch (error) {
    console.error("Error on connection:", error.message);
    ws.close();
    return;
  }

  // Manejar mensajes del cliente
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleLotteryMessage(message, roomCode, playerId, ws);
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  // Manejar desconexión
  ws.on("close", () => {
    const roomConnMap = roomConnections.get(roomCode);
    if (roomConnMap) {
      roomConnMap.delete(playerId);
      if (roomConnMap.size === 0) {
        roomConnections.delete(roomCode);
      }
    }

    // Notificar a otros que el jugador se desconectó
    try {
      const roomBefore = loteriaService.getRoom(roomCode);
      const player = roomBefore.players.find((p) => p.id === playerId);
      const playerName = player ? player.name : "Un jugador";

      loteriaService.removePlayer(playerId, roomCode);
      const room = loteriaService.getRoom(roomCode);
      const connectedPlayers = room.players
        .filter((p) => p.connected)
        .map((p) => ({ id: p.id, name: p.name }));
      broadcastToRoom(roomCode, null, {
        type: "playerDisconnected",
        playerId,
        playerName,
        creatorId: room.creatorId,
        players: connectedPlayers,
      });
    } catch (error) {
      console.error("Error on disconnect:", error);
    }
  });
});

/**
 * Manejar mensajes del juego de Lotería
 */
function handleLotteryMessage(message, roomCode, playerId, ws) {
  const { action } = message;

  try {
    const room = loteriaService.getRoom(roomCode);
    const player = room.players.find((p) => p.id === playerId);

    if (!player) {
      return;
    }

    switch (action) {
      case "draw": {
        const result = loteriaService.drawCard(roomCode, playerId);
        broadcastToRoom(roomCode, null, {
          type: "cardDrawn",
          card: result.card,
          drawnCount: result.drawnCount,
          totalCards: room.deck.length,
        });
        break;
      }

      case "bingo": {
        const hasWon = loteriaService.checkWin(roomCode, playerId);
        if (hasWon) {
          broadcastToRoom(roomCode, null, {
            type: "winner",
            winnerId: playerId,
            winnerName: player.name,
          });
        } else {
          ws.send(
            JSON.stringify({
              type: "bingoFailed",
              message: "No has completado tu cartón",
            }),
          );
        }
        break;
      }

      case "resetRoom": {
        const updatedRoom = loteriaService.resetRoom(roomCode, playerId);
        broadcastToRoom(roomCode, null, {
          type: "roomReset",
          roomCode: updatedRoom.code,
          gameStarted: updatedRoom.gameStarted,
          players: updatedRoom.players.map((p) => ({
            id: p.id,
            name: p.name,
            connected: p.connected,
          })),
          drawnCards: updatedRoom.drawnCards,
          winner: updatedRoom.winner,
        });
        break;
      }
      
      case "deleteRoom": {
        loteriaService.deleteRoom(roomCode, playerId);
        broadcastToRoom(roomCode, null, {
          type: "roomDeleted",
          roomCode,
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("Error handling message:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: error.message,
      }),
    );
  }
}

/**
 * Enviar mensaje a todos los jugadores de una sala
 */
function broadcastToRoom(roomCode, excludePlayerId, message) {
  const roomConnMap = roomConnections.get(roomCode);
  if (!roomConnMap) {
    return;
  }

  for (const [playerId, connection] of roomConnMap.entries()) {
    if (excludePlayerId && playerId === excludePlayerId) {
      continue;
    }
    if (connection.readyState === 1) {
      // 1 = OPEN
      connection.send(JSON.stringify(message));
    }
  }
}

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
