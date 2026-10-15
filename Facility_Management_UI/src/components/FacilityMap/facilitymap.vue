<template>
  <div ref="mapDiv" class="map" style="width: 100%; height: 100%">
    <!-- Overlay Box -->
    <div class="map-overlay">
      <Sidebar />
    </div>
  </div>
  <!-- <div class="overlay" v-if="showWorkOrderForm">
    <CreateWorkOrder @close-workorder-form="closeWorkOrderForm"/>
  </div> -->
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef, watch } from 'vue'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import { registerArcGISToken } from '@/services/tokenService'
import { arcgisLayers, layerControls, webmapLayerGroup } from '@/composables/useLayers'
import {
  newLocationPoint,
  locationStep,
  selectedLocation,
  roomsLayerView,
  highlightHandle,
} from '@/composables/temporaryLayers'
import { workOrder } from '@/composables/workOrder/useworkOrder'
import { index, activeTaskID } from '@/composables/workOrder/useTaskState'
import { mapMode, workOrderUIState } from '@/composables/workOrder/useWorkOrderUI'
import WebMap from '@arcgis/core/WebMap'
import Graphic from '@arcgis/core/Graphic'
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine'
import Sidebar from '../Sidebar/sidebar.vue'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import { useSketchTool } from '@/composables/sketch'
import { useMapClickHandler } from '@/composables/drawOnMap'
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer'
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol'
import LabelClass from '@arcgis/core/layers/support/LabelClass'
import { C } from 'vue-router/dist/router-CWoNjPRp.mjs'
import { tempLayer } from '@/composables/useLayers'
import { loadCategories, loadTypes, loadMethods } from '@/composables/workOrder/useCategory'

const mapDiv = ref<HTMLDivElement | null>(null)
//const tempGraphic = shallowRef<Graphic | null>(null)
const tempGraphics = shallowRef<Graphic[]>([])
const view = shallowRef<MapView | null>(null)
const selectedGraphic = shallowRef<__esri.Graphic | null>(null)

let sketchVM: __esri.SketchViewModel | null = null
//const roomsLayerView = shallowRef<__esri.FeatureLayerView | null>(null)

watch(mapMode, (newVal) => {
  if (newVal !== 'idle') return
  if (!view.value) return

  //view.value.graphics.removeAll() // 🔥 THIS is the key
  //tempLayer.removeAll()

  //tempGraphics.value = []
  //newLocationPoint.value = []
})

