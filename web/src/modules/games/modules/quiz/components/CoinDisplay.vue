<template>
  <div ref="coinsContainer" class="flex items-center gap-2 opacity-0">
    <span ref="coinsLabel" class="text-sm font-bold uppercase tracking-wider opacity-60">Monedas</span>
    <div
      ref="coinsBadge"
      class="badge badge-warning badge-lg font-black px-4 py-3 shadow-sm gap-1"
    >
      <svg
        ref="coinsIcon"
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span ref="coinsAmount">{{ coins }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useQuizStore } from '../stores/quiz-store'
import { ref, onMounted, watch } from 'vue'
import gsap from 'gsap'

const quizStore = useQuizStore()
const { coins } = storeToRefs(quizStore)

// Refs para animaciones
const coinsContainer = ref<HTMLElement | null>(null)
const coinsLabel = ref<HTMLElement | null>(null)
const coinsBadge = ref<HTMLElement | null>(null)
const coinsIcon = ref<HTMLElement | null>(null)
const coinsAmount = ref<HTMLElement | null>(null)

// Animación de entrada
function animateCoinsIn() {
  const tl = gsap.timeline()

  tl.to(coinsContainer.value, {
    opacity: 1,
    duration: 0.3,
  })

  tl.fromTo(coinsLabel.value, { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, 0.1)

  tl.fromTo(
    coinsBadge.value,
    {
      y: 10,
      scale: 0.9,
      opacity: 0,
    },
    {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: 'back.out(1.2)',
    },
    0.2,
  )

  tl.fromTo(
    coinsIcon.value,
    {
      scale: 0,
      opacity: 0,
      rotation: 180,
    },
    {
      scale: 1,
      opacity: 1,
      rotation: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    },
    0.3,
  )

  tl.fromTo(
    coinsAmount.value,
    {
      scale: 1.5,
      opacity: 0,
    },
    {
      scale: 1,
      opacity: 1,
      duration: 0.3,
    },
    0.4,
  )
}

// Animación al cambiar cantidad
function animateCoinsChange() {
  gsap.fromTo(
    coinsAmount.value,
    { scale: 1.2 },
    {
      scale: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    },
  )
}

// Inicializar animación al montar
onMounted(() => {
  // Establecer estado inicial oculto
  gsap.set(coinsContainer.value, { opacity: 0 })
  gsap.set(coinsLabel.value, { opacity: 0, x: -10 })
  gsap.set(coinsBadge.value, { opacity: 0, y: 10 })
  gsap.set(coinsIcon.value, { opacity: 0, scale: 0 })
  gsap.set(coinsAmount.value, { opacity: 0, scale: 1.5 })

  // Animar entrada
  animateCoinsIn()
})

// Observar cambios en las monedas
watch(coins, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    animateCoinsChange()
  }
})
</script>
