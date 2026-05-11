<script setup lang="ts">
import ToastContainer from '@/components/layout/ToastContainer.vue'
import Navbar from '@/modules/games/components/Navbar.vue'
</script>

<template>
  <div
    class="flex min-h-screen flex-col"
  >
    <Navbar v-if="$route.name !== 'games'" />
    <div class="flex-1 pt-6 md:pt-8 lg:pt-10 px-4 md:px-6 lg:px-8">

      <RouterView />
    </div>
    <ToastContainer />
  </div>
</template>
