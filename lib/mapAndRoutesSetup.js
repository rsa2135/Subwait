import L from 'leaflet';
import routes from '../data/routes';

// instantiate map
export const map = L.map('mapContainer').setView([40.7128, -74.0059], 13);

// Import CARTO maps
export const layer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
}).addTo(map);

// coloring the different lines
export const coloring = L.geoJSON(routes, {
    style: function(feature) {
        switch (feature.properties.route_id) {
          case "1": return {color: "#EE352E", "weight": 1.5};
          case "2": return {color: "#EE352E", "weight": 1.5};
          case "3": return {color: "#EE352E", "weight": 1.5};
          case "4": return {color: "#00933C", "weight": 1.5};
          case "5": return {color: "#00933C", "weight": 1.5};
          case "6": return {color: "#00933C", "weight": 1.5};
          case "B": return {color: "#FF6319", "weight": 1.5};
          case "D": return {color: "#FF6319", "weight": 1.5};
          case "F": return {color: "#FF6319", "weight": 1.5};
          case "M": return {color: "#FF6319", "weight": 1.5};
          case "A": return {color: "#2850AD", "weight": 1.5};
          case "C": return {color: "#2850AD", "weight": 1.5};
          case "E": return {color: "#2850AD", "weight": 1.5};
          case "G": return {color: "#6CBE45", "weight": 1.5};
          case "J": return {color: "#996633", "weight": 1.5};
          case "Z": return {color: "#996633", "weight": 1.5};
          case "L": return {color: "#A7A9AC", "weight": 1.5};
          case "N": return {color: "#FCCC0A", "weight": 1.5};
          case "Q": return {color: "#FCCC0A", "weight": 1.5};
          case "R": return {color: "#FCCC0A", "weight": 1.5};
          case "S": return {color: "#808183", "weight": 1.5};
          case "FS": return {color: "#808183", "weight": 1.5};
          case "GS": return {color: "#808183", "weight": 1.5};
          case "SI": return {color: "#2850AD", "weight": 1.5};
          case "7": return {color: "#B933AD", "weight": 1.5};
          case "Air": return {color: "#FDEF50", "weight": 1.5};

        }
    }
}).addTo(map);