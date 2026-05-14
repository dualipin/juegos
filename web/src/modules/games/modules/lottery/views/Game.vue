<template>
  <div class="min-h-screen p-6 pt-20">
    <!-- Encabezado -->
    <header class="mb-10">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="font-display text-4xl font-black">LOTERÍA</h1>
          <p class="text-sm text-base-content/60">
            Sala: <span class="font-mono font-bold text-error">{{ store.roomCode }}</span>
            <span v-if="store.isHost" class="ml-2 badge badge-outline badge-sm">Eres el anfitrión</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="store.isHost"
            @click="handleResetRoom"
            class="btn btn-sm btn-outline btn-warning"
            title="Reiniciar sala (todos los jugadores recibirán un nuevo cartón)"
          >
            Reiniciar sala
          </button>
          <button
            v-if="store.isHost"
            @click="handleDeleteRoom"
            class="btn btn-sm btn-outline btn-error"
            title="Eliminar sala permanentemente"
          >
            Eliminar sala
          </button>
          <span v-if="!store.connected" class="badge badge-warning">
            <span class="loading loading-spinner loading-sm"></span>
            Reconectando...
          </span>
          <span v-else class="badge badge-success">Conectado</span>
          <button
            @click="handleLeaveRoom"
            class="btn btn-error btn-sm"
            title="Salir de la sala"
          >
            Salir
          </button>
        </div>
      </div>
    </header>

    <!-- Botón de Lotería (si es completo) -->
    <div v-if="store.isCardComplete" class="mb-6 flex justify-center">
      <button
        @click="declareBingo"
        class="btn btn-lg btn-success gap-2 text-white font-display animate-pulse"
      >
        <span class="text-3xl">🎉</span>
        ¡LOTERÍA!
      </button>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Botón lanzar (solo host) -->
      <div v-if="store.isHost" class="lg:col-span-2 order-1">
        <div class="card bg-base-100 shadow-lg border border-base-200">
          <div class="card-body">
            <h3 class="card-title text-base-content">Eres el anfitrión</h3>
            <p class="text-sm text-base-content/60 mb-4">
              Cartas lanzadas: <span class="font-bold">{{ store.drawnElements.length }} / {{ maxCards }}</span>
            </p>
            <button
              @click="handleDraw"
              :disabled="!store.connected || store.drawnElements.length >= maxCards || isDrawing"
              class="btn btn-lg btn-primary gap-2 w-full font-display"
            >
              <span v-if="isDrawing" class="loading loading-spinner"></span>
              <span class="text-2xl">🎴</span>
              {{ isDrawing ? 'Lanzando...' : 'Lanzar carta' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Panel principal: Cartas lanzadas -->
      <div class="lg:col-span-2 space-y-6 order-3 lg:order-2">
        <div class="card bg-base-100 shadow-lg border border-base-200">
          <div class="card-body">
            <h3 class="card-title text-base-content mb-4">Cartas lanzadas</h3>
            <div v-if="store.drawnElements.length === 0" class="text-center py-8 text-base-content/40">
              <p class="text-lg">Esperando cartas...</p>
            </div>
            <div v-else class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              <div
                v-for="card in store.drawnElements"
                :key="card"
                class="flex items-center justify-center aspect-3/4.5 overflow-hidden rounded-lg bg-linear-to-br from-error/20 to-error/10 border"
              >
                <img
                  :src="cardImage(card)"
                  :alt="cardLabel(card)"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel derecho: Mi cartón y jugadores -->
      <div class="space-y-6 order-2 lg:order-3">
        <!-- Mi cartón (4x4) -->
        <div class="card bg-base-100 shadow-lg border-2 border-success">
          <div class="card-body">
            <h3 class="card-title text-base-content">Mi cartón</h3>
            <div class="grid grid-cols-4 gap-1 mt-4">
              <div
                v-for="card in store.card"
                :key="card"
                :class="[
                  'flex items-center justify-center aspect-3/4.5 overflow-hidden rounded transition-all duration-300 relative',
                  store.drawnElements.includes(card)
                    ? 'border border-primary'
                    : 'bg-base-200 text-base-content border-2 border-base-300',
                ]"
              >
                <img
                  :src="cardImage(card)"
                  :alt="cardLabel(card)"
                  class="h-full w-full object-cover"
                  :class="store.drawnElements.includes(card) ? 'opacity-100' : 'opacity-25 hover:opacity-50'"
                  loading="lazy"
                />
                <!-- Frijolito cuando la carta está marcada -->
                <div
                  v-if="store.drawnElements.includes(card)"
                  class="absolute inset-0 flex items-center justify-center text-4xl"
                >
                  <span class="text-2xl sm:text-5xl brightness-50">🫘</span>
                </div>
              </div>
            </div>
            <div
              v-if="store.isCardComplete"
              class="mt-4 alert alert-success"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>¡Cartón completo! ¡Presiona LOTERÍA!</span>
            </div>
          </div>
        </div>

        <!-- Jugadores conectados -->
        <div class="card bg-base-100 shadow-lg border border-base-200">
          <div class="card-body">
            <h3 class="card-title text-base-content">Jugadores</h3>
            <div class="space-y-2">
              <div
                v-for="player in store.playersList"
                :key="player.id"
                :class="[
                  'flex items-center gap-2 p-2 rounded-lg transition-colors',
                  player.id === store.playerId
                    ? 'bg-primary/20 text-primary font-bold'
                    : 'bg-base-200 text-base-content',
                ]"
              >
                <span v-if="player.isHost" class="badge badge-warning">👑</span>
                <span class="flex-1 truncate">{{ player.name }}</span>
                <span v-if="player.id === store.playerId" class="badge badge-sm">TÚ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de ganador -->
    <div v-if="store.winner" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="card bg-base-100 shadow-2xl max-w-md w-full">
        <div class="card-body text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="card-title justify-center text-2xl text-success mb-2">
            ¡{{ store.winner }} ganó!
          </h2>
          
          <div class="text-base-content/70 mb-6">
            <p v-if="store.isHost" class="font-medium">
              ¡Felicidades! Como anfitrión, puedes iniciar una nueva partida para todos.
            </p>
            <p v-else>
              Espera a que el anfitrión reinicie la partida o puedes salir si lo prefieres.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button 
              v-if="store.isHost" 
              @click="handleNewGame" 
              class="btn btn-success flex-1"
            >
              Jugar de nuevo
            </button>
            <button @click="handleLeaveRoom" class="btn btn-ghost flex-1">
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useToastStore } from '@/stores'
import { connectWebSocket, sendMessage, disconnectWebSocket } from '../services/socket'
import { speakCard } from '../utils/textToSpeech'
import { getLotteryCard, lotteryCards } from '../data/cards'
import { roomServices } from '../services/room-services'

