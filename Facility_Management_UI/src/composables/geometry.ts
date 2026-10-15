// utils/geometry.ts
import * as projection from "@arcgis/core/geometry/projection"
import Point from "@arcgis/core/geometry/Point"

const projected = projection.project({
  geometry: point,
  outSpatialReference: { wkid: 4326 }
}) as Point