import { computed, ref, onBeforeUnmount, watch } from 'vue'
import { type TGameCard } from '../types/Card'
import { culturalCategories, getCategoryColors, type CulturalCard } from '../data/culturalCategories'
import { rankingServices } from '@/modules/games/services/ranking-services'
import { useAuthStore } from '@/modules/auth/stores/auth-store'

export type Theme = 'light' | 'dark' | 'science' | 'neon'

const buildCulturalCards = (count = 12): TGameCard[] => {
  // Select pairs of cards (count should be even)
  const evenCount = count % 2 === 0 ? count : count - 1
  const halfCount = evenCount / 2

  const selected = culturalCategories.slice(0, halfCount)

  return selected.map((card: CulturalCard) => {
    const colors = getCategoryColors(card.categoría)
    return {
      name: card.nombre,
      symbol: card.id,
      atomicNumber: 0, // Not used, but kept for compatibility
      category: card.categoría,
      funFact: card.hechoCurioso,
      type: 'cultural',
      icon: card.ícono,
      description: card.descripción,
      image: card.imagen,
      colorBg: colors.bgClass,
      colorText: colors.textClass,
      colorBorder: colors.borderClass,
    } as TGameCard
  })
}

export const useMemoryGame = () => {
  // Estado del juego
  const cards = ref<TGameCard[]>([])
  const flippedCards = ref<TGameCard[]>([])
  const matchedPairs = ref(0)
  const attempts = ref(0)
  const gameWon = ref(false)
  const score = ref(0)
  const streak = ref(0)
  const rewards = ref<string[]>([])
  const theme = ref<Theme>('science')
  const timeLeft = ref(120) // seconds
  const timerRunning = ref(false)
  let timerId: number | undefined

  const { getRanking, sendRanking } = rankingServices()
  const user = useAuthStore()

  // Computed
  const totalPairs = computed(() => cards.value.length / 2)

  // Inicializar juego
  const initializeGame = (options?: {
    elementsCount?: number
    duration?: number
    theme?: Theme
  }) => {
    const { elementsCount = 12, duration = 120, theme: newTheme } = options || {}
    if (newTheme) theme.value = newTheme
    timeLeft.value = duration
    clearTimer()

    const baseCards = buildCulturalCards(elementsCount)

    // Duplicar las cartas para formar pares
    const duplicated = [...baseCards, ...baseCards]
      .map((card, idx) => ({
        ...card,
        id: idx + Math.random(),
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5)

    cards.value = duplicated
    flippedCards.value = []
    matchedPairs.value = 0
    attempts.value = 0
    gameWon.value = false
    score.value = 0
    streak.value = 0
    rewards.value = []
    startTimer()
  }

  // Voltear carta
  const flipCard = (index: number) => {
    const card = cards.value[index]

    // No hacer nada si la carta ya está volteada o emparejada
    if (card.isFlipped || card.isMatched || flippedCards.value.length === 2) return

    // Voltear la carta
    card.isFlipped = true
    flippedCards.value.push({ ...card, id: index })

    // Verificar si hay un par
    if (flippedCards.value.length === 2) {
      attempts.value++

      const [firstIndex, secondIndex] = flippedCards.value
      const firstCard = cards.value[firstIndex.id!]
      const secondCard = cards.value[secondIndex.id!]

      // Verificar si es un par
      if (firstCard.name === secondCard.name) {
        // Emparejado correctamente
        firstCard.isMatched = true
        secondCard.isMatched = true
        matchedPairs.value++
        flippedCards.value = []

        // Puntuación: base 100 + bonus por racha, penalización por tiempo
        streak.value += 1
        const timeBonus = Math.max(0, Math.floor(timeLeft.value / 10))
        const pairPoints = 100 + streak.value * 10 + timeBonus
        score.value += pairPoints

        // Recompensas
        checkRewards()

        // Verificar si el juego terminó
        if (matchedPairs.value === totalPairs.value) {
          setTimeout(() => {
            gameWon.value = true
            stopTimer()
            // Bonus por tiempo restante
            score.value += timeLeft.value * 5
          }, 500)
        }
      } else {
        // No es un par, voltear de nuevo después de un tiempo
        setTimeout(() => {
          firstCard.isFlipped = false
          secondCard.isFlipped = false
          flippedCards.value = []
          // Penalización y reset de racha
          streak.value = 0
          score.value = Math.max(0, score.value - 10)
        }, 1000)
      }
    }
  }

  // Reiniciar juego
  const resetGame = () => {
    initializeGame()
  }

  // Timer helpers
  const tick = () => {
    if (!timerRunning.value) return
    if (timeLeft.value > 0) {
      timeLeft.value -= 1
    } else {
      stopTimer()
      // Juego perdido por tiempo: revelar todos y terminar
      cards.value.forEach((c) => (c.isFlipped = true))
      gameWon.value = false
    }
  }
  const startTimer = () => {
    timerRunning.value = true
    clearTimer()
    timerId = window.setInterval(tick, 1000)
  }
  const stopTimer = () => {
    timerRunning.value = false
    clearTimer()
  }
  const clearTimer = () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = undefined
    }
  }

  onBeforeUnmount(() => {
    clearTimer()
  })

  const checkRewards = () => {
    if (matchedPairs.value === 1 && !rewards.value.includes('Primer par')) {
      rewards.value.push('Primer par')
    }
    if (streak.value >= 3 && !rewards.value.includes('Racha x3')) {
      rewards.value.push('Racha x3')
      score.value += 50
    }
    if (matchedPairs.value === totalPairs.value && !rewards.value.includes('Maestro de la Tabla')) {
      rewards.value.push('Maestro de la Tabla')
    }
  }

  return {
    cards,
    flippedCards,
    matchedPairs,
    attempts,
    gameWon,
    totalPairs,
    initializeGame,
    flipCard,
    resetGame,
    sendRanking,
    user,
    // nuevos estados
    score,
    streak,
    rewards,
    theme,
    timeLeft,
    timerRunning,
    startTimer,
    stopTimer,
  }
}