const router = useRouter()
const store = useGameStore()
const toast = useToastStore()
const isDrawing = ref(false)
const maxCards = lotteryCards.length

function cardImage(card: string) {
  return getLotteryCard(card)?.image ?? `/loteria/${card}.jpeg`
}

function cardLabel(card: string) {
  return getLotteryCard(card)?.nombre ?? `Carta ${card}`
}

onMounted(() => {
  // Validar que estemos conectados
  if (!store.roomCode || !store.playerId) {
    toast.show('Debes unirte a una sala primero', 'error')
    router.push({ name: 'games.lottery' })
    return
  }

  // Conectar WebSocket
  connectWebSocket(store.roomCode, store.playerId, handleWebSocketMessage)

  // Refrescar datos del servidor por si acaso (reconexión)
  refreshPlayerData()

  // Limpiar voces de síntesis al cargar
  window.speechSynthesis.getVoices()
})

onBeforeUnmount(() => {
  disconnectWebSocket()
})

function handleWebSocketMessage(data: any) {
  switch (data.type) {
    case 'connected': {
      store.setConnected(true)
      if (data.creatorId) {
        store.setCreatorId(data.creatorId)
      }
      if (data.players) {
        store.updatePlayers(data.players)
      }
      if (data.drawnCards) {
        // Limpiar y actualizar cartas
        store.drawnElements = []
        data.drawnCards.forEach((card: string) => {
          store.drawCard(card)
        })
      }
      if (data.winner) {
        store.setWinner(data.winner)
        toast.show(`¡El juego ha terminado! Ganador: ${data.winner}`, 'info')
      }
      break
    }

    case 'cardDrawn': {
      const card = data.card
      store.drawCard(card)
      // Reproducir el nombre de la carta en voz
      speakCard(card)

      // Vibración: simple si se lanza, doble si la tengo
      if ('vibrate' in navigator) {
        if (store.card.includes(card)) {
          // Doble pulso si la tengo en mi cartón
          navigator.vibrate([200, 100, 200])
        } else {
          // Pulso simple si no la tengo
          navigator.vibrate(100)
        }
      }
      break
    }

    case 'roomReset': {
      store.handleRoomReset(data)
      toast.show('¡La sala ha sido reiniciada! Todos tienen cartones nuevos.', 'success')
      // Pedir al servidor mi nuevo cartón (podemos forzar una petición o el server puede enviarlo en roomReset)
      // En este caso, el server actualiza la DB, así que podemos simplemente volver a unirnos o el server podría enviar el cartón individualmente.
      // Mejor: el server envía 'roomReset' y luego cada uno puede pedir su estado o el server hace push.
      // Para simplificar, haremos que el componente pida su cartón actual si detecta un reset.
      refreshPlayerData()
      break
    }

    case 'playerConnected': {
      if (data.creatorId) {
        store.setCreatorId(data.creatorId)
      }
      store.updatePlayers(data.players)
      toast.show(`${data.playerName} se ha unido`, 'info')
      break
    }

    case 'playerDisconnected': {
      if (data.creatorId) {
        store.setCreatorId(data.creatorId)
      }
      store.updatePlayers(data.players)
      toast.show(`${data.playerName || 'Un jugador'} se ha desconectado`, 'warning')
      break
    }

    case 'disconnected': {
      store.setConnected(false)
      break
    }

    case 'winner': {
      store.setWinner(data.winnerName)
      toast.show(`¡BINGO! ${data.winnerName} ha ganado la lotería`, 'success')
      break
    }

    case 'bingoFailed': {
      toast.show(data.message, 'error')
      break
    }

    case 'error': {
      toast.show(data.message, 'error')
      break
    }

    case 'roomDeleted': {
      toast.show('La sala ha sido eliminada por el anfitrión', 'warning')
      store.resetGame()
      disconnectWebSocket()
      router.push({ name: 'games.lottery' })
      break
    }
  }
}

