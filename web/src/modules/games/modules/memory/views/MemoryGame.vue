<template>
  <div class="min-h-screen pt-5">
    <!-- Encabezado -->
    <header class="mx-auto mb-4 pt-10 px-3 sm:mb-6 md:mb-8 text-center">
      <h1 class="mb-1 text-3xl font-bold sm:text-4xl md:text-6xl">
        Memorama de Macuspana
      </h1>
      <p class="text-sm sm:text-base md:text-lg">
        Descubre la riqueza cultural, naturaleza y tradiciones de Macuspana
      </p>
    </header>

    <!-- Panel de juego -->
    <div class="mx-auto flex flex-col">
      <!-- Contadores - SEGUNDO EN MÓVIL -->
      <div class="order-2 md:order-1 mx-auto mb-4 grid gap-2 p-3 grid-cols-2 sm:grid-cols-4 md:mb-6 md:gap-3">
        <div class="stat bg-base-200 rounded-lg">
          <div class="stat-title text-xs sm:text-sm">Pares</div>
          <div class="stat-value text-lg sm:text-xl">{{ matchedPairs }}/{{ totalPairs }}</div>
        </div>
        <div class="stat bg-base-200 rounded-lg">
          <div class="stat-title text-xs sm:text-sm">Intentos</div>
          <div class="stat-value text-lg sm:text-xl">{{ attempts }}</div>
        </div>
        <div class="stat bg-base-200 rounded-lg">
          <div class="stat-title text-xs sm:text-sm">Tiempo</div>
          <div class="stat-value text-lg sm:text-xl" :class="timeLeft <= 10 ? 'text-error' : 'text-success'">{{ timeLeft
            }}s</div>
        </div>
        <div class="stat bg-base-200 rounded-lg">
          <div class="stat-title text-xs sm:text-sm">Puntos</div>
          <div class="stat-value text-lg sm:text-xl">{{ score }}</div>
        </div>
      </div>

      <!-- Controles - TERCERO EN MÓVIL -->
      <div
        class="order-3 md:order-2 mx-auto mb-3 flex flex-col gap-3 px-3 sm:mb-4 md:mb-6 md:flex-row md:justify-center md:items-end">
        <div class="form-control w-full sm:w-auto">
          <label class="label">
            <span class="label-text text-sm">Dificultad</span>
          </label>
          <select v-model="selectedDifficulty" class="select select-bordered select-sm">
            <option v-for="(diff, key) in difficulties" :key="key" :value="key">
              {{ diff.name }} ({{ diff.cards }} cartas - {{ diff.time }}s)
            </option>
          </select>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button @click="restartWithOptions" class="btn btn-success btn-sm flex-1 sm:flex-none">
            Nuevo
          </button>
          <button @click="resetGame" class="btn btn-ghost btn-sm flex-1 sm:flex-none">
            Reiniciar
          </button>
          <!-- Botón de Audio -->
          <button @click="toggleMusic" class="btn btn-circle btn-sm" :class="isMusicPlaying ? 'btn-primary' : 'btn-ghost'">
            <span v-if="isMusicPlaying">🔊</span>
            <span v-else>🔇</span>
          </button>
        </div>
      </div>

      <!-- Tablero de juego - PRIMERO EN MÓVIL -->
      <div class="order-1 md:order-3 flex justify-center p-2 sm:p-4">
        <div class="grid gap-2 sm:gap-3 md:gap-4 w-full px-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <div v-for="(card, index) in cards" :key="card.id" class="h-36 sm:h-40 md:h-56 cursor-pointer"
            @click="flipCard(index)" style="perspective: 1200px">
            <div class="relative h-full w-full transition-all duration-500 rounded-lg shadow-lg" :style="{
              transformStyle: 'preserve-3d',
              transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }">
              <!-- DORSO de la carta - visible en rotateY(0deg) -->
              <div :class="[
                'absolute inset-0 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center bg-base-300 text-base-content',
              ]" :style="{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }">
                <!-- <div class="text-4xl sm:text-5xl md:text-6xl mb-1 sm:mb-2 md:mb-3">🌴</div> -->
                <img :src="plataformaPetrolera" alt="Dorso de la carta"
                  class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-1 sm:mb-2 md:mb-3  rounded-full">
                <div class="text-xs sm:text-sm font-bold text-center">Macuspana</div>
              </div>

              <!-- FRENTE de la carta - visible en rotateY(180deg) -->
              <div
                class="absolute inset-0 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center bg-base-200 shadow-inner"
                :style="{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }">
                <!-- Imagen -->
                <div
                  class="w-full h-32 sm:h-40 md:h-48 flex items-center justify-center rounded-lg overflow-hidden mb-2">
                  <img v-if="card.image" :src="card.image" :alt="card.name" class="w-full h-full object-cover" />
                  <span v-else class="text-5xl sm:text-6xl md:text-7xl">{{ card.icon }}</span>
                </div>

                <!-- Nombre -->
                <div class="w-full text-center">
                  <h3 class="text-sm sm:text-base font-bold line-clamp-2">
                    {{ card.name }}
                  </h3>
                </div>
              </div>

              <!-- FRENTE de la carta - Mostrar descripción -->
              <div v-if="false"
                class="absolute inset-0 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center bg-base-200 shadow-inner overflow-hidden"
                :style="{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }">
                <div class="w-full text-center h-full flex flex-col items-center justify-center">
                  <p class="text-xs sm:text-sm text-base-content leading-snug line-clamp-8 overflow-hidden">
                    {{ card.funFact }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      <!-- Modal de victoria -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="gameWon" class="modal modal-open">
            <div class="modal-box max-w-sm sm:max-w-md text-center">
              <div class="mb-2 sm:mb-4 text-5xl sm:text-6xl">🎉</div>
              <h2 class="mb-1 sm:mb-2 text-xl sm:text-2xl font-bold">¡Ganaste!</h2>
              <p class="mb-3 sm:mb-4 text-xs sm:text-sm">
                Completaste el memorama en {{ attempts }} intentos
              </p>
              <div class="alert alert-warning mb-4 sm:mb-6">
                <p class="text-base sm:text-lg font-bold">
                  Puntuación: {{ score }}
                </p>
              </div>
              <div v-if="rewards.length" class="mb-4 sm:mb-6">
                <p class="mb-2 text-xs sm:text-sm font-semibold">Recompensas:</p>
                <div class="flex flex-wrap justify-center gap-1 sm:gap-2">
                  <span v-for="r in rewards" :key="r" class="badge badge-sm sm:badge-lg badge-secondary">🏅 {{ r
                    }}</span>
                </div>
              </div>
              <button @click="restartWithOptions" class="btn btn-success btn-sm w-full">
                Jugar de Nuevo
              </button>
            </div>
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import JSConfetti from 'js-confetti'
import { useMemoryGame } from '../composables/useMemoryGame'
import plataformaPetrolera from '../assets/plataforma-petrolera.png'
import cancion from '../assets/cancion.mp3'

const {
  initializeGame,
  cards,
  resetGame,
  sendRanking,
  gameWon,
  attempts,
  flipCard: flipCardComposable,
  flippedCards,
  matchedPairs,
  totalPairs,
  score,
  rewards,
  user,
  theme,
  timeLeft,
} = useMemoryGame()

// Audio
const isMusicPlaying = ref(false)
const audio = new Audio(cancion)
audio.loop = true

const toggleMusic = () => {
  if (isMusicPlaying.value) {
    audio.pause()
  } else {
    audio.play().catch(e => console.log('Autoplay blocked, waiting for interaction', e))
  }
  isMusicPlaying.value = !isMusicPlaying.value
}

// Definir niveles de dificultad
const difficulties = {
  easy: { name: '🟢 Fácil', cards: 8, time: 70 },
  medium: { name: '🟡 Medio', cards: 12, time: 55 },
  hard: { name: '🔴 Difícil', cards: 16, time: 45 },
}

const selectedDifficulty = ref<keyof typeof difficulties>('medium')

const restartWithOptions = () => {
  const difficulty = difficulties[selectedDifficulty.value]
  initializeGame({
    elementsCount: difficulty.cards,
    duration: difficulty.time,
  })
}

const flipCard = (index: number) => {
  flipCardComposable(index)
}

watch(gameWon, async (won) => {
  if (won) {
    const jsConfetti = new JSConfetti()
    jsConfetti.addConfetti({
      emojis: ['🎉', '🥳', '🎊', '🌴', '🌊', '🐆'],
      confettiNumber: 100,
      emojiSize: 50,
    })
  }

  try {
    const ranking = {
      name: 'memory',
      user: Number(user.user!.id),
      score: score.value,
      username: user.user!.full_name,
    }
    await sendRanking(ranking)
    console.log('Ranking enviado exitosamente')
  } catch (error) {
    console.error('Error al enviar el ranking:', error)
  }
})

// Inicializar al montar el componente
onMounted(() => {
  const difficulty = difficulties[selectedDifficulty.value]
  initializeGame({
    elementsCount: difficulty.cards,
    duration: difficulty.time,
  })

  // Intentar reproducir música al inicio
  audio.play().then(() => {
    isMusicPlaying.value = true
  }).catch(() => {
    console.log('Esperando interacción del usuario para reproducir música')
  })
})

onUnmounted(() => {
  audio.pause()
})
</script>

<style scoped>
/* 3D Perspective para las cartas */
.perspective {
  perspective: 1000px;
}
</style>
