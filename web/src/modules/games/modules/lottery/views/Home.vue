<template>
  <div class="flex flex-col items-center justify-center py-20">
    <!-- Título principal -->
    <div class="mb-8 text-center">
      <h1 class="mb-4 flex items-center justify-center text-4xl font-bold">
        Lotería
      </h1>
      <p class="text-lg">
        La que ya conoces
      </p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleAction" class="w-full max-w-md space-y-6 rounded-xl border p-8 shadow-lg">
      <!-- Campo de nombre -->
      <div class="space-y-2">
        <label for="name" class="mb-2 block text-sm font-medium dark:text-white">
          Nombre del jugador:
        </label>
        <input v-model="playerName" type="text" id="name" required
          class="input input-bordered w-full"
          placeholder="Ej: Marie Curie" />
      </div>

      <!-- Acciones principales -->
      <div class="flex space-x-4">
        <button type="button" @click="action = 'create'" :class="[
          'focus:ring-opacity-50 flex-1 rounded-lg px-4 py-3 font-medium transition focus:ring-2',
          action === 'create'
            ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl active:scale-95'
            : 'border border-gray-200 text-gray-500 hover:border-blue-600 hover:text-blue-600 focus:border-blue-600 focus:text-blue-600 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-blue-600 dark:hover:text-blue-500 dark:focus:border-blue-600 dark:focus:text-blue-500',
        ]">
          Crear sala
        </button>
        <button type="button" @click="action = 'join'" :class="[
          'focus:ring-opacity-50 flex-1 rounded-lg px-4 py-3 font-medium transition focus:ring-2',
          action === 'join'
            ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl active:scale-95'
            : 'border border-gray-200 text-gray-500 hover:border-blue-600 hover:text-blue-600 focus:border-blue-600 focus:text-blue-600 focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-blue-600 dark:hover:text-blue-500 dark:focus:border-blue-600 dark:focus:text-blue-500',
        ]">
          Unirse a sala
        </button>
      </div>

      <!-- Campo de código de sala (condicional) -->
      <div v-if="action === 'join'" class="animate-fade-in space-y-2">
        <label for="room" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Código de sala:
        </label>
        <input v-model="roomCode" type="text" id="room" required
          class="block w-full rounded-lg border-gray-200 px-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 sm:py-3 sm:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:placeholder-gray-500 dark:focus:ring-gray-600"
          placeholder="Ej: A1B2C3" />
      </div>

      <!-- Botón de enviar -->
      <button type="submit" :disabled="!action"
        class="btn btn-primary w-full">
        Continuar
      </button>

      <!-- Mensaje de error -->
      <div v-if="error" role="alert" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>

    </form>

    <div class="mt-10">
      <div class="mb-6">
        <h2 class="text-2xl font-bold">Salas disponibles</h2>
        <p class="mt-2 text-sm">
          Selecciona una sala para unirte o crea una nueva.
        </p>
      </div>

      <div v-if="rooms.length === 0" class="rounded-lg">
        <p>No hay salas disponibles en este momento</p>
      </div>

      <ul v-else class="space-y-3">
        <li v-for="room in rooms" :key="room.room_code"
          class="group flex cursor-pointer items-center justify-between rounded-lg border" @click="
            () => {
              roomCode = room.room_code
              action = 'join'
            }
          ">
          <div class="flex items-center">
            <span class="font-mono font-medium">
              {{ room.room_code }}
            </span>
            <span class="ml-3 rounded-full">
              {{ room.length }} {{ room.length === 1 ? 'jugador' : 'jugadores' }}
            </span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </li>
      </ul>
    </div>
  </div>

  <ul>
    <li v-for="image in images" :key="image">
      <img :src="image" :alt="`Imagen ${image.split('/').pop()}`" class="w-32 h-32 object-contain rounded-lg" />
    </li>
  </ul>
</template>



<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import api from '@/services/api'
import { useAuthStore } from '@/modules/auth/stores/auth-store'
import { roomServices } from '../services/room-services'

const auth = useAuthStore()


const basePathImages = '/src/modules/games/modules/lottery/assets/img'


const images = Array.from({ length: 20 }, (_, i) => `${basePathImages}/${i + 1}.jpeg`)

const playerName = ref('')
const roomCode = ref('')
const action = ref<'create' | 'join' | null>(null)
const error = ref('')
const router = useRouter()
const store = useGameStore()

const roomService = roomServices()

const rooms = ref<
  {
    room_code: string
    length: number
  }[]
>([])

onMounted(async () => {
  try {
    const res = await roomService.getAllRooms()
    rooms.value = res.map((room: any) => ({
      room_code: room.room_code,
      length: room.players.length,
    }))
  } catch (err: any) {
    console.error(err)
    error.value = err.response?.data?.detail || 'Error al cargar las salas.'
  }
})

const URL = 'v1/games/lottery'

const handleAction = async () => {
  error.value = ''

  try {
    if (action.value === 'create') {
      const res = await api.post(`/${URL}/rooms`, { host_name: playerName.value })
      store.roomCode = res.data.room.room_code
      store.playerId = res.data.host_card.player_id
      store.playerName = playerName.value
      store.card = res.data.host_card.elements
      store.drawnElements = res.data.room.drawn_elements || []
      store.winner = res.data.room.winner?.player_name || null
      store.isHost = true
    } else if (action.value === 'join') {
      const res = await api.post(URL + '/join', {
        room_code: roomCode.value,
        player_name: playerName.value,
      })
      store.roomCode = roomCode.value
      store.playerId = res.data.player_card.player_id
      store.playerName = playerName.value
      store.card = res.data.player_card.elements
      store.isHost = false
      store.drawnElements = res.data.room.drawn_elements || []
      store.winner = res.data.room.winner?.player_name || null
      console.log(store.winner)
      console.log(store.drawnElements)
    }

    router.push({ name: 'games.lottery.game' })
  } catch (err: any) {
    console.error(err)
    error.value = err.response?.data?.detail || 'Error al conectar con el servidor.'
  }
}
</script>

<style>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}
</style>