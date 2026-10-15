<template>
  <div class="minimized-bar" v-if="mapMode === 'selecting' && !hasPoint">
    <div class = "minimized-content">
      <span class = "content-text">📝 Click map to begin selecting locations</span>
      <button aria-label="Close" @click="closeSelection">×</button>
    </div>
  </div>
  <div
    class="minimized-bar"
    v-else-if="(hasPoint || hasRoom) && mapMode === 'idle' && locationConfirmation === false"
  >
    <span> ✔ Location selected for Task {{ activeTaskIndex + 1 }} </span>
    <button aria-label="Close">×</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef, computed } from 'vue'
import { newLocationPoint } from '@/composables/temporaryLayers'
import { workOrder } from '@/composables/workOrder/useworkOrder'
import { index } from '@/composables/workOrder/useTaskState'
import {
  mapMode,
  workOrderUIState,
  workOrderFlowStep,
} from '@/composables/workOrder/useWorkOrderUI'
import { activeTaskIndex } from '@/composables/workOrder/useTaskState'

const activeTask = computed(() => {
  return workOrder.value.tasks[activeTaskIndex.value]
})

const hasPoint = computed(() => {
  return activeTask.value?.latitude != null && activeTask.value?.longitude != null
})
console.log(hasPoint.value)

const hasRoom = computed(() => {
  return activeTask.value?.room != null && activeTask.value?.room !== ''
})

const locationConfirmation = computed(() => {
  return activeTask.value?.locationConfirmation ?? false
})

function closeSelection(){
  mapMode.value = 'idle';
  console.log('Clicked the button');
}

function openNewLocationForm() {
  console.log('Its been logged')
  if (workOrderUIState.value !== 'minimized') return
  if (workOrder.value.tasks.length === 0) return

  workOrderUIState.value = 'form-open'
}

function cancelEverything() {
  console.log('Its been clicked')
  workOrderUIState.value = 'hidden'
  workOrderFlowStep.value = 'idle'
  mapMode.value = 'idle'
}
</script>

<style>
.minimized-bar {
  position: fixed;
  bottom: 10px; /* 10px from bottom of viewport */
  left: 50%; /* center horizontally */
  transform: translateX(-50%); /* adjust horizontal center */
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 450px;
  z-index: 1001;
  /* pointer-events: none; */
}
.minimized-content{
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
}
.content-text{
  flex: 1;
}
/* .minimized-bar.clickable {
  pointer-events: auto;
  cursor: pointer;
} */
.hand-test {
  cursor: pointer;
}
.cancel-everything {
  background: grey;
  border-radius: 5px;
}
</style>
