<template>
  <div
    class="animate-sink animate-iteration-count-infinite animate-duration-[2s] card bg-base-100 shadow-xl overflow-hidden"
  >
    <!-- Elementos decorativos -->
    <div
      ref="decor1"
      class="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-xl"
    ></div>
    <div
      ref="decor2"
      class="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-secondary/10 blur-xl"
    ></div>

    <div class="card-body relative z-10">
      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-4">
        <div
          ref="difficultyBadge"
          class="badge badge-md gap-2 font-semibold py-3"
          :class="difficultyClass"
        >
          <span class="h-2 w-2 rounded-full" :class="difficultyDotClass"></span>
          {{ difficultyText }}
        </div>

        <div ref="headerRight" class="flex items-center gap-3">
          <span class="text-xs font-medium opacity-70">
            <template v-if="currentQuestion?.created_by === 'system'">
              <span class="badge badge-ghost badge-sm">Sistema</span>
            </template>
            <template v-else-if="currentQuestion?.created_by === 'IA'">
              <span class="badge badge-info badge-sm">IA</span>
            </template>
            <template v-else>
              <span class="badge badge-outline badge-sm">Comunidad: {{ currentQuestion?.created_by }}</span>
            </template>
          </span>
          <HintButton
            v-if="hasHintAvailable"
            @hint-used="showHint"
            class="transition-transform hover:scale-110"
          />
        </div>
      </div>

      <!-- Pregunta -->
      <h2
        ref="questionText"
        class="card-title text-2xl mb-6 text-base-content leading-tight"
      >
        {{ currentQuestion?.question }}
      </h2>

      <!-- Pista -->
      <div
        v-if="hintShown"
        ref="hintBox"
        class="mb-6 overflow-hidden rounded-lg border-l-4 border-warning bg-warning/10 p-4"
      >
        <p class="text-warning-content font-medium">{{ currentQuestion?.answer }}</p>
      </div>

      <!-- Opciones -->
      <div class="grid gap-3">
        <button
          v-for="(option, index) in currentQuestion?.options"
          :key="index"
          ref="optionButtons"
          @click="selectAnswer(option)"
          class="btn btn-lg justify-start h-auto py-4 normal-case text-left font-medium"
          :class="{
            'btn-success text-success-content': selectedAnswer === option && isCorrect,
            'btn-error text-error-content': selectedAnswer === option && !isCorrect,
            'btn-outline': !answerSubmitted,
            'pointer-events-none opacity-50': answerSubmitted && selectedAnswer !== option,
            'opacity-100': selectedAnswer === option
          }"
        >
          <span class="badge badge-ghost mr-3 font-bold">{{ String.fromCharCode(65 + index) }}</span>
          <span class="flex-1">{{ option }}</span>
        </button>
      </div>

      <!-- Retroalimentación -->
      <div v-if="answerSubmitted" ref="feedbackBox" class="mt-8">
        <div 
          class="alert mb-6 shadow-sm"
          :class="isCorrect ? 'alert-success' : 'alert-error'"
        >
          <div class="flex-1 flex flex-col items-center gap-2">
            <span v-if="isCorrect" class="text-xl font-bold flex items-center gap-2">
              <span>🎉</span> ¡Correcto!
            </span>
            <span v-else class="text-xl font-bold flex items-center gap-2">
              <span>😕</span> Incorrecto
            </span>
            <p v-if="isCorrect" class="text-sm opacity-90">{{ streakMessage }}</p>
            <p v-else class="text-sm opacity-90">La respuesta correcta era: <strong>{{ currentQuestion?.answer }}</strong></p>
          </div>
        </div>

        <button
          ref="nextButton"
          @click="nextQuestion"
          class="btn btn-primary btn-block btn-lg gap-2 shadow-lg"
        >
          Siguiente Pregunta
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuizStore } from '../stores/quiz-store'
import HintButton from './HintButton.vue'
import gsap from 'gsap'
import JSConfetti from 'js-confetti'

const quizStore = useQuizStore()
const { currentQuestion, hasHintAvailable, streakMessage } = storeToRefs(quizStore)

const selectedAnswer = ref<string | null>(null)
const answerSubmitted = ref(false)
const isCorrect = ref(false)
const hintShown = ref(false)

// Refs para animaciones
const decor1 = ref<HTMLElement | null>(null)
const decor2 = ref<HTMLElement | null>(null)
const difficultyBadge = ref<HTMLElement | null>(null)
const headerRight = ref<HTMLElement | null>(null)
const questionText = ref<HTMLElement | null>(null)
const optionButtons = ref<HTMLElement[] | null>(null)
const hintBox = ref<HTMLElement | null>(null)
const feedbackBox = ref<HTMLElement | null>(null)
const nextButton = ref<HTMLElement | null>(null)

const difficultyText = computed(() => {
  if (!currentQuestion.value) return ''
  const difficulty = currentQuestion.value.difficulty
  return difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'
})

