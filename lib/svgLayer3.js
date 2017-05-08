import * as d3 from 'd3';
import interpolateString from 'd3-interpolate';
import { map } from './mapAndRoutesSetup';

export const svg = d3.select(map.getPanes().overlayPane).append("svg");
export const g = svg.append("g").attr("class", "leaflet-zoom-hide");


export const animation = d3.json('data/taxiday0.geojson', function (data) {
  debugger

  const featuresdata = data.features.filter(function(d) {
    return d.properties;
  });

  const feature = g.selectAll("path")
                   .data(data.features)
                   .enter().append("path")
                   .attr("style", "opacity:0");

  const pointsArray = [];
  let points = g.selectAll(".point")
                  .data(pointsArray);

  let marker = g.append("circle")
                  .attr("r", 5)
                  .attr("id", "marker")

  .attr("id", "marker");
  let i = 0;

  function applyLatLngToLayer(d) {
    let y = d.geometry.coordinates[1];
    let x = d.geometry.coordinates[0];
    return map.latLngToLayerPoint(new L.LatLng(y, x));
  }

  let toLine = d3.line()
    .curve(d3.curveLinear)
    .x(function(d) {
        return applyLatLngToLayer(d).x;
     })
     .y(function(d) {
        return applyLatLngToLayer(d).y;
     });

  function iterate() {
    debugger
    const emptyData = [];

    let path = svg.select("path.trip" + i)
                  .attr("style", "opacity: 0.7")
                  .call(transition);
    debugger

    const transform = d3.geoTransform({
      point: projectPoint
    });

    const d3path = d3.geoPath().projection(transform);

    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    function pathStartPoint(path) {
      debugger
      let d = d3path(featuresdata[i]);
      // let d = toLine(path)
      debugger
      let dsplitted = d.split("L")[0].slice(1).split(",");
      let point = [];
      point[0] = parseInt(dsplitted[0]);
      point[1] = parseInt(dsplitted[1]);
      return point;
    }

    const startPoint = pathStartPoint(path);
    marker.attr("transform", "translate(" + startPoint[0] + "," + startPoint[1] + ")");

    debugger
    svg.selectAll('path').each(function(d) {
      startPoint[0] = startPoint[0];
      startPoint[1] = startPoint[1];
      debugger
      let newLatLon = coordToLatLon(startPoint);
      pointsArray.push([newLatLon.lng, newLatLon.lat, d.properties]);
      debugger
      points = g.selectAll(".point")
                .data(pointsArray)
                .enter()
                .append("circle")
                .attr("r", 5)
                .attr("transform", function(d) {
                  return translatePoint(d);
                });
    });
    debugger
    function transition(path) {
      debugger
      g.selectAll(".point");
      path.transition()
          .duration(function(d) {
            debugger
            const start = Date.parse(d.properties.pickuptime);
            const finish = Date.parse(d.properties.dropofftime);
            const duration = (finish - start) / 60000;

            return (duration);
          })
          .each("end", function(d) {
            i++;
            const nextPath = svg.select("path.trip" + i);
            debugger
            if (nextPath[0][0] !== null) {
              iterate();
            }
          });
    }


  }
  debugger
  iterate();

});

function translatePoint(d) {
  debugger
  var point = map.latLngToLayerPoint(new L.LatLng(d[1],d[0]));
  return "translate(" + point.x + "," + point.y + ")";
}

function coordToLatLon(coord) {
  debugger
  let point = map.layerPointToLatLng(new L.Point(coord[0],coord[1]));
  return point;
}
