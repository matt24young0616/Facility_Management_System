<template>
  <div class="map-container">

    <!-- Layer Control Panel -->
    <div class="layer-panel">
      <h3>Toggle Layers</h3>
      <ul>
        <li>Dashboard</li>
        <li><span>Map</span>
          <div v-for="layer in layerControls" :key="layer.title">
        <input
          type="checkbox"
          :id="layer.title"
          v-model="layer.visible"
          @change="toggleLayer(layer)"
        />
        <label :for="layer.title">{{ layer.title }}</label>
      </div>
        </li>
        <li>Work Orders</li>
        <li>Maintenance</li>
        <li>Reporting</li>
        <li>Settings</li>
      </ul>
    </div>

    <!-- Map -->
    <div ref="mapDiv" class="map"></div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from "vue"
import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/views/MapView"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import IdentityManager from "@arcgis/core/identity/IdentityManager"

const mapDiv = ref<HTMLDivElement | null>(null)

/* UI state (safe for Vue) */
const layerControls = ref<any[]>([])

/* ArcGIS layers (NOT reactive) */
const arcgisLayers = shallowRef<Record<string, FeatureLayer>>({})

function toggleLayer(layerUI: any) {
  const layer = arcgisLayers.value[layerUI.title]
  if (layer) {
    layer.visible = layerUI.visible
  }
}

onMounted(async () => {

  if (!mapDiv.value) return

  /* TOKEN */
  const tokenResponse = await fetch("http://localhost:3000/getToken")
  const tokenData = await tokenResponse.json()

  IdentityManager.registerToken({
    server: "https://forjesus.maps.arcgis.com/",
    token: tokenData.token,
    expires: Date.now() + 60 * 60 * 1000
  })

  /* MAP */
  const map = new Map({
    basemap: "streets"
  })

  const view = new MapView({
    container: mapDiv.value,
    map,
    center: [-95.4912, 30.3329],
    zoom: 18
  })

  /* CONFIG */
  const layersConfig = [
    { url: "BUILDINGS", color: "#b7aba4", outline: { color: "#444", width: 2 } },
    { url: "DECK", color: "#e77148", outline: null },
    { url: "DRAINAGE", color: "#beb297", outline: null },
    { url: "DRIVE_AISLES", color: "#9c9c9c", outline: { color: "#444", width: 1 } },
    { url: "GRASS", color: "#b4cf99", outline: null },
    { url: "LIGHT_POLES", color: null, outline: null },
    { url: "OUTSIDE_STAIRS", color: "#85b66f", outline: null },
    { url: "PARKING_LOTS", color: "#afafaf", outline: null },
    { url: "PARKING_SPOTS", color: "#ffffff", outline: null, symbolType: "line" },
    { url: "PLAYGROUND", color: null, outline: null },
    { url: "SIDEWALK", color: "#e6e3da", outline: null },
    { url: "WOODEN_WALKWAY", color: null, outline: null }
  ]

  const createdLayers: FeatureLayer[] = []

  layersConfig.forEach(cfg => {

    const symbol =
      cfg.symbolType === "line"
        ? {
            type: "simple-line",
            color: cfg.color || "#000"
          }
        : {
            type: "simple-fill",
            color: cfg.color || "#ccc",
            outline: cfg.outline || null
          }

    const layer = new FeatureLayer({
      url: `https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/${cfg.url}/FeatureServer`,
      title: cfg.url,
      visible: true,
      minScale: 295828763.795777,
      maxScale: 35.2655367,
      renderer: cfg.color
        ? {
            type: "simple",
            symbol
          }
        : undefined
    })

    createdLayers.push(layer)

    /* store ArcGIS layer safely */
    arcgisLayers.value[cfg.url] = layer

    /* create Vue checkbox entry */
    layerControls.value.push({
      title: cfg.url,
      visible: true
    })
  })

  map.addMany(createdLayers)
})
</script>

<style scoped>

.map-container {
  display: flex;
  height: 500px;
}

.map {
  width: 100%;
  height: 500px;
  border: 1px solid #ccc;
}

.layer-panel {
  width: 200px;
  background: rgba(255,255,255,0.95);
  padding: 10px;
  overflow-y: auto;
  border-right: 1px solid #ccc;
}

</style>