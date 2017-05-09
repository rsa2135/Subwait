import * as d3 from 'd3';
import interpolateString from 'd3-interpolate';
import { map } from './mapAndRoutesSetup';

export const svg = d3.select(map.getPanes().overlayPane).append("svg");
export const g = svg.append("g").attr("class", "leaflet-zoom-hide");

export const transform = d3.geoTransform({
    point: projectPoint
  });
export const d3path = d3.geoPath().projection(transform);

function projectPoint(x, y) {
  var point = map.latLngToLayerPoint(new L.LatLng(y, x));
  this.stream.point(point.x, point.y);
}

function translatePoint(d) {
  var point = map.latLngToLayerPoint(new L.LatLng(d[1],d[0]));
  return "translate(" + point.x + "," + point.y + ")";
}

function coordToLatLon(coord) {
  var point = map.layerPointToLatLng(new L.Point(coord[0],coord[1]));
  return point;
}
let topLeft
let bottomRight;
export const animation = d3.json('data/taxiday0.geojson', function (data) {
  debugger

// const featuresdata = data.features.filter(function(d) {
//   return d.properties;
// });

  // const featuresdata = data.features.filter(function(d) {
  //   return d.properties;
  // });

  // Creating the features
  const feature = g.selectAll("path")
                   .data(data.features)
                   .enter().append("path")
                   .attr("class", function (d) {
                     if (d.properties.hasfare == true) {
                         return "trip" + (d.properties.key * 2) + " " + d.properties.hasfare;
                     } else {
                         return "trip" + ((d.properties.key * 2) + 1) + " " + d.properties.hasfare;
                     }
                   })
                   .attr("style", "opacity:0");

  debugger
  const pointsArray = [];
  let points = g.selectAll(".point")
  .data(pointsArray);

  let marker = g.append("circle")
  .attr("r", 5)
  .attr("id", "marker")

  .attr("id", "marker");

  map.on("moveend", reset);
  map.on("zoomend", reset);

  reset();

  let i = 0;

  debugger

  // function applyLatLngToLayer(d) {
  //   let y = d.geometry.coordinates[1];
  //   let x = d.geometry.coordinates[0];
  //   return map.latLngToLayerPoint(new L.LatLng(y, x));
  // }


    debugger
  function iterate() {
    debugger
    const emptyData = [];

    debugger
    let path = g.select("path.trip0")
                  .attr("style", "opacity: 0.7")
                  .call(transition)

    debugger
    // transition(path);
    // console.log(path)

    // const transform = d3.geoTransform({
    //   point: projectPoint
    // });
    //
    // const d3path = d3.geoPath().projection(transform);
    //
    // function projectPoint(x, y) {
    //   var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    //   this.stream.point(point.x, point.y);
    // }

    function pathStartPoint(path) {
      debugger
      // let d = d3path(featuresdata[i]);
      let d = path.attr('d');
      // let d = path.select('d');
      // let d = toLine(path)
      debugger
      let dsplitted = d.split("L")[0].slice(1).split(",");
      let point = [];
      point[0] = parseInt(dsplitted[0]);
      point[1] = parseInt(dsplitted[1]);
      return point;
    }

    let startPoint = pathStartPoint(path);
    marker.attr("transform", "translate(" + startPoint[0] + "," + startPoint[1] + ")");

    path.each(function(d){
      debugger
      //add the translation of the map's g element
      startPoint[0] = startPoint[0]; //+ topLeft[0];
      startPoint[1] = startPoint[1]; //+ topLeft[1];
      var newLatLon = coordToLatLon(startPoint);
      pointsArray.push([newLatLon.lng,newLatLon.lat,d.properties.hasfare]);


      points = g.selectAll(".point")
                .data(pointsArray)
                .enter()
                .append('circle')
                .attr("r",5)
                .attr("class",function(d){
                  if(d[2]) {
                      return "startPoint point";
                  } else {
                      return "endPoint point";
                  }
                })
                .attr("transform",function(d){
                    return translatePoint(d);
                });
    });

    debugger
    function transition(path) {
      debugger
      g.selectAll
      path.transition()
          .duration(function(d) {
            debugger
            const start = Date.parse(d.properties.pickuptime);
            const finish = Date.parse(d.properties.dropofftime);
            const duration = (finish - start) / 60000;

            return (duration);
          })
          // .each("end", function(d) {
          //   i++;
          //   const nextPath = svg.select("path.trip" + i);
          //   debugger
          //   if (nextPath[0][0] !== null) {
          //     iterate();
          //   }
          // });

    }

    function tweenDash(d) {
      var l = path.node().getTotalLength();
      var i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr

      return function (t) {
        var marker = d3.select("#marker");
        var p = path.node().getPointAtLength(t * l);
        marker.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker

        if (tweenToggle == 0) {
          tweenToggle = 1;
          var newCenter = map.layerPointToLatLng(new L.Point(p.x,p.y));
          map.panTo(newCenter, 14);
        } else {
          tweenToggle = 0;
        }
        //update chart data every X frames
        if(chartInterval == 5) {
          chartInterval = 0;
          var decimalHour = parseInt(time.format('H')) + parseFloat(time.format('m')/60)

            if(isNaN(d.properties.fare)){
              d.properties.fare = 0;
            }

          var incrementalFare = d.properties.fare*t;

          dummyData.push({
            "time": decimalHour,
            "runningFare": running.fare + parseFloat(incrementalFare)
          });

          chartPath.attr("d", area); //redraw area chart
          if(d.properties.hasfare == false) { //draw purple area for nonfare time
            emptyData.push({
              "time": decimalHour,
              "runningFare": running.fare + parseFloat(incrementalFare)
            });

            emptyPath.attr("d", area);
          }

          markerLine
            .attr('x1', x(decimalHour))
            .attr('x2', x(decimalHour));

        } else {
          chartInterval++;
        }

        return i(t);
      }
    }


  }
  debugger

  function reset() {
    debugger
      var bounds = d3path.bounds(data);
      topLeft = bounds[0],
      bottomRight = bounds[1];

      svg.attr("width", bottomRight[0] - topLeft[0] + 100)
      .attr("height", bottomRight[1] - topLeft[1] + 100)
      .style("left", topLeft[0]-50 + "px")
      .style("top", topLeft[1]-50 + "px");

      g.attr("transform", "translate(" + (-topLeft[0]+50) + "," + (-topLeft[1]+50)+ ")");

      feature.attr("d", d3path);

      //TODO: Figure out why this doesn't work as points.attr...
      g.selectAll(".point")
      .attr("transform",function(d){
          return translatePoint(d);
      });

  }
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