onMounted(async () => {
  
  if (!mapDiv.value) return

  /* TOKEN */
  await registerArcGISToken()
  await loadCategories()
  await loadTypes()
  await loadMethods()

  /* MAP */
  // const map = new Map({
  //   basemap: "streets",
  // })

  const webmap = new WebMap({
    portalItem: {
      id: '568603ad0fe84b42a9a02ad07caceae9',
    },
  })

  view.value = new MapView({
    container: mapDiv.value,
    map: webmap,
    center: [-95.488123, 30.375461],
    zoom: 18,
  })

  /* CONFIG */
  const layersConfig = [
    // { name: "BUILDINGS", color: "#b7aba4", outline: { color: "#444", width: 2 } },
    // { name: "DECK", color: "#e77148", outline: null },
    // { name: "DRAINAGE", color: "#beb297", outline: null },
    // { name: "DRIVE_AISLES", color: "#9c9c9c", outline: { color: "#444", width: 1 } },
    // { name: "GRASS", color: "#b4cf99", outline: null },
    // { name: "LIGHT_POLES", color: null, outline: null },
    // { name: "OUTSIDE_STAIRS", color: "#85b66f", outline: null },
    // { name: "PARKING_LOTS", color: "#afafaf", outline: null },
    // { name: "PARKING_SPOTS", color: "#ffffff", outline: null, symbolType: "line" },
    // { name: "PLAYGROUND", color: null, outline: null },
    // { name: "SIDEWALK", color: "#e6e3da", outline: null },
    // { name: "WOODEN_WALKWAY", color: null, outline: null },
  ]

  //Creating array that will hold the feature layers that will be added to the map and typescript saying it will only hold feature layer types
  const createdLayers: FeatureLayer[] = []

  layersConfig.forEach((cfg) => {
    //console.log(cfg);
    const symbol =
      cfg.symbolType === 'line'
        ? { type: 'simple-line', color: cfg.color || '#000' }
        : { type: 'simple-fill', color: cfg.color || '#ccc', outline: cfg.outline || null }

    const layer = new FeatureLayer({
      url: `https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/${cfg.name}/FeatureServer`,
      title: cfg.name,
      visible: true,
      minScale: 295828763.795777,
      maxScale: 35.2655367,
      renderer: cfg.color
        ? {
            type: 'simple',
            symbol,
          }
        : undefined,
    })

    createdLayers.push(layer)

    /* store ArcGIS layer safely */
    arcgisLayers.value[cfg.name] = layer
    console.log(arcgisLayers.value)
    // console.log(arcgisLayers.value[cfg.url]);

    /* create Vue checkbox entry */
    layerControls.value.push({
      title: cfg.name,
      visible: true,
    })
  })

  view.value.when(() => {
    
    // const category = new FeatureLayer({
    //   url: 'https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/Facility_Management_Categories/FeatureServer',
    // })

    // async function loadCategories() {
    //   const result = await category.queryFeatures({
    //     where: '1=1',
    //     outFields: ['*'],
    //     returnGeometry: false,
    //   })

    //   console.log(result.features)

    //   result.features.forEach((feature) => {
    //     console.log(feature.attributes)
    //   })
    // }

    // loadCategories()
    watch(activeTaskID, async () => {
      console.log('This is the current index: ' + index.value)
      const task = workOrder.value.tasks[index.value]
      if (highlightHandle.value) {
        highlightHandle.value.remove()
        highlightHandle.value = null
        console.log('Highlight is removed')
      }

      // -----------------------------
      // RESET ALL POINT SYMBOLS
      // -----------------------------
      tempLayer.graphics.forEach((g) => {
        g.symbol = {
          type: 'simple-marker',
          color: '#7a003c',
          size: 10,
          outline: {
            color: [255, 255, 255],
            width: 1,
          },
        }
      })

      // -----------------------------
      // HIGHLIGHT ACTIVE TASK POINT
      // -----------------------------
      const graphic = tempLayer.graphics.find((g) => g.attributes?.id === task.id)

      if (graphic) {
        graphic.symbol = {
          type: 'simple-marker',
          color: 'yellow',
          size: 14,
          outline: {
            color: 'black',
            width: 2,
          },
        }
      }

      if (!task?.room) return
      if (!roomsLayerView.value) return

      const result = await roomsLayerView.value.queryFeatures({
        where: `room_no = '${task.room}'`,
        returnGeometry: true,
        outFields: ['*'],
      })
      //console.log(result)
      //console.log(result.features)

      const feature = result.features[0]
      if (!feature) return

      // create new highlight
      highlightHandle.value = roomsLayerView.value.highlight(feature)
    })
    const roomLabels = new LabelClass({
      labelExpressionInfo: {
        expression: '$feature.room_no',
      },
      symbol: {
        type: 'text',
        color: 'black',
        haloColor: 'white',
        haloSize: 1,
        font: {
          size: 10,
          family: 'Arial',
        },
      },
      where: '1=1',
    })
    // const workOrderLayer = new FeatureLayer({
    //   url: 'https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/WORK_ORDER/FeatureServer',
    // })
    const CC_Rooms = new FeatureLayer({
      url: 'https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/CC_Rooms/FeatureServer',
      minScale: 50000, // visible when zoomed in closer than this
      maxScale: 0, // visible at all zoomed-out levels
      labelingInfo: [roomLabels],
      labelsVisible: true,
    })

    arcgisLayers.value['CC Rooms'] = CC_Rooms
    console.log(CC_Rooms)
    const CC_Buildings = new FeatureLayer({
      url: 'https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/CC_Buildings/FeatureServer',
      renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
          color: 'red',
        }),
      }),
      minScale: 50000, // visible when zoomed in closer than this
      maxScale: 0, // visible at all zoomed-out levels
    })
    // Add your custom FeatureLayers
    webmap.addMany(createdLayers)
    //webmap.add(workOrderLayer)
    webmap.add(tempLayer)
    webmap.add(CC_Buildings)
    webmap.add(CC_Rooms)

    view.value.whenLayerView(CC_Rooms).then((lv) => {
      roomsLayerView.value = lv
      //console.log('The layer view was created')
    })

    // Move zoom buttons to bottom-right
    view.value.ui.move('zoom', 'bottom-left')

    // 👉 Sketch logic lives in composable
    // We called useSketchTool from composable, then that returned an object sketchVM: SketchViewModel which then result = { sketchVM: SketchViewModel }
    const result = useSketchTool({
      view: view.value!,
      layer: tempLayer,
      newLocationPoint,
      selectedGraphic,
      workOrder,
    })

    sketchVM = result.sketchVM

    //UseMapClickHanlder was called from comoposable, then an object was returned as initClickHandler: initClickHandler, then the property initClickHandler was searched for in return
    //and that object was set equal to const called initClickHandler which would be const initClickHandler = returnedObject.initClickHandler
    const { initClickHandler } = useMapClickHandler({
      view: view.value!,
      sketchVM,
      tempLayer,
      selectedGraphic,
      mapMode,
      workOrderUIState,
      workOrder,
      index,
      roomsLayerView,
    })

    initClickHandler()

    // Store ALL WebMap layers in shared state
    webmapLayerGroup.value = webmap.layers.toArray()

    // Add ONE checkbox for the basemap
    layerControls.value.push({
      title: 'Campus Map',
      visible: true,
      type: 'group',
    })
  })
})
</script>

<style>
.map {
  width: 100%;
  height: 100%;
}
/* Overlay box */
.map-overlay {
  position: absolute;
  top: 80px;
  left: 60px;

  width: 250px;
  max-height: 80%;
  overflow-y: auto;

  background: white;
  border-radius: 12px;
  padding: 16px;

  z-index: 20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
