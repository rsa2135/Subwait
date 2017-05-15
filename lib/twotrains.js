import * as d3 from 'd3';
import interpolateString from 'd3-interpolate';
import { map } from './mapAndRoutesSetup';

export const svg = d3.select(map.getPanes().overlayPane).append("svg");
// export const g = svg.append("g").attr("class", "leaflet-zoom-hide");

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
let topLeft;
let bottomRight;
let tweenToggle = 0;

d3.queue()
  .defer(d3.json, 'data/1trainnumber1south.geojson')
  .defer(d3.json, 'data/shuttle.geojson')
  .defer(d3.json, 'data/stops.geojson')
  .await(function(error, file1, file2, stops) {
      if (error) throw error;
      // let test = "yo"
      callback2(file2, stops);
      callback1(file1, stops);
      // console.log(file1, file2);
    });

// export const animation = d3.json('data/1trainnumber1south.geojson', function(data) {
//   callback(data);
// }) ;


function callback1(data, test) {
  const g = svg.append("g")
               .attr("class", "leaflet-zoom-hide")
               .attr("class", "line-1");
  // Binding the features to the data and appending to the screen
  // All features will be added, however thier initial opacity will be 0
  // (on the trip.# class attribute)
  const feature = g.selectAll("path")
                   .data(data.features)
                   .enter().append("path")
                   .attr("class", function (d) {
                      return "one-trip" + (d.properties.stationnumber);
                   })
                   .attr("id", function (d) {
                      return d.properties.laststation;
                   })
                   .attr("style", "opacity:0")
                   .attr("line", "line-one");

  const pointsArray = [];
  let points = g.selectAll(".point")
                .data(pointsArray);

  let elemEnter = g.append('g')
                   .attr("class", "mrkr1");

  let marker1 = elemEnter.append("circle")
                .attr("r", 10)
                .attr("id", "marker1")
                .attr("stroke", "black")
                .attr('style','opacity: 0.8');

  elemEnter.append("text")
           .text("1")
           .attr("class", "line-number1")
           .style("text-anchor", "middle")
           .attr("dy", ".3em")
           .attr("stroke", "black");


  // let marker1 = g.append("circle")
  //               .attr("r", 10)
  //               .attr("id", "marker1")
  //               .attr("stroke", "black")
  //               .attr('style','opacity: 0.8');
  //
  // let label = g.append("text")
  //              .text("1")
  //              .attr("class", "line-number")
  //              .style("text-anchor", "middle")
  //              .attr("dy", ".3em")
  //              .attr({
  //                "alignment-baseline": "middle",
  //                "text-anchor": "middle"
  //              });
  // debugger
  // map.on("moveend", reset);
  // map.on("zoomend", function(e) {
  //   // debugger
  //   reset(test);
  // });
  //
  // map.on("moveend", function(e) {
  //   // debugger
  //   reset(test);
  // });

  reset(test);

  let i = 0;

  // Start iterating over the path's elements and reveal each one (through opacity)
  function iterate() {
    const emptyData = [];

    // let emptyPath = areaChartSvg.append("path")
    //   .datum(emptyData)
    //   .attr("class", "empty");
    let path = g.select("path.one-trip" + i)
                  .attr("style", "opacity: 0.7")
                  .call(transition);


    function pathStartPoint(path) {
      let d = path.attr('d');

      let dsplitted = d.split("L")[0].slice(1).split(",");
      let point = [];
      point[0] = parseInt(dsplitted[0]);
      point[1] = parseInt(dsplitted[1]);
      return point;
    }

    let startPoint = pathStartPoint(path);
    marker1.attr("transform", "translate(" + startPoint[0] + "," + startPoint[1] + ")");

    path.each(function(d) {
      //add the translation of the map's g element
      startPoint[0] = startPoint[0]; //+ topLeft[0];
      startPoint[1] = startPoint[1]; //+ topLeft[1];
      let newLatLon = coordToLatLon(startPoint);
      pointsArray.push([newLatLon.lng,newLatLon.lat]);

      // points = g.selectAll(".point")
      //           .data(pointsArray)
      //           .enter()
      //           .append('circle')
      //           .attr("r",5)
      //           .attr("class",function(d){
      //             if(d[2]) {
      //               return "startPoint point";
      //             } else {
      //               return "endPoint point";
      //             }
      //           })
      //           .attr("transform",function(d){
      //               return translatePoint(d);
      //           });

        if(d.properties.hasfare) { //transition marker to show full taxi
          // marker
          //   .transition()
          //   .duration(500)
          //   .attr("r",5)
          //   .attr('style','opacity:1');
          // } else { //Transition marker to show empty taxi
          //   marker
          //   .transition()
          //   .duration(500)
          //   .attr("r",10)
          //   .attr('style','opacity:1');
          }
      });

    function transition(path) {
      // debugger
      // g.selectAll

      path.transition()

          .duration(function(d) {
            // console.log(d.properties.arrival)
            const start = Date.parse(d.properties.arrival);
            const finish = Date.parse(d.properties.departure);
            const duration = (finish - start) / 60000;
            return (duration * 1000);
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
            let nextPath = svg.select("path.one-trip" + i);
            let attributes = nextPath.node();
            // console.log(attributes)
            if (attributes.id === "true"){
              // clearTimeout(timer);
              // console.log(attributes)
            } else {
              iterate();
            }
          });

    }

    function tweenDash(d) {
      let l = path.node().getTotalLength();
      let i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr

      return function (t) {
        let marker1 = d3.select("#marker1");
        let p = path.node().getPointAtLength(t * l);
        marker1.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker

        let label1 = d3.select(".line-number1");
        // let p = path.node().getPointAtLength(t * l);
        label1.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker

        // if (tweenToggle == 0) {
        //   tweenToggle = 1;
        //   let newCenter = map.layerPointToLatLng(new L.Point(p.x,p.y));
        //   map.panTo(newCenter, 14);
        // } else {
        //   tweenToggle = 0;
        // }
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

  function reset(test, ss) {
      let bounds = d3path.bounds(test);
      debugger
      topLeft = bounds[0];
      bottomRight = bounds[1];
      // topLeft = bounds[0];
      // bottomRight = bounds[1];

      svg.attr("width", bottomRight[0] - topLeft[0] + 100)
         .attr("height", bottomRight[1] - topLeft[1] + 100)
         .style("left", topLeft[0]-50 + "px")
         .style("top", topLeft[1]-50 + "px");
        debugger
      g.attr("transform", "translate(" + (-topLeft[0]+50) + "," + (-topLeft[1]+50)+ ")");

      feature.attr("d", d3path);

      //TODO: Figure out why this doesn't work as points.attr...
      g.selectAll(".point")
       .attr("transform",function(d) {
          return translatePoint(d);
      });

  }
  // iterate();

}

function translatePoint(d) {
  var point = map.latLngToLayerPoint(new L.LatLng(d[1],d[0]));
  return "translate(" + point.x + "," + point.y + ")";
}

function coordToLatLon(coord) {
  let point = map.layerPointToLatLng(new L.Point(coord[0],coord[1]));
  return point;
}















///Checking second train with same function
function callback2(data, test) {
  debugger
  const g = svg.append("g")
               .attr("class", "leaflet-zoom-hide")
               .attr("class", "line-2");
  // Binding the features to the data and appending to the screen
  // All features will be added, however thier initial opacity will be 0
  // (on the trip.# class attribute)
  const feature = g.selectAll("path")
                   .data(data.features)
                   .enter().append("path")
                   .attr("class", function (d) {
                      return "s-trip" + (d.properties.stationnumber);
                   })
                   .attr("id", function (d) {
                      return d.properties.laststation;
                   })
                   .attr("style", "opacity:0");

  const pointsArray = [];
  let points = g.selectAll(".point")
                .data(pointsArray);

  let elemEnter = g.append('g')
                   .attr("class", "mrkr2");

  let marker2 = elemEnter.append("circle")
                .attr("r", 10)
                .attr("id", "marker2")
                .attr("stroke", "black")
                .attr('style','opacity: 0.8');

  elemEnter.append("text")
           .text("S")
           .attr("class", "line-number2")
           .style("text-anchor", "middle")
           .attr("dy", ".3em")
           .attr("stroke", "black");



  // let marker2 = g.append("circle")
  //               .attr("r", 10)
  //               .attr("id", "marker2")
  //               .attr("stroke", "black")
  //               .attr('style','opacity: 0.8');
  //
  // let label = g.append("text")
  //              .text("1")
  //              .attr("class", "line-number")
  //              .style("text-anchor", "middle")
  //              .attr("dy", ".3em")
  //              .attr({
  //                "alignment-baseline": "middle",
  //                "text-anchor": "middle"
  //              });

  // map.on("moveend", reset(test));
  // map.on("zoomend", reset(test));
  map.on("zoomend", function(e) {
    // debugger
    reset(test);
  });

  map.on("moveend", function(e) {
    // debugger
    reset(test);
  });

  reset(test);

  let i = 0;

  // Start iterating over the path's elements and reveal each one (through opacity)
  function iterate() {
    const emptyData = [];

    // let emptyPath = areaChartSvg.append("path")
    //   .datum(emptyData)
    //   .attr("class", "empty");
    let path = g.select("path.s-trip" + i)
                  .attr("style", "opacity: 0.7")
                  .call(transition);


    function pathStartPoint(path) {
      let d = path.attr('d');

      let dsplitted = d.split("L")[0].slice(1).split(",");
      let point = [];
      point[0] = parseInt(dsplitted[0]);
      point[1] = parseInt(dsplitted[1]);
      return point;
    }

    let startPoint = pathStartPoint(path);
    marker2.attr("transform", "translate(" + startPoint[0] + "," + startPoint[1] + ")");

    path.each(function(d) {
      //add the translation of the map's g element
      startPoint[0] = startPoint[0]; //+ topLeft[0];
      startPoint[1] = startPoint[1]; //+ topLeft[1];
      let newLatLon = coordToLatLon(startPoint);
      pointsArray.push([newLatLon.lng,newLatLon.lat]);

      // points = g.selectAll(".point")
      //           .data(pointsArray)
      //           .enter()
      //           .append('circle')
      //           .attr("r",5)
      //           .attr("class",function(d){
      //             if(d[2]) {
      //               return "startPoint point";
      //             } else {
      //               return "endPoint point";
      //             }
      //           })
      //           .attr("transform",function(d){
      //               return translatePoint(d);
      //           });

        if(d.properties.hasfare) { //transition marker to show full taxi
          // marker
          //   .transition()
          //   .duration(500)
          //   .attr("r",5)
          //   .attr('style','opacity:1');
          // } else { //Transition marker to show empty taxi
          //   marker
          //   .transition()
          //   .duration(500)
          //   .attr("r",10)
          //   .attr('style','opacity:1');
          }
      });

    function transition(path) {
      // g.selectAll

      path.transition()

          .duration(function(d) {
            // console.log(d.properties.arrival)
            const start = Date.parse(d.properties.arrival);
            const finish = Date.parse(d.properties.departure);
            const duration = (finish - start) / 60000;
            return (duration * 1000);
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
            let nextPath = svg.select("path.s-trip" + i);
            let attributes = nextPath.node();
            // console.log(attributes)
            if (attributes.id === "true"){
              // clearTimeout(timer);
              // console.log(attributes)
            } else {
              iterate();
            }
          });

    }

    function tweenDash(d) {
      let l = path.node().getTotalLength();
      let i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr

      return function (t) {
        let marker2 = d3.select("#marker2");
        let p = path.node().getPointAtLength(t * l);
        marker2.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker

        let label2 = d3.select(".line-number2");
        // let p = path.node().getPointAtLength(t * l);
        label2.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker

        // if (tweenToggle == 0) {
        //   tweenToggle = 1;
        //   let newCenter = map.layerPointToLatLng(new L.Point(p.x,p.y));
        //   map.panTo(newCenter, 14);
        // } else {
        //   tweenToggle = 0;
        // }
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

  function reset(test) {
      let bounds = d3path.bounds(test)
      debugger
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

}
