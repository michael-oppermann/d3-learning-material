
// Initialize Leaflet map
//  nyc-map = ID of parent <div> container
//  [40.749068, -74.006712] = center of the map
//  13 = zoom level
const map = L.map('nyc-map').setView([40.749068, -74.006712], 12);

// Add Open Street Map tiles to the map
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Specify directory with leaflet images (e.g., markers)
L.Icon.Default.imagePath = 'images/';

// Add a marker (with popup) at a specific geo coordinate
const marker = L.marker([40.713008, -74.013169])
    .bindPopup('<strong>One World Trade Center</strong><br>New York City')
    .addTo(map);
/*
// Add a circle centered at the *Four Seasons NY* with a radius of 500 meters.
const circle = L.circle([40.762188, -73.971606], {
    color: 'steelblue',
    fillColor: '#ccc',
    fillOpacity: 0.7,
    radius: 500
}).addTo(map);

// Add a polygon to highlight the SoHo district
const polygon = L.polygon(
  [
      [40.728328, -74.002868],
      [40.721937, -74.005443],
      [40.718961, -74.001280],
      [40.725287, -73.995916]
  ],
  { 
    color: 'red',
    fillOpacity: 0.7,
    weight: 3
  }
).addTo(map);
polygon.bindPopup("SoHo, Manhattan");*/