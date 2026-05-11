<template>
  <div class="min-h-screen p-6">
    <div class="mx-auto max-w-2xl mb-52 lg:mb-auto">
      <div class="mb-6 flex justify-between">
        <LevelIndicator />
        <CoinDisplay />
      </div>

      <!-- Loading state mientras Gemini genera preguntas -->
      <div
        v-if="isLoading && !currentQuestion"
        class="py-16 text-center"
      >
        <div class="inline-flex flex-col items-center gap-4">
          <div class="relative h-16 w-16">
            <div
              class="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"
            ></div>
            <div
              class="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-500 dark:border-t-blue-400"
            ></div>
            <span class="absolute inset-0 flex items-center justify-center text-2xl">🧠</span>
          </div>
          <p class="text-lg font-medium text-gray-600 dark:text-gray-300">
            Generando preguntas sobre Macuspana...
          </p>
          <p class="text-sm text-gray-400 dark:text-gray-500">
            La IA está creando trivia personalizada
          </p>
        </div>
      </div>

      <QuestionCard v-else-if="currentQuestion" />
      <div v-else class="py-10 text-center dark:text-gray-300">
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
