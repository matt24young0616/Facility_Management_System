import { ref, shallowRef } from "vue"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"

//A reactive array of plain objects used for your UI (checkboxes)
//This is used to control visibility of the layers on the map
export const layerControls = ref<{ title: string; visible: boolean }[]>([])

//Object that stores arcgis layers
export const arcgisLayers = shallowRef<Record<string, FeatureLayer>>({})
export const webmapLayerGroup = shallowRef<any[]>([])
export const tempLayer = new GraphicsLayer()
