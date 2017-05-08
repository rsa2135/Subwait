import * as d3 from 'd3';
import interpolateString from 'd3-interpolate';
import { map } from './mapAndRoutesSetup';
// import test from '../data/test';
// import rectangle from '../data/rectangle.json';

// we will be appending the SVG to the Leaflet map pane
    // g (group) element will be inside the svg
export const svg = d3.select(map.getPanes().overlayPane).append("svg");

// if you don't include the leaflet-zoom-hide when a
    // user zooms in or out you will still see the phantom
    // original SVG
export const g = svg.append("g").attr("class", "leaflet-zoom-hide");

//read in the GeoJSON. This function is asynchronous so
  // anything that needs the json file should be within
export const animation = d3.json("../data/test2.geojson", function(collection) {

  const featuresdata = collection.features.filter(function(d) {
    return d.properties;
  });

        //stream transform. transforms geometry before passing it to
        // listener. Can be used in conjunction with d3.geo.path
        // to implement the transform.
  const transform = d3.geoTransform({
    point: projectPoint
  });

debugger
    //d3.geo.path translates GeoJSON to SVG path codes.
//essentially a path generator. In this case it's
// a path generator referencing our custom "projection"
// which is the Leaflet method latLngToLayerPoint inside
// our function called projectPoint
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


  // Here we're creating a FUNCTION to generate a line
// from input points. Since input points will be in
// Lat/Long they need to be converted to map units
// with applyLatLngToLayer
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
    debugger

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
        return "waypoints " + "c" + d.properties.STOP_ID;
    })
    .style("opacity", 0);

    // I want the origin and destination to look different
  let originANDdestination = [featuresdata[0], featuresdata[9]];

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
        return d.properties.STOP_NAME;
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
    debugger
  }

  // const start = Date.parse(featuresdata.properties.this_stop_time);
  // const end = Date.parse(d.properties.next_stop_time);
  // const duration = ((end - starting) / 60000) * 1000;

  function transition(path, duration) {

    linePath.transition()
      .duration(5000)
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
