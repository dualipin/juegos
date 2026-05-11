<template>
  <div class="relative flex flex-col items-center justify-center p-4">
    <!-- Partículas de fondo (Selva) -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div v-for="i in particleCount" :key="i"
        class="particle absolute rounded-full bg-emerald-400/30 dark:bg-emerald-600/20"></div>
    </div>

    <!-- Contenedor principal -->
    <div class="z-10 flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-start">
      <!-- Tablero de juego -->
      <div class="relative">
        <div
          class="game-board rounded-xl border-4 border-amber-900/50 bg-emerald-50/90 p-1 shadow-2xl backdrop-blur-sm dark:border-amber-700/50 dark:bg-emerald-950/50">
          <div v-for="y in gridSize" :key="y" class="row flex">
            <div v-for="x in gridSize" :key="x"
              class="cell flex h-[13px] w-[13px] sm:h-6 sm:w-6 md:h-8 md:w-8 items-center justify-center border border-emerald-200/20 transition-all duration-200 dark:border-emerald-800/20"
              :class="[
                isSnake(x - 1, y - 1) ? snakeCellClass : '',
                { 'scale-110': isFood(x - 1, y - 1) || isKnife(x - 1, y - 1) },
              ]">
              <span v-if="isFood(x - 1, y - 1)" class="food-icon animate-bounce text-[10px] sm:text-base md:text-xl">
                {{ getFoodEmoji(x - 1, y - 1) }}
              </span>
              <span v-if="isKnife(x - 1, y - 1)" class="knife-icon animate-pulse text-[10px] sm:text-base md:text-xl">
                🔪
              </span>
            </div>
          </div>
        </div>

        <!-- Efecto de borde animado -->
        <div class="animate-border pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent"></div>

        <!-- Controles Móviles (D-Pad) -->
        <div class="mt-8 flex flex-col items-center justify-center md:hidden">
          <!-- Fila superior -->
          <button @click="setDirection('up')"
            class="mb-1 flex h-16 w-16 items-center justify-center rounded-t-2xl bg-emerald-600 text-white shadow-lg active:scale-95 active:bg-emerald-700 transition-all duration-100 hover:bg-emerald-500">
            <ChevronUpIcon class="h-8 w-8" />
          </button>

          <!-- Fila central -->
          <div class="flex gap-1">
            <button @click="setDirection('left')"
              class="flex h-16 w-16 items-center justify-center rounded-l-2xl bg-emerald-600 text-white shadow-lg active:scale-95 active:bg-emerald-700 transition-all duration-100 hover:bg-emerald-500">
              <ChevronLeftIcon class="h-8 w-8" />
            </button>
            <div
              class="h-16 w-16 bg-emerald-700/40 rounded-xl shadow-inner flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <span class="text-2xl font-bold">◆</span>
            </div>
            <button @click="setDirection('right')"
              class="flex h-16 w-16 items-center justify-center rounded-r-2xl bg-emerald-600 text-white shadow-lg active:scale-95 active:bg-emerald-700 transition-all duration-100 hover:bg-emerald-500">
              <ChevronRightIcon class="h-8 w-8" />
            </button>
          </div>

          <!-- Fila inferior -->
          <button @click="setDirection('down')"
            class="mt-1 flex h-16 w-16 items-center justify-center rounded-b-2xl bg-emerald-600 text-white shadow-lg active:scale-95 active:bg-emerald-700 transition-all duration-100 hover:bg-emerald-500">
            <ChevronDownIcon class="h-8 w-8" />
          </button>
        </div>
      </div>

      <!-- Panel de información -->
      <div
        class="info-panel w-full max-w-md rounded-xl border border-amber-200/50 bg-white/80 p-6 shadow-2xl backdrop-blur-sm dark:border-amber-900/50 dark:bg-gray-900/80">
        <div class="space-y-6">
          <!-- Puntuación -->
          <div class="rounded-lg bg-emerald-100/70 p-4 dark:bg-emerald-900/30">
            <h3 class="mb-1 text-sm font-semibold tracking-wider text-emerald-800 uppercase dark:text-emerald-300">
              Puntuación
            </h3>
            <p class="text-4xl font-black text-emerald-900 dark:text-emerald-100">{{ puntuacion }}</p>
          </div>

          <!-- Skins -->
          <div class="rounded-lg bg-gray-200/70 p-4 dark:bg-gray-800/50">
            <h3 class="mb-2 text-sm font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Apariencia
            </h3>
            <div class="flex flex-wrap gap-2">
              <button v-for="skin in snakeStore.unlockedSkins" :key="skin" @click="snakeStore.selectSkin(skin)"
                class="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm capitalize transition"
                :class="skinButtonClass(skin)">
                <span class="inline-block h-3 w-3 rounded-sm" :class="skinSwatchClass(skin)"></span>
                {{ skin }}
              </button>
            </div>
          </div>

          <!-- Controles -->
          <div class="grid grid-cols-2 gap-3">
            <button @click="startGame"
              class="flex transform items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-emerald-500 active:scale-95">
              <PlayCircleIcon class="h-5 w-5" />
              INICIAR
            </button>
            <button @click="stopGame"
              class="flex transform items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-amber-500 active:scale-95">
              <PauseCircleIcon class="h-5 w-5" />
              PAUSAR
            </button>
            <button @click="resetGame"
              class="col-span-2 flex transform items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-rose-500 active:scale-95">
              <RefreshCwIcon class="h-5 w-5" />
              REINICIAR
            </button>
          </div>

          <!-- Recompensas -->
          <div class="rounded-lg bg-gray-200/70 p-4 dark:bg-gray-800/50">
            <h3 class="mb-3 text-sm font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Logros en la Selva
            </h3>
            <div class="flex min-h-10 flex-wrap gap-2">
              <span v-for="r in snakeStore.rewards" :key="r"
                class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                🏆 {{ r }}
              </span>
              <span v-if="snakeStore.rewards.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
                ¡Aún no has logrado nada!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Banner de victoria -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100">
      <div v-if="juegoGanado"
        class="fixed inset-x-0 bottom-6 z-50 mx-auto w-[90%] max-w-lg rounded-xl border border-emerald-400/40 bg-emerald-600/90 p-5 text-white shadow-2xl backdrop-blur-sm">
        <div class="flex items-start gap-3">
          <SparklesIcon class="mt-1 h-6 w-6 flex-shrink-0" />
          <div class="flex-1">
            <h4 class="text-lg font-extrabold">¡Victoria Legendaria!</h4>
            <p class="text-sm opacity-90">
              Has dominado la selva. ¡La Bejuquilla es imbatible!
            </p>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Mobile: Inicio del juego -->
    <dialog id="modal_game_start" class="modal md:hidden">
      <div class="modal-box bg-emerald-50 dark:bg-emerald-950">
        <div class="mb-4 text-center">
          <h2 class="mb-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100">
            🐍 La Bejuquilla
          </h2>
          <p class="text-sm text-emerald-700 dark:text-emerald-300">
            Depredadora de la Selva
          </p>
        </div>

        <div class="space-y-4">
          <div class="rounded-lg bg-white/50 p-3 dark:bg-emerald-900/30">
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">
              🐭 <span class="ml-2">Caza ratones, ranas y aves</span>
            </p>
          </div>
          <div class="rounded-lg bg-white/50 p-3 dark:bg-emerald-900/30">
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">
              🔪 <span class="ml-2">Evita los cuchillos</span>
            </p>
          </div>
          <div class="rounded-lg bg-white/50 p-3 dark:bg-emerald-900/30">
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">
              📱 <span class="ml-2">Usa los controles en pantalla</span>
            </p>
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-2">

          <form method="dialog" class="w-full">
            <button @click="startGame" class="btn btn-primary w-full bg-emerald-600 text-white hover:bg-emerald-700">
              <PlayCircleIcon class="h-5 w-5" />
              ¡Juega Ahora!
            </button>
          </form>
          <button @click="goToGameList" class="btn btn-ghost w-full btn-error">
            Salir
          </button>
        </div>
      </div>
    </dialog>

    <!-- Modal Mobile: Game Over -->
    <dialog id="modal_game_over" class="modal md:hidden">
      <div class="modal-box bg-rose-50 dark:bg-rose-950">
        <div class="mb-4 text-center">
          <h2 class="mb-2 text-4xl">💀</h2>
          <h2 class="mb-2 text-2xl font-bold text-rose-900 dark:text-rose-100">
            ¡Game Over!
          </h2>
          <p class="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
            Puntuación: {{ puntuacion }}
          </p>
        </div>

        <div class="my-4 space-y-2 rounded-lg bg-white/50 p-3 dark:bg-rose-900/30">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            La Bejuquilla ha sido derrotada...
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            Pero la selva siempre ofrece otra oportunidad.
          </p>
        </div>

        <div class="mt-6 flex flex-col gap-2">
          <button @click="goToGameList" class="btn btn-ghost w-full text-gray-700 dark:text-gray-300">
            Salir
          </button>
          <form method="dialog" class="w-full">
            <button @click="resetGame" class="btn btn-primary w-full bg-emerald-600 text-white hover:bg-emerald-700">
              <RefreshCwIcon class="h-5 w-5" />
              Reintentar
            </button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script lang="ts" setup>
