import { ref, shallowRef } from "vue"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import type Point from "@arcgis/core/geometry/Point"

//export const newLocationPoint = ref<{x: number; y: number} | null>(null)
export const selectedLocation = ref<__esri.Point | null>(null)
export const newLocationPoint = ref<
  { id: string; x: number; y: number; geometry: Point }[]
>([])


export const locationStep = ref<'idle' | 'initial' | 'selecting' | 'selected' | 'form-open' | 'minimized'>('idle')

//A Handle is not the highlight itself — it’s the thing that lets you stop or remove it.
export const highlightHandle = ref<__esri.Handle | null>(null)
export const roomsLayerView = shallowRef<__esri.FeatureLayerView | null>(null)