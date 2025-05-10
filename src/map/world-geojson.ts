export default {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-180, 90], // Top left (North West)
        [180, 90],  // Top right (North East)
        [180, -90], // Bottom right (South East)
        [-180, -90], // Bottom left (South West)
        [-180, 90]  // Back to starting point to close the polygon
      ]
    ],
  },
  properties: {},
} as GeoJSON.Feature<GeoJSON.Polygon>;
