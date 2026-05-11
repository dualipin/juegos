<script setup lang="ts">
import { SunIcon, MoonIcon } from 'lucide-vue-next'
</script>

<template>
  <label class="swap swap-rotate">
    <!-- this hidden checkbox controls the state -->
    <input type="checkbox" class="theme-controller" value="light" />

    <!-- sun icon -->
    <SunIcon class="swap-off size-6 fill-current" />

    <!-- moon icon -->
    <MoonIcon class="swap-on size-6 fill-current" />
  </label>
</template>
