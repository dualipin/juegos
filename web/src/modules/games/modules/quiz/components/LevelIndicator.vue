<template>
  <div class="flex items-center gap-2">
    <span class="text-sm font-bold uppercase tracking-wider opacity-60">Nivel</span>
    <div class="badge badge-primary badge-lg font-black px-4 py-3 shadow-sm">
      {{ currentLevel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useQuizStore } from '../stores/quiz-store'

const quizStore = useQuizStore()
const { currentLevel } = storeToRefs(quizStore)
</script>
