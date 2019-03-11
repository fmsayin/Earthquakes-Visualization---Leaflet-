//USGS API call to get earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (earthquakeData) {
  createFeatures(earthquakeData.features);
});

// Magnitude  Function
function markerSize(magnitude) {
  return magnitude * 30000;
};

// Color Function for Magnitude
function getColor(m) {

  var colors = ['lightgreen', 'yellowgreen', 'gold', 'orange', 'lightsalmon', 'tomato'];

  return m > 5 ? colors[5] :
    m > 4 ? colors[4] :
      m > 3 ? colors[3] :
        m > 2 ? colors[2] :
          m > 1 ? colors[1] :
            colors[0];
};

function createFeatures(earthquakeData) {

  var earthquakes = L.geoJSON(earthquakeData, {

    // Each feature a popup information pertinent to it
    onEachFeature: function (feature, layer) {
      layer.bindPopup("<h3 > Magnitude: " + feature.properties.mag +
        "</h3><h3>Location: " + feature.properties.place +
        "</h3><hr><h3>" + new Date(feature.properties.time) + "</h3>");
    },

    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {
          radius: markerSize(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .8,
          color: 'grey',
          weight: .5
        })
    }
  });

  createMap(earthquakes);
};

function createMap(earthquakes) {

  // outdoorsmap, lightmap, and satelliemap layers
  let mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';


  let accessToken = 

  'pk.eyJ1IjoiZm1zbWFwYXBpIiwiYSI6ImNqc3Jwbm5nZjA0d200M3FpaWhycHNuNW0ifQ._WLtYCJvNZzm7iZf5xMeEw';

  let lightmap = L.tileLayer(mapboxUrl, { id: 'mapbox.light', maxZoom: 20, accessToken: accessToken });
  let outdoorsmap = L.tileLayer(mapboxUrl, { id: 'mapbox.run-bike-hike', maxZoom: 20, accessToken: accessToken });
  let satellitemap = L.tileLayer(mapboxUrl, { id: 'mapbox.streets-satellite', maxZoom: 20, accessToken: accessToken });


  var tectonicPlates = new L.LayerGroup();
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function (plateData) {
    L.geoJSON(plateData,
      {
        color: 'orange',
        weight: 2
      })
      .addTo(tectonicPlates);
  });

  // BaseMaps object layer
  var baseMaps = {
    "Grayscle": lightmap,
    "Outdoors": outdoorsmap,
    "Satellite Map": satellitemap
  };

  // Overlay object layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  // Create lightmap and earthquakes layers to load
  var myMap = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 3,
    layers: [lightmap, earthquakes]
  });


  // baseMaps and overlayMaps control
  // layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // legend information in the right bottom 
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      magnitudes = [0, 1, 2, 3, 4, 5],
      labels = [];

    div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"
    // label for each interval
    for (var i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
        magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(myMap);
}
