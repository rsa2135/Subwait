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
let tweenToggle = 0;

export const animation = d3.json('data/1trainnumber1south.geojson', function (data) {

  debugger
  // Binding the features to the data and appending to the screen
  // All features will be added, however thier initial opacity will be 0
  // (on the trip.# class attribute)
  const feature = g.selectAll("path")
                   .data(data.features)
                   .enter().append("path")
                   .attr("class", function (d) {
                     if (d.properties.scheduled === true) {
                        return "trip" + (d.properties.traininday * 2);
                     } else {
                        return "trip" + ((d.properties.traininday * 2) + 1);
                     }
                   })
                   .attr("style", "opacity:0");

  const pointsArray = [];
  let points = g.selectAll(".point")
                .data(pointsArray);

  let marker = g.append("circle")
                .attr("r", 5)
                .attr("id", "marker");

  map.on("moveend", reset);
  map.on("zoomend", reset);

  reset();

  let i = 0;

  // Start iterating over the path's elements and reveal each one (through opacity)
  function iterate() {
    const emptyData = [];

    // let emptyPath = areaChartSvg.append("path")
    //   .datum(emptyData)
    //   .attr("class", "empty");
    debugger
    let path = g.select("path.trip" + i)
                  .attr("style", "opacity: 0.7")
                  .call(transition);

    function pathStartPoint(path) {
      debugger
      let d = path.attr('d');

      let dsplitted = d.split("L")[0].slice(1).split(",");
      let point = [];
      point[0] = parseInt(dsplitted[0]);
      point[1] = parseInt(dsplitted[1]);
      return point;
    }

    let startPoint = pathStartPoint(path);
    marker.attr("transform", "translate(" + startPoint[0] + "," + startPoint[1] + ")");

    path.each(function(d) {
      //add the translation of the map's g element
      startPoint[0] = startPoint[0]; //+ topLeft[0];
      startPoint[1] = startPoint[1]; //+ topLeft[1];
      let newLatLon = coordToLatLon(startPoint);
      pointsArray.push([newLatLon.lng,newLatLon.lat]);

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

        if(d.properties.hasfare) { //transition marker to show full taxi
          marker
            .transition()
            .duration(500)
            .attr("r",5)
            .attr('style','opacity:1');
          } else { //Transition marker to show empty taxi
            marker
            .transition()
            .duration(500)
            .attr("r",40)
            .attr('style','opacity:.3');
          }
      });

    function transition(path) {
      g.selectAll

      path.transition()

          .duration(function(d) {
            const start = Date.parse(d.properties.arrival);
            const finish = Date.parse(d.properties.departure);
            const duration = (finish - start) / 60000;
            return (duration * 100);
          })
          .attrTween("stroke-dasharray", tweenDash)
          .on("end", function (d) {
            // if(d.properties.hasfare) {
            //   running.fare += parseFloat(d.properties.fare);
            //   running.surcharge += parseFloat(d.properties.surcharge);
            //   running.mtatax += parseFloat(d.properties.mtatax);
            //   running.tip += parseFloat(d.properties.tip);
            //   running.tolls += parseFloat(d.properties.tolls);
            //   running.total += parseFloat(d.properties.total);
            //   running.passengers += parseFloat(d.properties.passengers);
            //   for(var p = 0;p<d.properties.passengers;p++){
            //     $('.passengerGlyphs').append('<span class="glyphicon glyphicon-user"></span>');
            //   }
            //   // updateRunning();
            // }

            i++;

            let nextPath = svg.select("path.trip" + i);
            let test = g.select("path.trip" + i);
            let t = test.attr('d');
            if (t[0] === null){
              clearTimeout(timer);
            } else {
              iterate();
            }
          });

    }

    function tweenDash(d) {
      let l = path.node().getTotalLength();
      let i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr

      return function (t) {
        let marker = d3.select("#marker");
        let p = path.node().getPointAtLength(t * l);
        marker.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker

        if (tweenToggle == 0) {
          tweenToggle = 1;
          let newCenter = map.layerPointToLatLng(new L.Point(p.x,p.y));
          map.panTo(newCenter, 14);
        } else {
          tweenToggle = 0;
        }
        //update chart data every X frames
        // if(chartInterval == 5) {
        //   chartInterval = 0;
        //   let decimalHour = parseInt(time.format('H')) + parseFloat(time.format('m')/60);
        //
        //     if(isNaN(d.properties.fare)){
        //       d.properties.fare = 0;
        //     }
        //
        //   var incrementalFare = d.properties.fare*t;
        //
        //   dummyData.push({
        //     "time": decimalHour,
        //     "runningFare": running.fare + parseFloat(incrementalFare)
        //   });
        //
        //   chartPath.attr("d", area); //redraw area chart
        //   if(d.properties.hasfare === false) { //draw purple area for nonfare time
        //     emptyData.push({
        //       "time": decimalHour,
        //       "runningFare": running.fare + parseFloat(incrementalFare)
        //     });
        //
        //     emptyPath.attr("d", area);
        //   }
        //
        //   markerLine
        //     .attr('x1', x(decimalHour))
        //     .attr('x2', x(decimalHour));
        //
        // } else {
        //   chartInterval++;
        // }

        return i(t);
      };
    }
  }

  iterate();

  function reset() {
      let bounds = d3path.bounds(data);
      topLeft = bounds[0];
      bottomRight = bounds[1];

      svg.attr("width", bottomRight[0] - topLeft[0] + 100)
         .attr("height", bottomRight[1] - topLeft[1] + 100)
         .style("left", topLeft[0]-50 + "px")
         .style("top", topLeft[1]-50 + "px");

      g.attr("transform", "translate(" + (-topLeft[0]+50) + "," + (-topLeft[1]+50)+ ")");

      feature.attr("d", d3path);

      //TODO: Figure out why this doesn't work as points.attr...
      g.selectAll(".point")
       .attr("transform",function(d) {
          return translatePoint(d);
      });

  }
  // iterate();

});

function translatePoint(d) {
  var point = map.latLngToLayerPoint(new L.LatLng(d[1],d[0]));
  return "translate(" + point.x + "," + point.y + ")";
}

function coordToLatLon(coord) {
  let point = map.layerPointToLatLng(new L.Point(coord[0],coord[1]));
  return point;
}
