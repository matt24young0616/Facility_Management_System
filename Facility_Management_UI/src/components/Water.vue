<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { vectorLayers } from '../stores/layerStores'

const visibleLayers = ref<Record<string, boolean>>({})

onMounted(async () => {
  try {
    const metadataRes = await fetch('http://localhost:3000/api/layers')
    const layerMetadata = await metadataRes.json()

    for (const layer of layerMetadata) {
      visibleLayers.value[layer.name] =
        ['sprinklers', 'buildings'].includes(layer.name)
    }

  } catch (err) {
    console.error('Error fetching layer metadata:', err)
  }
})

function toggleLayer(layerName: string) {
  visibleLayers.value[layerName] = !visibleLayers.value[layerName]

  const layer = vectorLayers[layerName]
  if (layer) {
    layer.visible = visibleLayers.value[layerName]
  }
}
</script>

<template>
  <div>
    <h2>Layer Controls</h2>

    <div
      v-for="(visible, layerName) in visibleLayers"
      :key="layerName"
    >
      <label>
        <input
          type="checkbox"
          :checked="visible"
          @change="toggleLayer(layerName)"
        />
        {{ layerName }}
      </label>
    </div>
  </div>
</template>

<style scoped>
label {
  display: block;
  margin-bottom: 6px;
}
</style>