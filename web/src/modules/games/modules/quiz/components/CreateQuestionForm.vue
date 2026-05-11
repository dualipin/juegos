<template>
  <div
    class="create-question-form card bg-base-100 shadow-xl border border-base-300"
  >
    <div class="card-body">
      <h2 class="card-title text-2xl font-black text-primary mb-6">
        Crear nueva pregunta
      </h2>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">Pregunta</span>
          </label>
          <input
            v-model="form.question"
            type="text"
            placeholder="Escribe la pregunta aquí..."
            class="input input-bordered input-primary w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">Opciones</span>
          </label>
          <div class="space-y-3">
            <div
              v-for="(option, idx) in form.options"
              :key="idx"
              class="flex items-center gap-2"
            >
              <input
                v-model="form.options[idx]"
                type="text"
                :placeholder="`Opción ${String.fromCharCode(65 + idx)}`"
                class="input input-bordered flex-1"
                required
              />
              <button
                type="button"
                @click="removeOption(idx)"
                class="btn btn-error btn-square btn-sm"
                title="Eliminar opción"
              >
                <svg
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <button
            type="button"
            @click="addOption"
            class="btn btn-outline btn-sm mt-4 gap-2"
          >
            <svg
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar opción
          </button>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">Respuesta correcta</span>
          </label>
          <input
            v-model="form.answer"
            type="text"
            placeholder="Debe coincidir exactamente con una opción"
            class="input input-bordered input-success w-full"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-bold">Dificultad</span>
          </label>
          <select v-model="form.difficulty" class="select select-bordered w-full">
            <option value="easy">Fácil</option>
            <option value="medium">Medio</option>
            <option value="hard">Difícil</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg mt-8 shadow-md">
          Crear pregunta
        </button>
      </form>

      <div v-if="success" class="alert alert-success mt-6 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>¡Pregunta creada exitosamente!</span>
      </div>

      <div v-if="error" class="alert alert-error mt-6 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error al crear la pregunta. Verifica tus permisos.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createQuestion } from '../services/quiz-services'
import { useAuthStore } from '@/modules/auth/stores/auth-store'

const authStore = useAuthStore()
const user = authStore.user

const form = ref({
    question: '',
    options: ['', ''],
    answer: '',
    difficulty: 'easy',
})

const success = ref(false)
const error = ref(false)

function addOption() {
    form.value.options.push('')
}
function removeOption(idx: number) {
    form.value.options.splice(idx, 1)
}

async function handleSubmit() {
    if (user?.role !== 'profesor') {
        error.value = true
        success.value = false
        return
    }
    try {
        await createQuestion({
            id: null,
            question: form.value.question,
            options: form.value.options,
            answer: form.value.answer,
            difficulty: form.value.difficulty as 'easy' | 'medium' | 'hard',
            created_by: user.full_name || 'profesor',
        })
        success.value = true
        error.value = false
        form.value = { question: '', options: ['', ''], answer: '', difficulty: 'easy' }
    } catch (e) {
        error.value = true
        success.value = false
    }
}
</script>

<style scoped>
.create-question-form {
    max-width: 500px;
    margin: 2rem auto;
}
</style>
