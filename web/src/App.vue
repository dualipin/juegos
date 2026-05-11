<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useThemeStore } from './stores'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.listenToSystemChanges()
})

onBeforeUnmount(() => {
  themeStore.stopListeningToSystemChanges()
})
</script>

<template>
  <RouterView />
</template>