async function refreshPlayerData() {
  try {
    const roomService = roomServices()
    const response = await roomService.joinRoom(store.roomCode, store.playerName, store.playerId)
    store.updateCard(response.card)
  } catch (err) {
    console.error('Error refreshing player data:', err)
  }
}

function handleDraw() {
  isDrawing.value = true
  // Vibración táctil inmediata al presionar
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
  sendMessage({ action: 'draw' })
  setTimeout(() => {
    isDrawing.value = false
  }, 500)
}

function handleResetRoom() {
  if (confirm('¿Estás seguro de reiniciar la sala? Todos los jugadores recibirán un cartón nuevo.')) {
    sendMessage({ action: 'resetRoom' })
  }
}

function handleDeleteRoom() {
  if (confirm('¿EstÁS SEGURO? Esta acción eliminará la sala permanentemente para todos los jugadores.')) {
    sendMessage({ action: 'deleteRoom' })
  }
}

function declareBingo() {
  sendMessage({ action: 'bingo' })
}

function handleNewGame() {
  // En lugar de salir, el host puede simplemente reiniciar si quiere seguir en la misma sala
  if (store.isHost) {
    handleResetRoom()
    store.setWinner(null)
  } else {
    store.resetGame()
    router.push({ name: 'games.lottery' })
  }
}

function handleLeaveRoom() {
  store.resetGame()
  disconnectWebSocket()
  router.push({ name: 'games.lottery' })
}
</script>