const difficultyClass = computed(() => {
  if (!currentQuestion.value) return ''
  const difficulty = currentQuestion.value.difficulty
  return difficulty === 'easy'
    ? 'badge-success text-success-content'
    : difficulty === 'medium'
      ? 'badge-warning text-warning-content'
      : 'badge-error text-error-content'
})

const difficultyDotClass = computed(() => {
  if (!currentQuestion.value) return ''
  const difficulty = currentQuestion.value.difficulty
  return difficulty === 'easy'
    ? 'bg-success-content/50'
    : difficulty === 'medium'
      ? 'bg-warning-content/50'
      : 'bg-error-content/50'
})

watch(currentQuestion, (newQuestion) => {
  if (newQuestion) {
    selectedAnswer.value = null
    answerSubmitted.value = false
    isCorrect.value = false
    hintShown.value = false

    // Reiniciar animaciones
    gsap.set(
      [decor1.value, decor2.value, difficultyBadge.value, headerRight.value, questionText.value],
      {
        opacity: 0,
      },
    )
    gsap.set(optionButtons.value || [], { opacity: 0 })
    gsap.set(feedbackBox.value, { opacity: 0 })
  }
})

function selectAnswer(option: string) {
  selectedAnswer.value = option
  isCorrect.value = quizStore.answerQuestion(option)
  answerSubmitted.value = true

  const jsConfetti = new JSConfetti()

  if (isCorrect.value) {
    // Celebración con confeti

    jsConfetti.addConfetti({
      emojis: ['🎉', '🥳', '✨', '💖'],
      confettiNumber: 100,
      emojiSize: 50,
    })
  } else {
    jsConfetti.addConfetti({
      emojis: ['😕', '❌', '💔', '💩'],
      confettiNumber: 15,
      emojiSize: 100,
    })
  }

  // Animación al seleccionar respuesta
  if (optionButtons.value) {
    const selectedIndex = currentQuestion.value?.options.indexOf(option) || 0
    const button = optionButtons.value[selectedIndex]

    gsap.fromTo(
      button,
      { scale: 0.98 },
      {
        scale: 1.02,
        boxShadow: isCorrect.value
          ? '0 0 15px 0 rgba(74, 222, 128, 0.5)'
          : '0 0 15px 0 rgba(248, 113, 113, 0.5)',
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      },
    )
  }

  // Animación de feedback
  if (feedbackBox.value) {
    gsap.to(feedbackBox.value, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'back.out(1)',
    })
  }
}

function nextQuestion() {
  // Animación de salida
  const tl = gsap.timeline()

  if (questionText.value) {
    tl.to(
      questionText.value,
      {
        x: 0,
        opacity: 0,
        duration: 0.3,
      },
      0,
    )
  }

  if (optionButtons.value) {
    optionButtons.value.forEach((btn, i) => {
      tl.to(
        btn,
        {
          x: 0,
          opacity: 0,
          duration: 0.3,
          delay: i * 0.05,
        },
        0,
      )
    })
  }

  if (feedbackBox.value) {
    tl.to(
      feedbackBox.value,
      {
        y: -20,
        opacity: 0,
        duration: 0.3,
      },
      0,
    )
  }

  tl.then(() => {
    // Resetear estado
    selectedAnswer.value = null
    answerSubmitted.value = false
    isCorrect.value = false
    hintShown.value = false
    quizStore.loadQuestion()

    // Animación de entrada para nueva pregunta
    nextTick(() => {
      animateQuestionIn()
    })
  })
}

function showHint(hint: string) {
  hintShown.value = true

  nextTick(() => {
    if (hintBox.value) {
      gsap.fromTo(
        hintBox.value,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        },
      )
    }
  })
}

function animateQuestionIn() {
  const tl = gsap.timeline()

  // Elementos decorativos
  tl.fromTo(
    decor1.value,
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
  )
  tl.fromTo(
    decor2.value,
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
    0.2,
  )

  // Encabezado
  tl.fromTo(
    difficultyBadge.value,
    { y: -10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' },
    0.4,
  )
  tl.fromTo(
    headerRight.value,
    { x: 20, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' },
    0.5,
  )

  // Pregunta
  tl.fromTo(
    questionText.value,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
    0.6,
  )

  // Opciones
  if (optionButtons.value) {
    optionButtons.value.forEach((btn, i) => {
      tl.fromTo(
        btn,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          delay: i * 0.05,
          ease: 'back.out(1.2)',
        },
        0.7,
      )
    })
  }
}

// Animar al montar el componente
onMounted(() => {
  // Inicializar todos los elementos como ocultos
  gsap.set(
    [
      decor1.value,
      decor2.value,
      difficultyBadge.value,
      headerRight.value,
      questionText.value,
      ...(optionButtons.value || []),
      feedbackBox.value,
    ],
    { opacity: 0 },
  )

  // Iniciar animación de entrada
  animateQuestionIn()
})

// Observar cambios en la pregunta para animar
watch(currentQuestion, () => {
  // Ocultar elementos antes de animar
  gsap.set([questionText.value, ...(optionButtons.value || [])], { opacity: 0 })

  animateQuestionIn()
})
</script>
