import { ref, onUnmounted, computed } from 'vue'
import { useToastStore } from '@/stores'
import { rankingServices } from '@/modules/games/services/ranking-services'
import { useAuthStore } from '@/modules/auth/stores/auth-store'
import { useSnakeStore } from '../stores/snake-store'
import type RankingGlobal from '@/modules/games/components/RankingGlobal.vue'

type Direction = 'up' | 'down' | 'left' | 'right'
type Position = { x: number; y: number }

const gridSize = 24

export function useSnakeGame() {
  const toast = useToastStore()
  const { sendRanking } = rankingServices()
  const user = useAuthStore()
  const snakeStore = useSnakeStore()
  const snake = ref<Position[]>([{ x: 10, y: 10 }])
  const direction = ref<Direction>('right')
  const nextDirection = ref<Direction>('right')
  const interval = ref<number | null>(null)

  // Alimentos y Obstáculos
  const foodEmojis = ['🐭', '🐸', '🐦']
  const comidas = ref<{ position: Position; emoji: string }[]>([])
  const cuchillos = ref<Position[]>([])

  const puntuacion = ref(0)
  const juegoGanado = ref(false)
  const juegoPerdido = ref(false)
  const gameStarted = ref(false)

  // Generar comida aleatoria
  function generateFood(cantidad: number) {
    const nuevas: { position: Position; emoji: string }[] = []
    for (let i = 0; i < cantidad; i++) {
      let x, y, occupies
      do {
        x = Math.floor(Math.random() * gridSize)
        y = Math.floor(Math.random() * gridSize)
        occupies = snake.value.some(s => s.x === x && s.y === y) || 
                   comidas.value.some(c => c.position.x === x && c.position.y === y) ||
                   cuchillos.value.some(k => k.x === x && k.y === y)
      } while (occupies)
      
      const emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)]
      nuevas.push({ position: { x, y }, emoji })
    }
    return nuevas
  }

  // Generar cuchillos
  function generateKnife() {
    let x, y, occupies
    do {
      x = Math.floor(Math.random() * gridSize)
      y = Math.floor(Math.random() * gridSize)
      occupies = snake.value.some(s => s.x === x && s.y === y) || 
                 comidas.value.some(c => c.position.x === x && c.position.y === y) ||
                 cuchillos.value.some(k => k.x === x && k.y === y)
    } while (occupies)
    cuchillos.value.push({ x, y })
  }

  const moveSnake = async () => {
    direction.value = nextDirection.value
    const head = { ...snake.value[0] }

    switch (direction.value) {
      case 'up': head.y -= 1; break
      case 'down': head.y += 1; break
      case 'left': head.x -= 1; break
      case 'right': head.x += 1; break
    }

    // Colisión con bordes
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      gameOver('¡Chocaste con el borde!')
      return
    }

    // Colisión con sí misma
    if (snake.value.some((seg) => seg.x === head.x && seg.y === head.y)) {
      gameOver('¡Te mordiste a ti mismo!')
      return
    }

    // Colisión con cuchillos
    if (cuchillos.value.some(k => k.x === head.x && k.y === head.y)) {
      gameOver('¡Cuidado con el cuchillo! Perdiste.')
      return
    }

    // Colisión con comida
    const foodIndex = comidas.value.findIndex(
      (c) => c.position.x === head.x && c.position.y === head.y,
    )

    if (foodIndex !== -1) {
      puntuacion.value += 10
      snake.value.unshift(head)
      comidas.value.splice(foodIndex, 1)
      comidas.value.push(...generateFood(1))
      
      // Cada 50 puntos agregamos un cuchillo extra para subir dificultad
      if (puntuacion.value % 50 === 0) {
        generateKnife()
        toast.show('¡Más peligro en la selva! Apareció un cuchillo.', 'warning')
      }
      
      checkAchievements()
    } else {
      snake.value.unshift(head)
      snake.value.pop()
    }
  }

  const gameOver = (message: string) => {
    stopGame()
    toast.show(message, 'error')
    juegoPerdido.value = true
    submitScore()
  }

  const submitScore = async () => {
    try {
      const ranking = {
        name: 'snake',
        user: Number(user.user!.id),
        score: puntuacion.value,
        username: user.user!.full_name,
      }
      await sendRanking(ranking)
      if (rankingRef.value) rankingRef.value.loadRanking()
    } catch (err) {
      console.error('Error al enviar ranking:', err)
    }
  }

  const checkAchievements = () => {
    if (puntuacion.value === 100) {
      snakeStore.addReward('Cazador de la Selva')
      snakeStore.unlockSkin('quantum')
      toast.show('Skin Quantum desbloqueada', 'success')
    }
    if (puntuacion.value === 300) {
      snakeStore.addReward('Depredador Ápice')
      snakeStore.unlockSkin('molecular')
      toast.show('Skin Molecular desbloqueada', 'success')
    }
    if (puntuacion.value === 500) {
      snakeStore.addReward('Leyenda de la Bejuquilla')
      snakeStore.unlockSkin('legendary')
      toast.show('Skin Legendaria desbloqueada', 'success')
    }
  }

  const setDirection = (newDir: Direction) => {
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' }
    if (newDir !== opposites[direction.value]) {
      nextDirection.value = newDir
    }
  }

  const handleKeydown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': setDirection('up'); break
      case 'ArrowDown': setDirection('down'); break
      case 'ArrowLeft': setDirection('left'); break
      case 'ArrowRight': setDirection('right'); break
    }
  }

  const startGame = () => {
    gameStarted.value = true
    juegoPerdido.value = false
    juegoGanado.value = false
    if (!interval.value) {
      // Velocidad base
      interval.value = setInterval(moveSnake, 150)
    }
    window.addEventListener('keydown', handleKeydown)
    if (comidas.value.length === 0) {
      comidas.value = generateFood(3)
      cuchillos.value = []
      generateKnife()
    }
  }

  const stopGame = () => {
    if (interval.value) clearInterval(interval.value)
    window.removeEventListener('keydown', handleKeydown)
    interval.value = null
  }

  const resetGame = () => {
    stopGame()
    gameStarted.value = false
    snake.value = [{ x: 10, y: 10 }]
    direction.value = 'right'
    nextDirection.value = 'right'
    puntuacion.value = 0
    comidas.value = []
    cuchillos.value = []
    juegoGanado.value = false
    juegoPerdido.value = false
    
    // Cerrar modal de game over
    const modalGameOver = document.getElementById('modal_game_over') as HTMLDialogElement
    modalGameOver?.close()
  }

  const rankingRef = ref<InstanceType<typeof RankingGlobal>>()

  onUnmounted(stopGame)

  return {
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
    gameStarted,
    setDirection,
    snakeStore,
    rankingRef,
  }
}
