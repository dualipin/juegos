<template>
  <div class="min-h-screen flex flex-col items-center py-10 px-4 overflow-x-hidden pt-32">
    <!-- Hero -->
    <div class="text-center mb-8 z-10">
      <p class="text-xs tracking-[0.35em] uppercase mb-2 font-medium text-warning">
        ¡El juego de todos!
      </p>
      <h1 class="font-display text-6xl font-black leading-none tracking-tight text-error">
        <span class="ornament">✦</span>Lotería<span class="ornament">✦</span>
      </h1>
      <p class="mt-2 italic text-base-content/60 font-serif">La que ya conoces, ahora en línea</p>
    </div>

    <!-- Film Strip 1 -->
    <FilmStrip :cartas="firstHalf" direction="forward" class="mb-8" />

    <!-- Formulario -->
    <div class="card bg-base-100 shadow-xl w-full max-w-md relative overflow-hidden border border-base-200">
      <!-- Barra decorativa superior -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-error via-warning to-success" />

      <div class="card-body pt-7 gap-5">
        <!-- Nombre del jugador -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-xs tracking-widest uppercase font-semibold opacity-60">Nombre del
              jugador</span>
          </label>
          <input ref="nameInput" v-model="playerName" type="text" placeholder="Ej: María Félix"
            class="input input-bordered w-full font-serif text-base" @keyup.enter="handleAction" />
        </div>

        <!-- Crear / Unirse -->
        <div class="grid grid-cols-2 gap-3">
          <button type="button" @click="action = 'create'" :class="[
            'btn font-display text-sm tracking-wide',
            action === 'create' ? 'btn-error text-white' : 'btn-ghost border border-base-300',
          ]">
            Crear sala
          </button>
          <button type="button" @click="action = 'join'" :class="[
            'btn font-display text-sm tracking-wide',
            action === 'join' ? 'btn-error text-white' : 'btn-ghost border border-base-300',
          ]">
            Unirse
          </button>
        </div>

        <!-- Código de sala (condicional) -->
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0">
          <div v-if="action === 'join'" class="form-control">
            <label class="label">
              <span class="label-text text-xs tracking-widest uppercase font-semibold opacity-60">Código de sala</span>
            </label>
            <input v-model="roomCode" type="text" placeholder="Ej: A1B2C3"
              class="input input-bordered w-full text-center font-display text-xl tracking-[0.2em] uppercase"
              @keyup.enter="handleAction" />
          </div>
        </Transition>

        <!-- Submit -->
        <button type="button" @click="handleAction" :disabled="!canSubmit || isLoading"
          class="btn btn-success text-white font-display tracking-widest text-sm w-full">
          <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
          {{ isLoading ? 'Conectando...' : 'Continuar →' }}
        </button>

        <!-- Error -->
        <div v-if="error" role="alert" class="alert alert-error text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 stroke-current" fill="none"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Film Strip 2 -->
    <FilmStrip :cartas="secondHalf" direction="reverse" class="mt-8" />

    <!-- Salas disponibles -->
    <div class="w-full max-w-md mt-8">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-1 h-px bg-base-300" />
        <h2 class="font-display text-lg font-bold">Salas activas</h2>
        <div class="flex-1 h-px bg-base-300" />
      </div>
      <p class="text-center text-xs text-base-content/50 mb-4">Haz clic en una sala para unirte</p>

      <div v-if="rooms.length === 0"
        class="border border-dashed border-base-300 rounded-xl p-8 text-center text-base-content/40 text-sm">
        No hay salas disponibles en este momento
      </div>

      <ul v-else class="space-y-2">
        <li v-for="room in rooms" :key="room.code" @click="autoJoinRoom(room.code)"
          class="flex items-center justify-between px-4 py-3 rounded-xl border border-base-200 bg-base-100 cursor-pointer hover:border-error hover:bg-base-200 transition-all group">
          <div class="flex items-center gap-3">
            <span class="font-display text-lg font-bold tracking-widest text-error">
              {{ room.code }}
            </span>
            <span class="badge badge-ghost text-xs">
              {{ room.playerCount }} {{ room.playerCount === 1 ? 'jugador' : 'jugadores' }}
            </span>
            <span v-if="room.winner" class="badge badge-warning text-xs">Finalizada</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-base-content/30 group-hover:text-error transition-colors" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useToastStore } from '@/stores'
import { roomServices } from '../services/room-services'
import FilmStrip from '../components/FilmStrip.vue'
import { lotteryCards } from '../data/cards'

const router = useRouter()
const store = useGameStore()
const toast = useToastStore()
const roomService = roomServices()

const images = lotteryCards.map((card) => ({
  image: card.image,
  n: card.numero,
}))

const half = Math.ceil(images.length / 2)
const firstHalf = computed(() => images.slice(0, half))
const secondHalf = computed(() => images.slice(half))

const { playerName } = storeToRefs(store)
const roomCode = ref('')
const action = ref<'create' | 'join' | null>(null)
const error = ref('')
const isLoading = ref(false)
const rooms = ref<any[]>([])
const nameInput = ref<HTMLInputElement | null>(null)

const canSubmit = computed(() => {
  if (!playerName.value || !action.value) return false
  if (action.value === 'join' && !roomCode.value) return false
  return true
})

onMounted(async () => {
  await loadRooms()
})

async function loadRooms() {
  try {
    const data = await roomService.getAllRooms()
    rooms.value = data
  } catch (err: any) {
    console.error('Error loading rooms:', err)
  }
}

async function handleAction() {
  if (!canSubmit.value || isLoading.value) return

  error.value = ''
  isLoading.value = true

  try {
    const savedSession = roomCode.value ? store.getSavedSession(roomCode.value) : null
    const playerIdToUse = savedSession?.playerId

    if (action.value === 'create') {
      const response = await roomService.createRoom(playerName.value, playerIdToUse)
      store.initializeGame({
        roomCode: response.roomCode,
        playerId: response.playerId,
        playerName: response.playerName,
        creatorId: response.creatorId,
        isHost: response.isHost,
        card: response.card,
        players: response.players,
        drawnCards: response.drawnCards || [],
      })
      toast.show(`¡Sala creada! Código: ${response.roomCode}`, 'success')
      router.push({ name: 'games.lottery.game' })
    } else if (action.value === 'join') {
      const response = await roomService.joinRoom(roomCode.value, playerName.value, playerIdToUse)
      store.initializeGame({
        roomCode: response.roomCode,
        playerId: response.playerId,
        playerName: response.playerName,
        creatorId: response.creatorId,
        isHost: response.isHost,
        card: response.card,
        players: response.players,
        drawnCards: response.drawnCards,
      })
      toast.show(`¡Unido a la sala ${response.roomCode}!`, 'success')
      router.push({ name: 'games.lottery.game' })
    }
  } catch (err: any) {
    console.error('Error:', err)
    error.value = err.response?.data?.error || err.message || 'Error al conectar con el servidor'
    toast.show(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}

async function autoJoinRoom(code: string) {
  roomCode.value = code
  action.value = 'join'

  if (!playerName.value) {
    nameInput.value?.focus()
    toast.show('Por favor, ingresa tu nombre para unirte', 'info')
    return
  }

  await handleAction()
}
</script>

<style scoped></style>