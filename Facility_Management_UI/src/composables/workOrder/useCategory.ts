import { ref } from 'vue'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'

export const categories = ref([])
export const types = ref([])
export const methods = ref([])

const categoryLayer = new FeatureLayer({
  url: 'https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/Facility_Management_Categories/FeatureServer',
})

const typeLayer = new FeatureLayer({
  url: 'https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/Facility_Management_Types/FeatureServer',
})

const methodLayer = new FeatureLayer({
  url: 'https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/Facility_Management_Methods/FeatureServer',
})

export async function loadCategories() {
  const result = await categoryLayer.queryFeatures({
    where: '1=1',
    outFields: ['*'],
    returnGeometry: false,
  })

  categories.value = result.features.map(
    (f) => f.attributes
  )

  console.log(categories.value)
}

export async function loadTypes() {
  const result = await typeLayer.queryFeatures({
    where: '1=1',
    outFields: ['*'],
    returnGeometry: false,
  })

  types.value = result.features.map(
    (f) => f.attributes
  )

  console.log(types.value)
}

export async function loadMethods() {
  const result = await methodLayer.queryFeatures({
    where: '1=1',
    outFields: ['*'],
    returnGeometry: false,
  })

  methods.value = result.features.map(
    (f) => f.attributes
  )

  console.log(methods.value)
}