// src/stores/layersStore.ts
import { reactive } from 'vue'
import type VectorTileLayer from '@arcgis/core/layers/VectorTileLayer'

export const vectorLayers = reactive<Record<string, VectorTileLayer>>({})