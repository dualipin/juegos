import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Player {
  id: string
  name: string
}

export interface LotteryState {
  roomCode: string
  playerId: string
  playerName: string
  creatorId: string
  isHost: boolean
  card: string[]
  drawnElements: string[]
  players: Player[]
  winner: string | null
  connected: boolean
  gameStarted: boolean
}

export const useGameStore = defineStore('lotteryGame', () => {
  const roomCode = ref('')
  const playerId = ref('')
  const playerName = ref('')
  const creatorId = ref('')
  const isHost = ref(false)
  const card = ref<string[]>([])
  const drawnElements = ref<string[]>([])
  const players = ref<Player[]>([])
  const winner = ref<string | null>(null)
  const connected = ref(false)
  const gameStarted = ref(false)

  // Computed properties
  const isCardComplete = computed(() => card.value.every((el) => drawnElements.value.includes(el)))

  const playersList = computed(() => 
    players.value.map((p) => ({
      ...p,
      isCurrentPlayer: p.id === playerId.value,
      isHost: p.id === creatorId.value,
    }))
  )

  function initializeGame(data: {
    roomCode: string
    playerId: string
    playerName: string
    creatorId?: string
    isHost: boolean
    card: string[]
    players?: Player[]
    drawnCards?: string[]
  }) {
    roomCode.value = data.roomCode
    playerId.value = data.playerId
    playerName.value = data.playerName
    creatorId.value = data.creatorId || ''
    isHost.value = data.isHost
    card.value = data.card || []
    players.value = data.players || [{ id: data.playerId, name: data.playerName }]
    drawnElements.value = data.drawnCards || []
    connected.value = true
  }

  function addPlayer(player: Player) {
    if (!players.value.find((p) => p.id === player.id)) {
      players.value.push(player)
    }
  }

  function drawCard(cardValue: string) {
    if (!drawnElements.value.includes(cardValue)) {
      drawnElements.value.push(cardValue)
    }
  }

  function setWinner(winnerName: string) {
    winner.value = winnerName
  }

  function updatePlayers(newPlayers: Player[]) {
    players.value = newPlayers
  }

  function setConnected(state: boolean) {
    connected.value = state
  }

  function setCreatorId(id: string) {
    creatorId.value = id
  }

  function setIsHost(state: boolean) {
    isHost.value = state
  }

  function setGameStarted(state: boolean) {
    gameStarted.value = state
  }

  function resetGame() {
    roomCode.value = ''
    playerId.value = ''
    playerName.value = ''
    creatorId.value = ''
    isHost.value = false
    card.value = []
    drawnElements.value = []
    players.value = []
    winner.value = null
    connected.value = false
    gameStarted.value = false
  }

  return {
    // State
    roomCode,
    playerId,
    playerName,
    creatorId,
    isHost,
    card,
    drawnElements,
    players,
    winner,
    connected,
    gameStarted,
    // Computed
    isCardComplete,
    playersList,
    // Methods
    initializeGame,
    addPlayer,
    drawCard,
    setWinner,
    updatePlayers,
    setConnected,
    setCreatorId,
    setIsHost,
    setGameStarted,
    resetGame,
  }
})
