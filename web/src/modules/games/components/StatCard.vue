<template>
  <motion.div
    :initial="{
      opacity: 0,
      y: -20,
      scale: 0.5,
    }"
    :whileInView="{
      opacity: 1,
      y: 0,
      scale: 1,
    }"
    :transition="{
      duration: 1,
      ease: 'easeInOut',
      delay: 0.2,
    }"
    class="stat bg-base-100 border border-base-300 rounded-lg"
  >
    <div class="stat-figure text-2xl">
      {{ icon }}
    </div>
    <div class="stat-title text-sm font-medium">{{ label }}</div>
    <div class="stat-value text-3xl">{{ value }}</div>
  </motion.div>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
defineProps({
  value: String,
  label: String,
  icon: String,
})
</script>