import { useSnakeGame } from '../composables/useSnakeGame'
import { onMounted, computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import {
  PauseCircleIcon,
  PlayCircleIcon,
  RefreshCwIcon,
  SparklesIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-vue-next'

const {
  snake,
  gridSize,
  puntuacion,
  startGame,
  stopGame,
  resetGame,
  comidas,
  cuchillos,
  juegoGanado,
  juegoPerdido,
  setDirection,
  snakeStore,
  rankingRef,
  gameStarted,
} = useSnakeGame()

const router = useRouter()

const goToGameList = () => {
  router.push({ name: 'games' })
}

// Detectar si es mobile
const md = ref(false)

const updateMediaQuery = () => {
  md.value = window.innerWidth < 768 // md breakpoint es 768px
}

// Watchers para mostrar/cerrar modales
watch(gameStarted, (newVal) => {
  if (!newVal && md.value) {
    const modal = document.getElementById('modal_game_start') as HTMLDialogElement
    modal?.showModal()
  } else {
    const modal = document.getElementById('modal_game_start') as HTMLDialogElement
    modal?.close()
  }
})

watch(juegoPerdido, (newVal) => {
  if (newVal && md.value) {
    const modal = document.getElementById('modal_game_over') as HTMLDialogElement
    modal?.showModal()
  }
})

// Apariencia: clases por skin
const snakeCellClass = computed(() => {
  switch (snakeStore.selectedSkin) {
    case 'quantum':
      return 'rounded-sm bg-gradient-to-br from-emerald-300 to-cyan-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
    case 'molecular':
      return 'rounded-sm bg-gradient-to-br from-purple-500 to-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]'
    case 'legendary':
      return 'rounded-sm bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
    default:
      // Skin por defecto: Verde Bejuquilla
      return 'rounded-sm bg-emerald-600 border border-emerald-400'
  }
})

const skinButtonClass = (skin: string) =>
  [
    snakeStore.selectedSkin === skin
      ? 'border-emerald-500 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
  ]

const particleCount = computed(() => (snakeStore.selectedSkin === 'legendary' ? 60 : 30))

const skinSwatchClass = (skin: string) => {
  switch (skin) {
    case 'quantum': return 'bg-gradient-to-br from-emerald-300 to-cyan-500'
    case 'molecular': return 'bg-gradient-to-br from-purple-500 to-pink-500'
    case 'legendary': return 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500'
    default: return 'bg-emerald-600'
  }
}

const isSnake = (x: number, y: number) => {
  return snake.value.some((segment) => segment.x === x && segment.y === y)
}

const isFood = (x: number, y: number) => {
  return comidas.value.some((c) => c.position.x === x && c.position.y === y)
}

const isKnife = (x: number, y: number) => {
  return cuchillos.value.some((k) => k.x === x && k.y === y)
}

const getFoodEmoji = (x: number, y: number) => {
  const comida = comidas.value.find((c) => c.position.x === x && c.position.y === y)
  return comida?.emoji ?? ''
}

// Animaciones con GSAP
onMounted(() => {
  // Verificar si es mobile
  updateMediaQuery()
  window.addEventListener('resize', updateMediaQuery)

  // Mostrar modal de inicio si es mobile
  if (md.value && !gameStarted.value) {
    setTimeout(() => {
      const modal = document.getElementById('modal_game_start') as HTMLDialogElement
      modal?.showModal()
    }, 300)
  }

  // Animación de partículas de fondo
  gsap.to('.particle', {
    x: () => gsap.utils.random(-100, 100),
    y: () => gsap.utils.random(-100, 100),
    duration: gsap.utils.random(5, 10),
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })

  // Animación de borde del tablero
  gsap.to('.animate-border', {
    borderColor: '#059669',
    borderWidth: '4px',
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut',
  })

  // Cleanup
  return () => {
    window.removeEventListener('resize', updateMediaQuery)
  }
})
</script>

<style scoped>
.game-board {
  display: inline-block;
  background-image: radial-gradient(circle, rgba(16, 185, 129, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.food-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.knife-icon {
  filter: drop-shadow(0 0 8px rgba(255, 0, 0, 0.4));
}

.particle {
  width: 20px;
  height: 20px;
  opacity: 0.5;
}

.particle:nth-child(even) {
  width: 10px;
  height: 10px;
}
</style>
