<template>
  <div>
    <ul class="sidebar-list">
      <li>
        <div class="menu-item" @click="toggleMap">
          <span>Map</span>
          <span class="arrow">{{ showMap ? '▼' : '>' }}</span>
        </div>
        <ul v-if="showMap" class="submenu">
          <LayerToggle />
          <li>Events</li>
          <li>Search</li>
          <li>Tools</li>
          <li>Filters</li>
          <li>Basemap</li>
        </ul>
      </li>
      <li>
        <div class = "menu-item" @click="toggleWorkOrder">
          <span>Work Order</span>
          <span class="arrow">{{ showWODropdown ? '▼' : '>' }}</span>
        </div>
        <ul v-if="showWODropdown" class = "submenu">
          <li @click="openModal" :class="{ disabled: workOrderFlowStep !== 'idle' }">Create Work Order</li>
          <li>All Work Orders</li>
        </ul>
      </li>
      <li>Maintenance</li>
      <li>Reporting</li>
      <li>Settings</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LayerToggle from './Map/LayerToggle.vue'
import { showWODropdown, workOrderFlowStep, workOrderUIState, mapMode } from '@/composables/workOrder/useWorkOrderUI'

const showMap = ref(false)
const emit = defineEmits(['open-workorder-form']);

function toggleMap() {
  showMap.value = !showMap.value
}
function toggleWorkOrder(){
  showWODropdown.value = !showWODropdown.value
}
function openModal(){
  console.log('Its been clicked');
  //showWorkOrderForm.value = true
  workOrderFlowStep.value = 'in-process';
  workOrderUIState.value = 'form-open';
  // emit('open-workorder-form');
}
</script>

<style>
.sidebar-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  padding: 5px;
}

.submenu {
  list-style: none;
  padding-left: 15px;
}
.disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
</style>
