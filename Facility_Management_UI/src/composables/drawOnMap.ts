import { highlightHandle } from "@/composables/temporaryLayers"
import { activeTaskIndex } from "@/composables/workOrder/useTaskState"
import { workOrder } from "./workOrder/useworkOrder"

export function useMapClickHandler({
  view,
  sketchVM,
  tempLayer,
  selectedGraphic,
  mapMode,
  workOrderUIState,
  workOrder,
  index,
  roomsLayerView
}) {
  function initClickHandler() {

    view.on('click', async (event) => {
      //console.log('Its been clicked');
      //console.log(mapMode.value);
      //console.log(workOrderUIState.value);
      view.popupEnabled = false

      // 🚫 Block interaction
      // if (mapMode.value !== 'selecting' && workOrderUIState.value !== 'minimized') {
      //   return
      // }
      if (mapMode.value !== 'selecting') {
        return
      }
      // if (activeTaskIndex.value !== null) {
      //   console.log(workOrder.value.tasks[activeTaskIndex.value].locationType);
      //   if (workOrder.value.tasks[activeTaskIndex.value].locationType === 'point' && workOrder.value.tasks[activeTaskIndex.value].hasLocation) {
      //     console.log('This task already uses a point location')
      //     return
      //   }
      // }
      

      // let task = null

      // if (activeTaskIndex.value !== null) {
      //   task = workOrder.value.tasks[activeTaskIndex.value]
      // }

      // if (!task) {
      //   return
      // }

      // 1. Try to hit existing graphics
      const hit = await view.hitTest(event)

      // -----------------------------
      // 1. CHECK ROOMS FIRST (NEW)
      // -----------------------------
      const roomHit = hit.results.find(
        (r: any) => r.graphic?.layer?.title === "CC Rooms"
      );
      //console.log(roomHit);

      if (roomHit) {

        
        

        // 🚫 BLOCK room selection if task already uses point
        // if (task.locationType === 'point' && task.hasLocation) {
        //   console.log('Task already uses a point')
        //   return
        // }

        const roomGraphic = roomHit.graphic;
        //console.log(activeTaskIndex.value);

        //console.log("Room selected:", roomGraphic.attributes.room_no);

        // use shared index instead
        //const taskIndex = activeTaskIndex.value

        if (activeTaskIndex.value !== null) {
          const task = workOrder.value.tasks[activeTaskIndex.value]
          if (!task) return
          //console.log(workOrder.value);
          workOrder.value.tasks[activeTaskIndex.value].room = roomGraphic.attributes.room_no
          workOrder.value.tasks[activeTaskIndex.value].hasLocation = true
          workOrder.value.tasks[activeTaskIndex.value].locationType = 'room';
          workOrder.value.tasks[activeTaskIndex.value].latitude = null;
          workOrder.value.tasks[activeTaskIndex.value].longitude = null;
          mapMode.value = 'idle'
          // 1. FIND EXISTING POINT GRAPHIC FOR THIS TASK
          const existingGraphic = tempLayer.graphics.find(
            (g: any) => g.attributes?.id === task.id
          )
          // 2. REMOVE IT FROM MAP
          if (existingGraphic) {
            tempLayer.remove(existingGraphic)
          }
          console.log(workOrder.value);
        }


        //console.log(roomsLayerView);
        
        
        if (highlightHandle.value) {
          highlightHandle.value.remove()
        }

        highlightHandle.value = roomsLayerView.value?.highlight(roomGraphic)
        // store selected room
        //selectedGraphic.value = roomGraphic;

        // IMPORTANT: stop sketch here
        return;
      }

      const graphicHit = hit.results.find(
        (r: any) => r.graphic && tempLayer.graphics.includes(r.graphic),
      )

      if (graphicHit) {
        console.log('New graphic point is being created');
        selectedGraphic.value = graphicHit.graphic

        sketchVM.update(graphicHit.graphic, {
          tool: 'move',
        })

        return
      }

      // 🚫 BLOCK point creation if task already uses room
      // if (task.locationType === 'room' && task.hasLocation) {
      //   console.log('Task already uses a room')
      //   return
      // }

      // 2. Otherwise create new point
      sketchVM.create('point')
    })
  }

  return {
    initClickHandler,
  }
}