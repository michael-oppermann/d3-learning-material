
// Initialize Leaflet map
//  nyc-map = ID of parent <div> container
//  [40.749068, -74.006712] = center of the map
//  13 = zoom level
const map = L.map('nyc-map').setView([40.749068, -74.006712], 12);

// Add Open Street Map tiles to the map
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Load GeoJSON data of the NYC boundaries and add them as a new layer to the map
d3.json('data/nyc_ boroughs.json').then(data => {
  const boroughs = L.geoJson(data, {
    color: '#767ba7',
    weight: 2,
    fillOpacity: 0.4,
    onEachFeature: addPopup
  }).addTo(map);
});

// For each feature (borough), we add a popup
function addPopup(feature, layer) {
  if (feature.properties && feature.properties.boro_name) {
    layer.bindPopup(feature.properties.boro_name);
  }
}