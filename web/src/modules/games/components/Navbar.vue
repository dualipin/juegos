<script setup lang="ts">
import ToggleThemeButton from '@/components/ToggleThemeButton.vue'
import { ArrowLeft } from 'lucide-vue-next'
</script>

<template>
    <nav class="navbar bg-base-100 shadow-sm fixed top-0 z-50 w-full px-10">
      <div class="flex-1">
        <RouterLink
          :to="{ name: 'games' }"
          class="btn btn-ghost gap-2 text-lg font-bold"
        >
          <ArrowLeft :size="20" /> Volver
        </RouterLink>
      </div>

      <div class="flex-none">
        <ToggleThemeButton />
      </div>
    </nav>
</template>
