import * as d3 from 'd3';
import interpolateString from 'd3-interpolate';
import moment from 'moment';
import { map } from './mapAndRoutesSetup';
import $ from "jquery";
import ci from 'correcting-interval';

// Appending svg over leaflet and fixing zoom behavior
export const svg = d3.select(map.getPanes().overlayPane).append("svg");
// export const g = svg.append("g").attr("class", "leaflet-zoom-hide");

// Converting cartesian to coordinate sapce
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
let clock = moment();
let screenclock;
const timeSpeed = 30;
const timeFactor = 10;
let currentLineRunning = [];
let timer;
let fileNameSouth;
let fileNameNorth;
let clickCounter = 0;

$('.line-circle').click(function(event){
  clickCounter += 1
  if (timer) {
    ci.clearCorrectingInterval(timer);
    clock = moment('2017-01-01');
    screenclock.innerHTML = clock.format("hh:mm:ss a");
  }

  let clearRunning = svg.selectAll('.leaflet-zoom-hide')
                      .remove();

  fileNameSouth = `data/${event.currentTarget.id}South.geojson`;
  fileNameNorth = `data/${event.currentTarget.id}North.geojson`;

  d3.queue()
  .defer(d3.json, fileNameSouth)
  .defer(d3.json, fileNameNorth)
  .await(function(error, south, north) {
    if (error) throw error;
    let totalTrains = parseInt(south.features[0].properties.totaltrains);

    currentLineRunning.push(parseInt(south.features[0].properties.line));

    // Creating a hashmap with all the train times, each key points at an array that holds
    // then umber of the trinain the day and the section of the route.
    let timesMapSouth = {};
    let timesMapNorth = {};
    let train = 0;
    let section = 0;
    while (south.features[section].properties[`arrival${train}`] ) {
      if (!timesMapSouth[south.features[section].properties[`arrival${train}`]]) {
        timesMapSouth[south.features[section].properties[`arrival${train}`]] = [{"trainInDay": train, "routeSection": section}];
      } else {
        timesMapSouth[south.features[section].properties[`arrival${train}`]].push({"trainInDay": train, "routeSection": section});
      }
      if ((!south.features[section].properties[`arrival${train + 1}`]) && (section < 37)) {
        section++;
        train = 0;
      } else {
        train++;
      }
    }
    train = 0;
    section = 0;

    while (north.features[section].properties[`arrival${train}`] ) {
      if (!timesMapNorth[north.features[section].properties[`arrival${train}`]]) {
        timesMapNorth[north.features[section].properties[`arrival${train}`]] = [{"trainInDay": train, "routeSection": section}];
      } else {
        timesMapNorth[north.features[section].properties[`arrival${train}`]].push({"trainInDay": train, "routeSection": section});
      }
      if ((!north.features[section].properties[`arrival${train + 1}`]) && (section < 37)) {
        section++;
        train = 0;
      } else {
        train++;
      }
    }

    clock = moment('2017-01-01');

    screenclock = document.getElementById('clock');

    var clock = moment('2017-01-01');
    var interval = 1000 / timeFactor; // ms

    var startTime = Date.now();

    timer = ci.setCorrectingInterval(function() {

      clock.add(1000 * timeSpeed, 'ms');
      screenclock.innerHTML = clock.format("hh:mm:ss a");

      if (clock.day() ===  1) {
        ci.clearCorrectingInterval(timer);
        svg.selectAll('.leaflet-zoom-hide')
                            .remove();
        clock = moment('2017-01-01');
        screenclock.innerHTML = clock.format("hh:mm:ss a");
      }

      if (timesMapSouth[clock.format("HH:mm:ss")]) {

        timesMapSouth[clock.format("HH:mm:ss")].forEach(trainToAnimate => {
          callback1(south, trainToAnimate, "S");
        });
      }

      if (timesMapNorth[clock.format("HH:mm:ss")]) {
        timesMapNorth[clock.format("HH:mm:ss")].forEach(trainToAnimate => {
          callback1(north, trainToAnimate, "N");
        });
      }

    }, interval);

  });
});

