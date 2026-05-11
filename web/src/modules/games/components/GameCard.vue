<template>
  <motion.div :initial="{
    opacity: 0,
    y: 30,
  }" :whileInView="{
      opacity: 1,
      y: 0,
    }" :transition="{
      duration: 0.5,
      delay,
    }" :inViewOptions="{ once: true }" @click="$emit('click')"
    class="group card bg-base-100 border border-base-300 shadow-md hover:shadow-2xl hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden">
    <!-- Top Gradient -->
    <div class="relative h-52 overflow-hidden">
      <!-- Background -->
      <div class="absolute inset-0 bg-linear-to-br" :class="color"></div>

      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300"></div>

      <!-- Decorative circles -->
      <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>

      <div class="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>

      <!-- Icon -->
      <div class="relative z-10 flex h-full items-center justify-center">
        <div
          class="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <span class="text-6xl drop-shadow-lg">
            {{ icon }}
          </span>
        </div>
      </div>

    </div>

    <!-- Body -->
    <div class="card-body p-6">
      <!-- Title -->
      <div class="flex items-start justify-between gap-3">
        <h3 class="card-title text-xl font-bold leading-snug group-hover:text-primary transition-colors">
          {{ title }}
        </h3>
      </div>

      <!-- Description -->
      <p class="text-base-content/70 leading-relaxed text-sm">
        {{ description }}
      </p>

      <!-- Divider -->
      <div class="divider my-1"></div>

      <!-- Footer -->
      <div class="card-actions justify-between items-center">
        <div></div>
        <button class="btn btn-primary btn-sm rounded-full gap-2 group-hover:gap-3 transition-all">
          Jugar
          <ArrowRight :size="16" class="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  </motion.div>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { motion } from 'motion-v'

defineProps({
  title: String,
  description: String,
  icon: String,
  color: String,
  delay: {
    type: Number,
    default: 0,
  },
})

defineEmits(['click'])
</script>