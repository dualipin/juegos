<template>
  <li v-if="visible" :class="toastClasses">
    <p class="flex-1">{{ message }}</p>
    <button
      @click="close"
      class="btn btn-ghost btn-sm btn-circle"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  </li>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import clsx from 'clsx'

const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}>()

const emit = defineEmits(['close'])

const visible = ref(true)

const toastClasses = computed(() =>
  clsx(
    'alert z-[60] flex w-72 items-center justify-between rounded-lg shadow-lg',
    props.type === undefined && 'alert-info',
    props.type === 'success' && 'alert-success',
    props.type === 'error' && 'alert-error',
    props.type === 'info' && 'alert-info',
  ),
)

function close() {
  visible.value = false
  emit('close')
}

onMounted(() => {
  setTimeout(close, props.duration ?? 5000)
})
</script>
