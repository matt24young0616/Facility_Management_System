

// export async function highlightRoomByTask(roomsLayerView, roomNo) {
//   if (!roomsLayerView?.value) return

//   // remove old highlight if needed
//   roomsLayerView.value.highlight?.remove?.()

//   const result = await roomsLayerView.value.queryFeatures({
//     where: `room_no = '${roomNo}'`,
//     returnGeometry: true,
//     outFields: ["*"],
//   })

//   const feature = result.features[0]
//   if (!feature) return

//   roomsLayerView.value.highlight(feature)
// }