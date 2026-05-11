<script setup lang="ts">
import SimpleNav from '@/components/ui/SimpleNav.vue'
import { useQuizStore } from '../stores/quiz-store'
import { computed } from 'vue'

const quizStore = useQuizStore()

const createdBy = computed(() => quizStore.createdBy)

function selectCreator(creator: 'system' | 'IA' | 'community') {
  quizStore.createdBy = creator
  quizStore.loadQuestion() // Reload questions based on the selected creator
}
</script>

<template>
  <SimpleNav class="animate-fade-in-down">
    <div
      class="animate-fade-in gap-5 flex flex-1 flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-black tracking-tight text-base-content">
          Desafío de Preguntas
        </h2>
      </div>

      <nav aria-label="Quiz creation options">
        <div class="join bg-base-200 p-1 rounded-xl">
          <button
            @click="selectCreator('system')"
            class="btn btn-sm join-item normal-case border-none"
            :class="createdBy === 'system' ? 'btn-primary shadow-sm' : 'btn-ghost'"
          >
            Del sistema
          </button>
          <button
            @click="selectCreator('IA')"
            class="btn btn-sm join-item normal-case border-none"
            :class="createdBy === 'IA' ? 'btn-primary shadow-sm' : 'btn-ghost'"
          >
            Con IA
          </button>
          <button
            @click="selectCreator('community')"
            class="btn btn-sm join-item normal-case border-none"
            :class="createdBy === 'community' ? 'btn-primary shadow-sm' : 'btn-ghost'"
          >
            Comunidad
          </button>
        </div>
      </nav>
    </div>
  </SimpleNav>
</template>
