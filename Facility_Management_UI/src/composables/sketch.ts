import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel"
import { watch } from "vue"
import { mapMode } from "@/composables/workOrder/useWorkOrderUI"
import { index, activeTaskIndex } from "@/composables/workOrder/useTaskState"
import { highlightHandle } from "./temporaryLayers"

function normalizePoint(p: __esri.Point) {
  return {
    x: p.longitude,
    y: p.latitude,
  }
}

export function useSketchTool({
  view,
  layer,
  newLocationPoint,
  selectedGraphic,
  workOrder
}) {
  const sketchVM = new SketchViewModel({
    view,
    layer,
    updateOnGraphicClick: true,
    pointSymbol: {
      type: "simple-marker",
      color: "#7a003c",
      size: 10,
      outline: { color: [255, 255, 255], width: 1 },
    },
  })

  // 👇 ADD THIS RIGHT HERE
  watch(mapMode, (val) => {
    // if (val === "idle") {
    //   sketchVM.cancel()
    // }
    if (val === "selecting") {
      sketchVM.updateOnGraphicClick = false
    }
    // if (highlightHandle.value) {
    //   highlightHandle.value.remove()
    //   highlightHandle.value = null
    // }

    // selectedGraphic.value = null
  })
  

  // ======================
  // CREATE
  // ======================
  sketchVM.on("create", (event) => {

    // Only run when user is done placing a point
    if (event.state !== "complete") return

    //Giving the point that was just creating by the user and added to tempLayer from the facilitymap component
    const graphic = event.graphic
    //layer.add(graphic)

    // Reference to the ArcGIS Graphic object.
    // If the ArcGIS graphic is modified, those changes are reflected here because it is the same object reference.
    selectedGraphic.value = graphic
    console.log(selectedGraphic.value);

    const point = normalizePoint(graphic.geometry as __esri.Point)

    // Attach ID for reliable delete/move tracking
    //Creating random number for ID and attaching that random ID to the attributes portion of the graphic point
    

    // newLocationPoint.value.push({
    //   id,
    //   geometry: graphic.geometry,
    //   ...point,
    // })
    if (activeTaskIndex.value !== null) {
      // const id = workOrder.value.tasks[activeTaskIndex.value].id
      // graphic.attributes = { id }
      const task = workOrder.value.tasks[activeTaskIndex.value]
      if (!task) return

      const id = task.id ?? crypto.randomUUID()
      task.id = id

      // attach to graphic
      graphic.attributes = { id }

      graphic.symbol = {
        type: "simple-marker",
        color: "yellow",
        size: 14,
        outline: { color: "black", width: 2 }
      }

      // Link graphic to task
      //graphic.attributes = { id: task.id }
      workOrder.value.title = 'Testing Title Attribute';
      workOrder.value.tasks[activeTaskIndex.value].label = activeTaskIndex.value + 1;
      workOrder.value.tasks[activeTaskIndex.value].longitude = point.x;
      workOrder.value.tasks[activeTaskIndex.value].latitude = point.y;
      workOrder.value.tasks[activeTaskIndex.value].hasLocation = true;
      workOrder.value.tasks[activeTaskIndex.value].locationType = 'point';
      workOrder.value.tasks[activeTaskIndex.value].room = '';
      

      if (highlightHandle.value) {
        highlightHandle.value.remove()
      }
      console.log(workOrder.value.tasks[activeTaskIndex.value].locationConfirmation);
      // newLocationPoint.value.push({
      //   id,
      //   x: point.x,
      //   y: point.y,
      //   geometry: graphic.geometry
      // })
    }
    
    mapMode.value = "idle"
    //console.log(point.x);
    console.log(workOrder.value);
    //mapMode.value = 'selected'
    //console.log(activeTaskIndex.value);
    //console.log(graphic.attributes);
    //console.log("Points:", newLocationPoint.value)
  })

  // ======================
  // UPDATE (MOVE DONE)
  // ======================
  sketchVM.on("update", (event) => {
    console.log("GRAPHICS:", event.graphics)
    console.log("LAYER COUNT:", layer.graphics.length)
    if (event.state !== "active" && event.state !== "complete") return

      event.graphics.forEach((graphic) => {
        const point = graphic.geometry as __esri.Point
        const id = graphic.attributes?.id

        const task = workOrder.value.tasks.find(t => t.id === id)
        if (!task) return

        task.longitude = point.longitude
        task.latitude = point.latitude
      })

      if (event.state === "complete") {
        //selectedGraphic.value = null
        mapMode.value = "idle"
      }
  })
  // sketchVM.on("update", (event) => {

  // if (event.state !== "active" && event.state !== "complete") return

  // event.graphics.forEach((graphic) => {

  //   const point = graphic.geometry as __esri.Point
  //   const id = graphic.attributes?.id

  //   newLocationPoint.value = newLocationPoint.value.map((p) => {
  //     if (p.id !== id) return p

  //     return {
  //       ...p,
  //       x: point.longitude,
  //       y: point.latitude,
  //       geometry: graphic.geometry,
  //     }
  //   })

  //   console.log("UPDATED:", point.longitude, point.latitude)
  //   })

  //   //The event state complete here means the user has placed a point on the map
  //   if (event.state === "complete") {
  //     //sketchVM.cancel()
  //     selectedGraphic.value = null
  //     mapMode.value = 'idle'
  //   }
  // })

  // ======================
  // DELETE
  // ======================
  sketchVM.on("delete", (event) => {
    const idsToRemove = event.graphics.map((g) => g.attributes?.id)

    event.graphics.forEach((g) => {
      layer.remove(g)
    })

    newLocationPoint.value = newLocationPoint.value.filter(
      (p) => !idsToRemove.includes(p.id),
    )

    selectedGraphic.value = null

    // ✅ Re-sync labels AFTER deletion
    workOrder.value.tasks.forEach((task, i) => {
      task.label = i + 1
    })


  })

  return {
    sketchVM,
    //cancelSketch: () => sketchVM.cancel()
  }


  // export function useSketchTool(...) {
  //   const sketchVM = new SketchViewModel(...)

  //   function handleCreate(event) { ... }
  //   function handleUpdate(event) { ... }
  //   function handleDelete(event) { ... }

  //   sketchVM.on("create", handleCreate)
  //   sketchVM.on("update", handleUpdate)
  //   sketchVM.on("delete", handleDelete)

  //   return { sketchVM }
  // }
}