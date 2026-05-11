<template>
  <div class="min-h-screen p-6 bg-base-200">
    <div class="mx-auto max-w-2xl mb-52 lg:mb-auto">
      <div class="mb-6 flex justify-between items-center">
        <LevelIndicator />
        <CoinDisplay />
      </div>

      <!-- Loading state mientras Gemini genera preguntas -->
      <div
        v-if="isLoading && !currentQuestion"
        class="py-16 text-center"
      >
        <div class="flex flex-col items-center gap-4">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <p class="text-xl font-bold text-primary">
            Generando preguntas sobre Macuspana...
          </p>
          <p class="text-base-content/70">
            La IA está creando trivia personalizada
          </p>
        </div>
      </div>

      <QuestionCard v-else-if="currentQuestion" />
      <div v-else class="py-10 text-center">
        <span class="loading loading-dots loading-md"></span>
        <p class="text-lg">Cargando pregunta...</p>
      </div>

      <StreakDisplay />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useQuizStore } from '../stores/quiz-store'
import LevelIndicator from '../components/LevelIndicator.vue'
import CoinDisplay from '../components/CoinDisplay.vue'
import QuestionCard from '../components/QuestionCard.vue'
import StreakDisplay from '../components/StreakDisplay.vue'

const quizStore = useQuizStore()
const { currentQuestion, isLoading } = storeToRefs(quizStore)

quizStore.loadQuestion()
</script>
