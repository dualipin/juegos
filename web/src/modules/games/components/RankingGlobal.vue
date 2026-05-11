<template>
  <div class="card bg-base-100 shadow-lg border border-base-300">
    <div class="card-body">
      <h2 class="card-title text-center text-2xl md:text-3xl">
        Ranking
      </h2>
      <div class="overflow-x-auto mt-4">
        <table class="table table-zebra">
          <tbody>
            <tr
              v-for="(player, index) in ranking"
              :key="player.id || index"
              class="hover"
            >
              <td>
                <div class="badge"
                  :class="{
                    'badge-warning': index === 0,
                    'badge-ghost': index === 1,
                    'badge-error': index === 2,
                    'badge-info': index > 2,
                  }"
                >
                  {{ index + 1 }}
                </div>
              </td>
              <td class="font-medium truncate">
                {{ player.username }}
              </td>
              <td class="font-semibold text-right">
                {{ player.score }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { rankingServices } from '@/modules/games/services/ranking-services'

const props = defineProps<{
  game: string
}>()

const ranking = ref<Array<{ id?: number; username: string; score: number }>>([])

const { getRanking } = rankingServices()

const loadRanking = async () => {
  try {
    ranking.value = await getRanking(props.game)
  } catch (error) {
    console.error('Error fetching ranking:', error)
  }
}

defineExpose({
  loadRanking,
})

onMounted(loadRanking)

// Si el prop `game` cambia, recarga el ranking
watch(() => props.game, loadRanking)
</script>
