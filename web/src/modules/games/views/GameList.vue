<template>
  <div class="min-h-screen bg-base-100">
    <!-- Navbar -->
    <div class="navbar bg-base-100/80 backdrop-blur sticky top-0 z-50 border-b border-base-300">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl font-bold">
          Menu de Juegos
        </a>
      </div>

      <div class="flex-none">
        <label class="swap swap-rotate btn btn-ghost btn-circle">
          <input type="checkbox" class="theme-controller" value="light" />

          <SunIcon class="swap-off h-5 w-5 fill-current" />
          <MoonIcon class="swap-on h-5 w-5 fill-current" />
        </label>
      </div>
    </div>



    <!-- Games -->
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Section header -->
        <div class="text-center mb-16">
          <div class="badge badge-secondary badge-outline mb-4">
            Colección Interactiva
          </div>

          <h2 class="text-4xl md:text-5xl font-black mb-4">
            Explora Nuestros
            <span class="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
              Juegos
            </span>
          </h2>

          <p class="text-base-content/70 max-w-2xl mx-auto text-lg">
            Descubre experiencias diseñadas para aprender química, cultura y
            tradición de forma divertida.
          </p>
        </div>

        <!-- Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <!-- Memorama -->
          <GameCard class="hover:scale-[1.02] transition-all duration-300" title="Memorama"
            description="Encuentra las parejas que forman nuestra cultura" icon="🧠"
            color="from-purple-500 to-indigo-600" :delay="0.1" @click="$router.push({ name: 'games.memory' })" />

          <!-- Lotería -->
          <GameCard class="hover:scale-[1.02] transition-all duration-300" title="La Lotería"
            description="Juega la lotería tradicional con cartas y cartones digitales" icon="🎰"
            color="from-amber-500 to-orange-500" :delay="0.2" @click="$router.push({ name: 'games.lottery' })" />

          <!-- Preguntas -->
          <GameCard class="hover:scale-[1.02] transition-all duration-300" title="Desafío de Preguntas"
            description="Pon a prueba tus conocimientos sobre Macuspana" icon="❓" color="from-blue-500 to-teal-500"
            :delay="0.3" @click="$router.push({ name: 'games.quiz' })" />

          <!-- Snake -->
          <GameCard class="hover:scale-[1.02] transition-all duration-300" title="Culebrita Atómica"
            description="Controla una serpiente y forma compuestos químicos al recolectar elementos" icon="🐍"
            color="from-green-500 to-emerald-600" :delay="0.4" @click="$router.push({ name: 'games.snake' })" />

          <!-- Constructor -->
          <!-- <GameCard class="hover:scale-[1.02] transition-all duration-300" title="Constructor Molecular"
            description="Combina átomos para formar compuestos en este simulador interactivo" icon="⚛️"
            color="from-red-500 to-pink-600" :delay="0.5" @click="$router.push({ name: 'games.constructor' })" /> -->

          <!-- Molecules -->
          <!-- <GameCard class="hover:scale-[1.02] transition-all duration-300" title="Visor de Moléculas"
            description="Explora y visualiza estructuras moleculares en 3D" icon="🔬" color="from-yellow-400 to-red-500"
            :delay="0.6" @click="$router.push({ name: 'games.molecule-viewer' })" /> -->

          <!-- Mario -->
          <!-- <GameCard class="hover:scale-[1.02] transition-all duration-300" title="Mario Químico"
            description="Acompaña a Mario en una aventura para recolectar elementos" icon="🍄"
            color="from-blue-700 to-indigo-800" :delay="0.7" @click="$router.push({ name: 'games.mario' })" /> -->
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer footer-center p-10 bg-base-200 text-base-content">
      <aside>
        <h2 class="text-2xl font-bold mb-2">
          ¡Gracias por jugar!
        </h2>
        <p class="text-base-content/60">
          Aprendizaje, cultura y diversión interactiva.
        </p>

        <!-- logos institucionales -->
        <div class="flex items-center justify-center gap-6 mt-4">
          <img :src="logoITSM" alt="ITSM" class="h-20 rounded-box object-contain">
          <!-- <img src="/assets/logos/cecytem.png" alt="CECYTEM" class="h-12 object-contain"> -->
          <!-- <img src="/assets/logos/sep.png" alt="SEP" class="h-12 object-contain"> -->
        </div>
      </aside>
    </footer>
  </div>
</template>


<script setup lang="ts">
import { useRouter } from 'vue-router'
import GameCard from '../components/GameCard.vue'
import { MoonIcon, SunIcon } from 'lucide-vue-next'

import logoITSM from '@/assets/logo/itsm.png'

const router = useRouter()

const navigateTo = (game: string) => {
  router.push(`/games/${game}`)
}
</script>
