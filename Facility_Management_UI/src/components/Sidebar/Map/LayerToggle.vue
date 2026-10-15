<template>
  <div class="layer-menu">
    <div class="layer-item" @click="toggleLayerDrop">
      <span>Layers</span>
      <span class="arrow">{{ showLayers ? "▼" : ">" }}</span>
    </div>

    <div v-if="showLayers" class="subLayers">
      <div v-for="layer in layerControls" :key="layer.title">
        <input
          type="checkbox"
          :id="layer.title"
          :checked="layer.visible"
          @change="toggleLayer(layer)"
        />
        <label :for="layer.title">{{ layer.title }}</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue"
import { arcgisLayers, layerControls, webmapLayerGroup } from "@/composables/useLayers"

const showLayers = ref(false)

function toggleLayerDrop() {
  showLayers.value = !showLayers.value
}

// Make a reactive copy of layerControls
const reactiveLayerControls = ref<typeof layerControls.value>([])

//Keeps local copy in sync with global state
watchEffect(() => {
  reactiveLayerControls.value = layerControls.value
})

function toggleLayer(layerUI: { title: string; visible: boolean; type?: string }) {

  // ✅ GROUP (your basemap)
  if (layerUI.type === "group") {
    const newValue = !layerUI.visible

    webmapLayerGroup.value.forEach((layer: any) => {
      layer.visible = newValue
    })

    layerUI.visible = newValue
    return
  }

  // ✅ NORMAL FEATURE LAYER
  const layer = arcgisLayers.value[layerUI.title]

  if (layer) {
    layer.visible = !layer.visible

    const uiLayer = reactiveLayerControls.value.find(
      (l) => l.title === layerUI.title
    )

    if (uiLayer) uiLayer.visible = layer.visible
  }
}

</script>

<style scoped>
.layer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 10px;
}

.subLayers {
  list-style: none;
  padding-left: 15px;
}
</style>