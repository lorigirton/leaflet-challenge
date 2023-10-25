document.addEventListener('DOMContentLoaded', function () {
  let myMap = L.map("map").setView([37.09, -95.71], 5);

  // Base Layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(myMap);

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenTopoMap contributors'
  });

  // Overlay Layer
  let earthquakes = L.layerGroup().addTo(myMap);

  // Function to determine marker color based on earthquake depth
  function getColor(depth) {
    return depth < 10 ? "#1a9850" :
      depth < 30 ? "#91cf60" :
      depth < 70 ? "#d9ef8b" :
      depth < 300 ? "#fee08b" : "#d73027";
  }

  // Store our API endpoint as queryUrl.
  let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

  // Perform a GET request to the query URL.
  d3.json(queryUrl).then(function (data) {
    data.features.forEach(function (feature) {
      let magnitude = feature.properties.mag;
      let depth = feature.geometry.coordinates[2];
      let markerOptions = {
        radius: magnitude * 5,
        fillColor: getColor(depth),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };

      let marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], markerOptions)
        .bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${magnitude}<br>Depth: ${depth} km</p>`);

      marker.addTo(earthquakes);
    });

    //Create legend and add to map
    let legend = L.control({ position: "bottomright" });

    //Function to update the legend based on depth
    legend.onAdd = function (map) {
      let div = L.DomUtil.create('div', 'info legend');
      let depths = [0, 10, 30, 70, 300];
      let labels = [];

      //Add legend title
      div.innerHTML = "<h3>Earthquake Depth</h3>";
    
      //Loop through depth intervals and generate a label with a colored square for each interval
      for (let i = 0; i < depths.length; i++) {
        div.innerHTML +=
        '<i class="depth-' + depths[i] + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
      }
      return div;
    };

    //Add legend to map
    legend.addTo(myMap);

    // Overlay Maps
    let overlayMaps = {
      "Earthquakes": earthquakes
    };

    // Create Layer Control
    L.control.layers({ "Street Map": street, "Topographic Map": topo }, overlayMaps, { collapsed: false }).addTo(myMap);
  });
});
