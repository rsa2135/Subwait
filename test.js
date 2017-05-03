L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case ("1" || "2" || "3"):        return {color: "#EE352E"};
            case ("4" || "5" || "6"):        return {color: "#00933C"};
            case ("7"):                      return {color: "#A7A9AC"};
            case ("B" || "D" || "F" || "M"): return {color: "#FF6319"};
            case ("A" || "C" || "E"):        return {color: "#2850AD"};
            case ("G"):                      return {color: "#6CBE45"};
            case ("J" || "Z"):               return {color: "#996633"};
            case ("L"):                      return {color: "#A7A9AC"};
            case ("N" || "Q" || "R"):        return {color: "#FCCC0A"};
            case ("S"):                      return {color: "#808183"};


        }
    }
}).addTo(map);

{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties":
      { "name": "urn:ogc:def:crs:EPSG::4269" }
    },
"features": [
  { "type": "Feature",
    "properties": {
      "Division": "IRT",
      "Line": "7th Ave-Bway",
      "route_id": "1" },
    "geometry": {
      "type": "MultiLineString",
      "coordinates":
