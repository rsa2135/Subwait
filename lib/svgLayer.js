import * as d3 from 'd3';
import interpolateString from 'd3-interpolate';
import { map } from './mapAndRoutesSetup';
// import test from '../data/test';
// import rectangle from '../data/rectangle.json';

export const svg = d3.select(map.getPanes().overlayPane).append("svg");
export const g = svg.append("g").attr("class", "leaflet-zoom-hide");


export const animation = d3.json("../data/test.geojson", function(collection) {

  const transform = d3.geoTransform({
    point: projectPoint
  });

  var featuresdata = collection.features.filter(function(d) {
      return d.properties.id == "route1";
    });

  const d3path = d3.geoPath().projection(transform);

  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

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

  let linePath = g.selectAll(".lineConnect")
    .data([featuresdata])
    .enter()
    .append("path")
    .attr("class", "lineConnect");

  // This will be our traveling circle
  let marker = g.append("circle")
    .attr("r", 10)
    .attr("id", "marker")
    .attr("class", "travelMarker");

    // if you want the actual points change opacity
  let ptFeatures = g.selectAll("circle")
    .data(featuresdata)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("class", function(d){
        return "waypoints " + "c" + d.properties.time;
    })
    .style("opacity", 0);

    // I want the origin and destination to look different
  let originANDdestination = [featuresdata[0], featuresdata[17]];

  let begend = g.selectAll(".drinks")
    .data(originANDdestination)
    .enter()
    .append("circle", ".drinks")
    .attr("r", 5)
    .style("fill", "red")
    .style("opacity", "1");

    // I want names for my coffee and beer
  let text = g.selectAll("text")
    .data(originANDdestination)
    .enter()
    .append("text")
    .text(function(d) {
        return d.properties.name;
    })
    .attr("class", "locnames")
    .attr("y", function(d) {
        return -10; //I'm moving the text UP 10px
    });

    map.on("moveend", reset);

    // this puts stuff on the map!
    reset();
    transition();

    function reset() {
    var bounds = d3path.bounds(collection),
        topLeft = bounds[0],
        bottomRight = bounds[1];


    begend.attr("transform",
        function(d) {
            return "translate(" +
                applyLatLngToLayer(d).x + "," +
                applyLatLngToLayer(d).y + ")";
        });

    //...do same thing to text, ptFeatures and marker...
    text.attr("transform",
        function(d) {
            return "translate(" +
                applyLatLngToLayer(d).x + "," +
                applyLatLngToLayer(d).y + ")";
        });

    ptFeatures.attr("transform",
        function(d) {
          return "translate(" +
            applyLatLngToLayer(d).x + "," +
            applyLatLngToLayer(d).y + ")";
        });
       // again, not best practice, but I'm harding coding
       // the starting point
    marker.attr("transform",
        function() {
          var y = featuresdata[0].geometry.coordinates[1];
          var x = featuresdata[0].geometry.coordinates[0];
          return "translate(" +
            map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
            map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
        });

    svg.attr("width", bottomRight[0] - topLeft[0] + 120)
        .attr("height", bottomRight[1] - topLeft[1] + 120)
        .style("left", topLeft[0] - 50 + "px")
        .style("top", topLeft[1] - 50 + "px");


    linePath.attr("d", toLine);
    g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
  }

  function transition(path) {
    linePath.transition()
      .duration(7500)
      .attrTween("stroke-dasharray", tweenDash)
      .on("end", function() {
        d3.select(this).call(transition);// infinite loop
        ptFeatures.style("opacity", 0);
    });
  }

  function tweenDash() {

    return function(t) {
      // In original version of this post the next two lines of JS were
      // outside this return which led to odd behavior on zoom
      // Thanks to Martin Raifer for the suggested fix.

      //total length of path (single value)
      var l = linePath.node().getTotalLength();
      let interpolate = d3.interpolateString("0," + l, l + "," + l);

      //t is fraction of time 0-1 since transition began
      var marker = d3.select("#marker");

      // p is the point on the line (coordinates) at a given length
      // along the line. In this case if l=50 and we're midway through
      // the time then this would 25.
      var p = linePath.node().getPointAtLength(t * l);

      //Move the marker to that point
      marker.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker
      return interpolate(t);
    };
  }
});









//
//
//
// export const rectangle = d3.json('../data/rectangle.json', function(geoShape) {
//   //  create a d3.geo.path to convert GeoJSON to SVG
//   // let transform;
//
//   const transform = d3.geoTransform({point: projectPoint}), path = d3.geoPath().projection(transform);
//
//   // create path elements for each of the features
//   const d3_features = g.selectAll("path")
//     .data(geoShape.features)
//     .enter().append("path");
//
//   map.on("viewreset", reset);
//
//   reset();
//
//   // fit the SVG element to leaflet's map layer
//   function reset() {
//
//     const bounds = path.bounds(geoShape);
//
//     const topLeft = bounds[0],
//       bottomRight = bounds[1];
//
//     svg .attr("width", bottomRight[0] - topLeft[0])
//       .attr("height", bottomRight[1] - topLeft[1])
//       .style("left", topLeft[0] + "px")
//       .style("top", topLeft[1] + "px");
//
//     g .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
//
//     // initialize the path data
//     d3_features.attr("d", path)
//       .style("fill-opacity", 0.7)
//       .attr('fill','blue');
//   }
//   // Use Leaflet to implement a D3 geometric transformation.
// 		function projectPoint(x, y) {
// 			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
// 			this.stream.point(point.x, point.y);
// 		}
//
// });
