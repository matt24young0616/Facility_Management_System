<template>
  <div class="modal">
    <div
      v-if="workOrderFlowStep === 'in-process'"
      class="location-choice"
      style="display: flex; flex-direction: column; height: 100%; width: 100%"
    >
      <div class="modal-header" style="padding: 6px 10px; border-bottom: 1px solid #ddd">
        <h2>Create Work Order</h2>
        <div class="tab-header" style="display: flex; flex-direction: row; width: 100%; gap: 8px">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'workorder' }"
            @click="activeTab = 'workorder'"
          >
            Work Order
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'task' }"
            @click="activeTab = 'task'"
          >
            Task
          </button>
        </div>
      </div>
      <div class="modal-body" style="flex: 1; overflow-y: auto; min-height: 0">
        <form @submit.prevent="handleSubmit">
          <div class="work-order-tab" v-if="activeTab === 'workorder'" style="margin-top: 20px">
            <div class="form-group">
              <label>Title</label>
              <input type="text" v-model="form.title" placeholder="Title" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea
                rows="4"
                v-model="form.description"
                placeholder="Describe the issue..."
              ></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Priority</label>
                <select v-model="form.priority">
                  <option value="">Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div class="form-group">
                <label>Category</label>
                <select v-model="form.category">
                  <option value="">Select Category</option>
                  <option v-for="category in categories" :key="category.ID" :value="category.ID">
                    {{ category.Name }}
                  </option>
                </select>
                <label>Types</label>
                <select v-model="form.type">
                  <option value="">Select Type</option>
                  <option v-for="type in filteredTypes" :key="type.ID" :value="type.ID">
                    {{ type.Name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Requestor</label>
                <select v-model="form.created_by">
                  <option value="">Select Assignee</option>
                  <option value="Matthew">Matthew</option>
                  <option value="Jeff">Jeff</option>
                  <option value="Chris">Chris</option>
                </select>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea
                  rows="4"
                  v-model="form.notes"
                  placeholder="Notes on work order..."
                ></textarea>
              </div>
            </div>
          </div>
          <div class="task-order-tab" v-else-if="activeTab === 'task'">
            <div class="slider-viewport">
              <div class="slider-track" :style="{ transform: `translateX(-${index * 100}%)` }">
                <div class="slide" v-for="(task, i) in workOrder.tasks" :key="task.id">
                  <h3>Task {{ i + 1 }}</h3>
                  <div class="form-group">
                    <label>Title</label>
                    <input v-model="task.title" />
                  </div>
                  <div class="form-group">
                    <label>Description</label>
                    <input v-model="task.description" />
                  </div>
                  <div class="form-group">
                    <label>Method</label>
                    <select v-model="task.method">
                      <option value="">Select Method</option>
                      <option v-for="method in filteredMethods" :key="method.ID" :value="method.ID">
                        {{ method.Method }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Assigned To:</label>
                    <select v-model="task.assigned_to">
                      <option value="Matthew">Matthew</option>
                      <option value="Jeff">Jeff</option>
                      <option value="Chris">Chris</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Notes</label>
                    <textarea v-model="task.notes"></textarea>
                  </div>
                  <div>
                    <h3>Existing Asset</h3>
                    <input placeholder="Search for an asset..." />
                    <button type="button" @click="chooseAsset">Choose Asset</button>
                  </div>
                  <div>
                    <h3>New Location</h3>
                    <div class="work-order-tab" v-if="!task.hasLocation">
                      <button type="button" @click="addLocation(i)">Select Location</button>
                    </div>
                    <div class="work-order-tab" v-else-if="task.hasLocation">
                      <button type="button" @click="editLocation(i)">Edit Location</button>
                    </div>
                  </div>
                  <div>
                    <div v-if="task.locationType === 'point'">
                      <div v-if="!task.hasLocation"></div>
                      <div v-else>
                        <span>{{ task.latitude }}</span>
                      </div>
                    </div>
                    <div v-else-if="task.locationType === 'room'">
                      <span>{{ task.room }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="controls">
              <button
                type="button"
                @click="prev"
                :disabled="index === 0 || mapMode === 'selecting'"
              >
                ←
              </button>
              <button type="button" @click="next" :disabled="isLast || mapMode === 'selecting'">
                →
              </button>
              <button type="button" @click="addTask">+ Add Task</button>
              <button type="button" @click="deleteTask" :disabled="onlyOne">Delete Task</button>
            </div>
          </div>
        </form>
      </div>
      <div
        class="modal-footer"
        style="margin-top: auto; text-align: center; padding-bottom: 20px; padding-top: 20px"
      >
        <button type="button" @click="cancelWO">Cancel</button>
        <button type="button" @click="handleSubmit">Submit</button>
        <!-- <button type="button">Minimize</button> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRaw, watch } from 'vue'
import {
  locationStep,
  newLocationPoint,
  selectedLocation,
  roomsLayerView,
  highlightHandle,
} from '@/composables/temporaryLayers'
import { workOrder, createBlankWorkOrder } from '@/composables/workOrder/useworkOrder'
import { index, activeTaskIndex, activeTaskID } from '@/composables/workOrder/useTaskState'
import {
  mapMode,
  workOrderUIState,
  workOrderFlowStep,
} from '@/composables/workOrder/useWorkOrderUI'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import { tempLayer } from '@/composables/useLayers'
import { categories, types, methods } from '@/composables/workOrder/useCategory'
import { useSketchTool } from '@/composables/sketch'
import { map } from 'leaflet'
// import { only } from 'node:test'

const workOrderTable = new FeatureLayer({
  url: 'https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/Work_Order_History/FeatureServer/0',
})

const taskTable = new FeatureLayer({
  url: 'https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/Task_History/FeatureServer/0',
})

// const workOrderLayer = new FeatureLayer({
//   url: 'https://services5.arcgis.com/IXs6bPeDHG56dGAo/arcgis/rest/services/WORK_ORDER/FeatureServer',
// })

const activeTab = ref('workorder')

// const tasks = ref([{ title: '', description: '' }])

function cancelWO() {
  //sketchVM.cancel()

  workOrder.value = createBlankWorkOrder()
  if (highlightHandle.value) {
    highlightHandle.value.remove()
  }
  //console.log(workOrder.value);

  index.value = 0
  activeTaskIndex.value = 0
  activeTaskID.value = null
  workOrderUIState.value = 'hidden'
  workOrderFlowStep.value = 'idle'

  tempLayer.removeAll()
}

function addTask() {
  workOrder.value.tasks.push({
    id: crypto.randomUUID(),
    label: '',
    title: '',
    description: '',
    latitude: null,
    longitude: null,
    room: '',
    assigned_to: '',
    method: '',
    notes: '',
    hasLocation: false,
    locationType: 'point',
    locationConfirmation: false,
  })

  index.value = workOrder.value.tasks.length - 1
  const task = workOrder.value.tasks[index.value]
  if (!task) return

  activeTaskID.value = task.id
  console.log(workOrder.value)
  //console.log('This is the active task id: ' + activeTaskID.value)
  // tasks.value.push({ title: '', description: '' })
  // index.value = tasks.value.length - 1 // jump to new task
}

function deleteTask() {
  const removedIndex = index.value
  const taskToRemove = workOrder.value.tasks[removedIndex]

  if (!taskToRemove) return

  // 1. REMOVE GRAPHIC FIRST (from tempLayer)
  const graphic = tempLayer.graphics.find((g) => g.attributes?.id === taskToRemove.id)

  if (graphic) {
    tempLayer.remove(graphic)
  }

  workOrder.value.tasks.splice(removedIndex, 1)

  // if we deleted the last task, move left
  if (index.value >= workOrder.value.tasks.length) {
    index.value = workOrder.value.tasks.length - 1
  }

  const task = workOrder.value.tasks[index.value]
  if (!task) return

  activeTaskID.value = task.id
}

const isLast = computed(() => index.value >= workOrder.value.tasks.length - 1)
const onlyOne = computed(() => workOrder.value.tasks.length === 1)

function next() {
  const currentTask = workOrder.value.tasks[index.value]

  if (!currentTask) return
  if (index.value >= workOrder.value.tasks.length - 1) return

  if (currentTask.hasLocation) {
    currentTask.locationConfirmation = true
    console.log(`Task ${index.value} location confirmed`)
  }

  index.value++

  const nextTask = workOrder.value.tasks[index.value]

  if (nextTask) {
    activeTaskID.value = nextTask.id
  }

  console.log(`Index after: ${index.value}`)
}

function prev() {
  const currentTask = workOrder.value.tasks[index.value]

  if (!currentTask) return
  if (currentTask.hasLocation) {
    currentTask.locationConfirmation = true
    console.log(`Task ${index.value} location confirmed`)
  }
  if (index.value > 0) index.value--
  const task = workOrder.value.tasks[index.value]
  if (!task) return

  activeTaskID.value = task.id
  //console.log('This is the active task id: ' + activeTaskID.value)
}

function addLocation(i: number) {
  activeTaskIndex.value = i
  mapMode.value = 'selecting'
  console.log(workOrder.value)
}

function editLocation(i: number) {
  activeTaskIndex.value = i
  mapMode.value = 'selecting'
  console.log(activeTaskIndex.value)
  console.log('Lets edit the location')
}

function chooseAsset() {
  console.log('Choosing asset')
}

const form = ref({
  title: '',
  description: '',
  priority: '',
  status: 'Open',
  atype: 'Test',
  notes: '',
  created_by: '',
  category: '',
  type: '',
  method: '',
  work_performed: 'Matthew',
})

const filteredTypes = computed(() => {
  return types.value.filter((type) => type.Category_ID === form.value.category)
})

const filteredMethods = computed(() => {
  return methods.value.filter((type) => type.Type_ID === form.value.type)
})

watch(
  () => form.value.category,
  () => {
    form.value.type = ''
  },
)

const handleSubmit = async () => {
  console.log('Test')
  const newRecord = new Graphic({
    attributes: {
      Work_Order_ID: '000001',
      Title: form.value.title,
      Description: form.value.description,
      Priority: form.value.priority,
      Category: form.value.category,
      Types: 'Test',
      Requestor: form.value.created_by,
      Status: form.value.status,
      Created_By: form.value.created_by,
      Notes: form.value.notes,
      Created_Date: new Date().toISOString(),
      Completion_Date: new Date().toISOString(),
      Due_Date: new Date().toISOString(),
      Last_Updated: new Date().toISOString(),
    },
  })

  console.log(newLocationPoint.value)

  const addWORecord = await workOrderTable.applyEdits({
    addFeatures: [newRecord],
  })

  const objectID = addWORecord.addFeatureResults[0].objectId

  const workOrderId = `WO-${String(objectID).padStart(6, '0')}`

  const updateGraphic = new Graphic({
    attributes: {
      OBJECTID: objectID,
      Work_Order_ID: workOrderId,
    },
  })

  await workOrderTable.applyEdits({
    updateFeatures: [updateGraphic],
  })

  workOrder.value.workOrderID = workOrderId
  console.log(workOrder.value)

  const taskGraphics: __esri.Graphic[] = workOrder.value.tasks.map(
    (task) =>
      new Graphic({
        attributes: {
          Work_Order_ID: workOrder.value.workOrderID,
          Title: task.title,
          Description: task.description,
          Method: task.method,
          Assigned_To: task.assigned_to,
          Notes: task.notes,
          Location_Type: task.locationType,
        },
      }),
  )

  const addTaskRecord = await taskTable.applyEdits({
    addFeatures: taskGraphics,
  })

  const updates = addTaskRecord.addFeatureResults.map((res, i) => {

    const taskId = `TASK-${String(res.objectId).padStart(6, '0')}`

    return new Graphic({
      attributes: {
        OBJECTID: res.objectId,
        Task_ID: taskId,
      },
    })
  })

  await taskTable.applyEdits({
    updateFeatures: updates,
  })

  // const rawPoints = toRaw(newLocationPoint.value)
  // console.log(rawPoints)

  // const features = rawPoints.map((p) => {
  //   //const geometry = new Point(p.geometry)
  //   const geometry = new Point({
  //     x: p.x,
  //     y: p.y,
  //   })

  //   return new Graphic({
  //     geometry: geometry, // 👈 THIS is where geometry goes
  //     attributes: {
  //       //id: p.id, // optional but recommended
  //       DESCRIPTIO: form.value.description,
  //       STATUS: form.value.status,
  //       PRIORITY: form.value.priority,
  //       ASSET_TYPE: form.value.atype,
  //       CREATED_DA: new Date().toISOString(),
  //       ASSIGNED_T: form.value.assigned_to,
  //       COMPLETED_: new Date().toISOString(),
  //       NOTES: form.value.notes,
  //       CREATED_BY: form.value.created_by,
  //       CATEGORY: form.value.category,
  //       LAST_UPDAT: new Date().toISOString(),
  //       WORK_PERFO: form.value.work_performed,
  //     },
  //   })
  // })

  // console.log(features)

  // const result = await workOrderLayer.applyEdits({
  //   addFeatures: features,
  // })

  // console.log(result)
  workOrderUIState.value = 'hidden'
  workOrderFlowStep.value = 'idle'
  mapMode.value = 'idle'
  tempLayer.removeAll()
}

// const closePopup = ref(false)
const emit = defineEmits([
  'close-workorder-form',
  'create-new-location',
  'minimize-modal',
  'cancel-workorder',
])

// function minimizeModal() {
//   //console.log('Minimize Modal');
//   emit('minimize-modal')
// }
function closeModal() {
  //console.log('Close Modal')
  //emit('close-workorder-form')
}
function createNewLocation() {
  //emit('close-workorder-form')
  emit('create-new-location')
}
function cancelWorkOrder() {
  //console.log('Cancelling work order');
  emit('cancel-workorder')
}
</script>

<style>
.slider-viewport {
  overflow: hidden;
  width: 100%;
}

.slider-track {
  display: flex;
  transition: transform 0.3s ease;
}

.slide {
  min-width: 100%;
  flex-shrink: 0;
  padding: 10px;
  box-sizing: border-box;
}

.modal {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 450px;
  height: 800px;
  z-index: 1001;
  /* display: flex;
  flex-direction: column; */
}
.tab-button {
  flex: 1; /* 👈 makes both buttons stretch equally */
  padding: 12px;
  text-align: center;
  background: none;
  border-bottom: 1px solid transparent;
}
.tab-button:hover {
  border-bottom: 1px solid red;
  border-radius: 0px;
}
.tab-button.active {
  border-bottom: 1px solid blue;
  border-radius: 0px;
  font-weight: bold;
}

.wo-title {
  text-align: center;
}
.create-title {
  text-align: center;
}

.card {
  flex: 1;
  padding: 1.5rem;
  border: 2px solid #ccc;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  background: #fff;
}

.card + .card {
  margin-top: 16px;
}

.close-btn {
  width: 100%;
}
.close-btn:hover {
  border-color: #007acc;
  background: #e6f2ff;
}

.card:hover {
  border-color: #007acc;
  background: #e6f2ff;
}
.workorder-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 500px;
  background: white;
}

/* Title */
.title {
  margin: 0;
}

/* Field wrapper */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row .form-group {
  flex: 1;
}

/* Inputs */
input,
textarea,
select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

/* Focus state */
input:focus,
textarea:focus,
select:focus {
  border-color: #2f6fed;
}

/* Location display */
.location-box {
  padding: 10px;
  background: #f3f6ff;
  border: 1px solid #cdd8ff;
  border-radius: 6px;
  font-size: 13px;
}

/* Buttons */
.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  padding: 10px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.cancel {
  background: #e5e5e5;
}

.submit {
  background: #2f6fed;
  color: white;
}
.minimize {
  background: #f0f0f0;
  color: #333;
}

.minimize:hover {
  background: #e6e6e6;
}
</style>