function callback1(data, currentTrain, direction) {

  // Binding the features to the data and appending to the screen
  // All features will be added, however thier initial opacity will be 0
  // (on the trip.# class attribute)
  let feature;
  let marker;
  let label;
  let exists;
  let g;
  let section = currentTrain.routeSection;
  let train = currentTrain.trainInDay;


    exists = svg.selectAll(`.line-1-train-${train}-${direction}`);

    if (exists.empty()) {
      g = svg.append("g")
             .attr("class", `leaflet-zoom-hide line-1-train-${train}-${direction}`);


      feature = g.selectAll("path")
         .data(data.features)
         .enter()
         .append("path")
         .attr("class", function (d) {
           return "one" + train + "-section" + (d.properties.stationnumber) +"-"+ (direction);
         })
         .attr("id", function (d) {
           return d.properties.laststation;
         })
         .attr("style", "opacity:0")
         .attr("line", "line-one");

         let elemEnter = g.append('g')
         .attr("class", "mrkr" + train);

         marker = elemEnter.append("circle")
         .attr("r", 10)
         .attr("id", "marker" + train + "-" + direction)
         .attr("stroke", "black")
         .attr("fill", "yellow")
         .attr('style','opacity: 0.0');

         label = elemEnter.append("text")
         .text(`${data.features[0].properties.line}`)
         .attr("id", "label" + train + "-" + direction)
         .attr("stroke", "#000000")
         .attr("class", "line-number1" + train + "-" + direction)
         .style("text-anchor", "middle")
         .attr("dy", ".3em");


    } else {
      g = svg.select(`.line-1-train-${train}-${direction}`);
      feature = g.selectAll("path");
      marker = g.selectAll(`#mrkr${train}-${direction}`);
      label = g.selectAll(`#label${train}-${direction}`);
    }

  reset();

  let i = 0;

      const emptyData = [];
      // console.log("path.one" + train + "-section" + section);
      let path = g.select("path.one" + train + "-section" + section +"-"+ direction)
                    .attr("style", "opacity: 0.0")
                    .call(transition, data)
                    .call(pathStartPoint);

      function pathStartPoint(path) {

        let d = path.attr('d');

        let dsplitted = d.split("L")[0].slice(1).split(",");
        let point = [];
        point[0] = parseInt(dsplitted[0]);
        point[1] = parseInt(dsplitted[1]);
        return point;
      }

      let startPoint = pathStartPoint(path);
      marker.attr("transform", "translate(" + startPoint[0] + "," + startPoint[1] + ")");
      label.attr("transform", "translate(" + startPoint[0] + "," + startPoint[1] + ")");

      path.each(function(d) {
        //add the translation of the map's g element
        startPoint[0] = startPoint[0]; //+ topLeft[0];
        startPoint[1] = startPoint[1]; //+ topLeft[1];
        let newLatLon = coordToLatLon(startPoint);

      });

      function transition(path, data) {

        var kus = data;

        path.transition(data)

            .duration(function(d) {

              const start = moment(d.properties[`arrival${train}`], 'HH:mm:ss');
              const finish = moment(d.properties[`departure${train}`], 'HH:mm:ss');
              const duration = moment.duration(finish.diff(start)).as('milliseconds');

              const durationMinutes = (duration / timeSpeed / timeFactor); // 60000;
              return (durationMinutes);// * (1/timeFactor) * 1000);
            })
            // .ease(d3.easeLinear)
            .attrTween("stroke-dasharray", tweenDash)
            .on("end", function (d) {

              if (d.properties.laststation) {
                g.remove();

              } else {

                return;
              }
            });

      }

      function tweenDash(d) {
        let l = path.node().getTotalLength();
        let i = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr

        return function (t) {
          let marker = d3.select(`#marker${train}-${direction}`);
          let p = path.node().getPointAtLength(t * l);
          marker.attr("transform", "translate(" + p.x + "," + p.y + ")")//move marker
                 .attr('style','opacity:0.8');

          label.attr("transform", "translate(" + p.x + "," + p.y + ")")//move text in marker
                .attr('style','opacity:1')
                .style("text-anchor", "middle");

          return i(t);
        };
      }

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
  }
}

function translatePoint(d) {
  var point = map.latLngToLayerPoint(new L.LatLng(d[1],d[0]));
  return "translate(" + point.x + "," + point.y + ")";
}

function coordToLatLon(coord) {
  let point = map.layerPointToLatLng(new L.Point(coord[0],coord[1]));
  return point;
}
