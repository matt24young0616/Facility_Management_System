<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <div style="height: 5%; width: 100%; background-color: #0f172b;">
      <div>Testing</div>
    </div>
    <div class="facility-hub-container">
      <facilitymap />
    </div>
    <div class="overlay" v-if="workOrderUIState === 'form-open'">
        <WorkOrderModal
          @create-new-location="newLocation"
          @cancel-workorder="cancellingWorkOrder"
        />
    </div>
    <MinimizedFormBar v-if="workOrderFlowStep === 'in-process'" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
// import Map from '@arcgis/core/Map'
// import MapView from '@arcgis/core/views/MapView'
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
// import IdentityManager from '@arcgis/core/identity/IdentityManager'
// import { registerArcGISToken } from '@/services/tokenService'
import Sidebar from '../components/Sidebar/sidebar.vue'
import facilitymap from '@/components/FacilityMap/facilitymap.vue'
// import CreateWorkOrder from '@/components/Sidebar/Work Order/CreateWorkOrder.vue'
import MinimizedFormBar from '@/components/Sidebar/Work Order/MinimizedFormBar.vue'
import WorkOrderModal from '@/components/Sidebar/Work Order/WorkOrderModal.vue'
import { mapMode, workOrderFlowStep, workOrderUIState } from '@/composables/workOrder/useWorkOrderUI'

// function minimizeModalProgress() {
//   workOrderUIState.value = 'minimized'
// }

function newLocation() {
  // mapMode.value = 'selecting'
  // workOrderUIState.value = 'minimized'
  workOrderUIState.value = 'form-open'
  workOrderFlowStep.value = 'in-process'
}
function cancellingWorkOrder() {
  mapMode.value = 'idle'
  workOrderUIState.value = 'hidden'
  workOrderFlowStep.value = 'idle'
}

// const mapDiv = ref<HTMLDivElement | null>(null)

// onMounted(async () => {
//   if (!mapDiv.value) return

//   /* TOKEN */
//   await registerArcGISToken()

//   /* MAP */
//   const map = new Map({
//     basemap: 'streets',
//   })

//   const view = new MapView({
//     container: mapDiv.value,
//     map,
//     center: [-95.4912, 30.3329],
//     zoom: 18,
//   })
// });
</script>

<style scoped>
.facility-hub-container {
  display: flex;
  /*height: 100vh; /* full viewport height */
  flex-direction: row;
  height: 95%;
  width: 100%;
}

.sidebar-wrapper {
  width: 20%;
}

.sidebar-panel {
  width: 100%;
  height: 100%; /* fills parent wrapper */
  background-color: green; /* just for demo */
}

.main-content {
  width: 80%;
  background-color: yellow; /* just for demo */
}
/* .overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
} */
</style>
