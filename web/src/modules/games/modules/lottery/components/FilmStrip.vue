<template>
    <div class="film-strip-wrapper w-full overflow-hidden relative">
        <!-- Fade edges -->
        <div class="pointer-events-none absolute inset-y-0 left-0 w-16 z-10"
            style="background: linear-gradient(to right, hsl(var(--b3)), transparent)" />
        <div class="pointer-events-none absolute inset-y-0 right-0 w-16 z-10"
            style="background: linear-gradient(to left, hsl(var(--b3)), transparent)" />

        <div class="bg-[#1a0a06] py-2 select-none">
            <!-- Agujeros superiores -->
            <div class="film-holes flex gap-4.5 px-2 mb-1">
                <div v-for="i in 60" :key="i" class="film-hole" />
            </div>

            <!-- Cartas -->
            <div ref="track" class="cards-track flex gap-3 px-2 py-1 w-max"
                :class="direction === 'reverse' ? 'animate-film-reverse' : 'animate-film-forward'" @mouseenter="pause"
                @mouseleave="resume">
                <!-- Duplicado para loop infinito suave -->
                <template v-for="pass in 2" :key="pass">
                    <div v-for="carta in cartas" :key="`${pass}-${carta.n}`" class="carta">
                        <img :src="carta.image" alt="Carta" class="w-full h-full object-cover rounded-md" />
                        <!-- <div class="carta-border" /> -->
                        <!-- <span class="carta-num">{{ carta.n }}</span>
            <span class="carta-emoji">{{ carta.emoji }}</span>
            <span class="carta-name">{{ carta.nombre }}</span> -->
                    </div>
                </template>
            </div>

            <!-- Agujeros inferiores -->
            <div class="film-holes flex gap-4.5 px-2 mt-1">
                <div v-for="i in 60" :key="i" class="film-hole" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps({
    cartas: { type: Array<any>, required: true },
    direction: { type: String, default: 'forward' },
})

const track = ref < any | null > (null)

function pause() { if (track.value) track.value.style.animationPlayState = 'paused' }
function resume() { if (track.value) track.value.style.animationPlayState = 'running' }
</script>

<style scoped>
/* Agujeros de película */
.film-hole {
    width: 14px;
    height: 10px;
    background: #f5f0e0;
    border-radius: 2px;
    flex-shrink: 0;
    opacity: 0.65;
}

/* Animaciones de la cinta */
@keyframes filmForward {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(-50%);
    }
}

@keyframes filmReverse {
    from {
        transform: translateX(-50%);
    }

    to {
        transform: translateX(0);
    }
}

.animate-film-forward {
    animation: filmForward 42s linear infinite;
}

.animate-film-reverse {
    animation: filmReverse 55s linear infinite;
}

/* Carta individual */
.carta {
    width: 88px;
    height: 122px;
    border-radius: 6px;
    border: 2.5px solid #D4A017;
    background: #FDF6E3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 5px 4px 4px;
    flex-shrink: 0;
    cursor: pointer;
    position: relative;
    transition: transform 0.2s ease;
    overflow: hidden;
}

.carta:hover {
    transform: scale(1.1) translateY(-6px);
}

/* Borde interior decorativo */
.carta-border {
    position: absolute;
    inset: 4px;
    border: 1px solid rgba(212, 160, 23, 0.35);
    border-radius: 3px;
    pointer-events: none;
}

.carta-num {
    font-family: 'Playfair Display', serif;
    font-size: 9px;
    font-weight: 700;
    color: #C0392B;
    align-self: flex-start;
    line-height: 1;
    z-index: 1;
}

.carta-emoji {
    font-size: 34px;
    line-height: 1;
    z-index: 1;
}

.carta-name {
    font-family: 'Playfair Display', serif;
    font-size: 7.5px;
    font-weight: 700;
    color: #2C1810;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.2;
    z-index: 1;
}
</style>