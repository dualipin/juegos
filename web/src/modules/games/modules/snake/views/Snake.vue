<template>
  <!-- <ScreenDanger /> -->

  <div class="pt-16 pb-10 text-center">
    <!-- Título principal con animación -->
    <div class="animate-fade-in mb-2">
      <h1
        class="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
      >
        <span class="bg-linear-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">
          La Bejuquilla
        </span>
      </h1>

      <!-- Subtítulo con efecto de máquina de escribir -->
      <h2 class="typewriter mt-2 text-xl font-medium text-emerald-700 md:text-2xl dark:text-emerald-400">
        Depredadora de la Selva 🐍
      </h2>
    </div>

    <div class="flex flex-col items-center">
      <!-- Tablero de juego -->
      <div class="animate-slide-up mb-8">
        <GameBoard />
      </div>

      <!-- Sección de Instrucciones (Selva) -->
      <div
        class="animate-fade-in w-full max-w-4xl rounded-xl border border-emerald-200 bg-white/90 p-6 shadow-lg backdrop-blur-sm dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:shadow-2xl"
      >
        <h2
          class="mb-4 flex items-center justify-center gap-2 text-2xl font-bold text-emerald-900 dark:text-emerald-100"
        >
          <LeafIcon class="h-6 w-6 text-emerald-500" />
          ¿Cómo sobrevivir?
          <BirdIcon class="h-6 w-6 text-amber-500" />
        </h2>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div class="flex flex-col items-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-800/20">
            <span class="text-4xl mb-2">🐭🐸🐦</span>
            <p class="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Caza ratones, ranas y aves para crecer y ganar puntos.
            </p>
          </div>
          <div class="flex flex-col items-center p-4 rounded-lg bg-rose-50 dark:bg-rose-800/20">
            <span class="text-4xl mb-2">🔪</span>
            <p class="text-sm font-semibold text-rose-800 dark:text-rose-200">
              ¡Evita los cuchillos! Un roce y la partida termina.
            </p>
          </div>
          <div class="flex flex-col items-center p-4 rounded-lg bg-amber-50 dark:bg-amber-800/20">
            <span class="text-4xl mb-2">📱</span>
            <p class="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Usa las flechas o los controles en pantalla para moverte.
            </p>
          </div>
        </div>
      </div>

      <!-- Ranking
      <div class="mt-8 w-full max-w-2xl">
        <RankingGlobal game="snake" ref="rankingRef" />
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GameBoard from '../components/GameBoard.vue'
import { LeafIcon, BirdIcon } from 'lucide-vue-next'
import ScreenDanger from '../components/ScreenDanger.vue'
import RankingGlobal from '@/modules/games/components/RankingGlobal.vue'
import { useSnakeGame } from '../composables/useSnakeGame'

gsap.registerPlugin(ScrollTrigger)

const { rankingRef } = useSnakeGame()

// Animaciones GSAP
onMounted(() => {
  gsap.from('.typewriter', {
    duration: 2,
    width: '0%',
    ease: 'steps(20)',
    delay: 0.5,
  })

  gsap.from('.animate-fade-in', {
    duration: 1,
    opacity: 0,
    y: -20,
    ease: 'power2.out',
    stagger: 0.2,
  })

  gsap.from('.animate-slide-up', {
    duration: 0.5,
    opacity: 0,
    y: 30,
    ease: 'power2.out',
    delay: 0.3,
  })
})
</script>

<style scoped>
.typewriter {
  overflow: hidden;
  white-space: nowrap;
  margin: 0 auto;
}
</style>
