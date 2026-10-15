import { ref } from 'vue'

type LocationType = "point" | "room"
type latitude = number | null
type longitude = number | null

type Task = {
  id: string
  label: string
  title: string
  description: string
  latitude: latitude
  longitude: longitude
  room: string,
  assigned_to: string,
  method: string,
  notes: string,
  hasLocation: boolean,
  locationType: LocationType,
  locationConfirmation: boolean
}

type WorkOrder = {
  workOrderID: string
  title: string
  description: string
  tasks: Task[]
}

//The function below is returning an object and Typescript is checking the Task rule from above matches
function createBlankTask(): Task {
  return {
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
    locationType: "point",
    locationConfirmation: false
  }
}

export function createBlankWorkOrder(): WorkOrder {
  return {
    workOrderID: '',
    title: '',
    description: '',
    tasks: [createBlankTask()],
  }
}

export const workOrder = ref<WorkOrder>(createBlankWorkOrder())