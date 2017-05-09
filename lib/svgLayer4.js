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
export const animation = d3.json("../data/taxiday0.geojson", function(collection) {


  // this is not needed right now, but for future we may need
  // to implement some filtering. This uses the d3 filter function
  // featuresdata is an array of point objects
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

   // From now on we are essentially appending our features to the
   // group element. We're adding a class with the line name
   // and we're making them invisible
   // these are the points that make up the path
   // they are unnecessary so I've make them
   // transparent for now

  let ptFeatures = g.selectAll("circle")
    .data(featuresdata)
    .enter()
    .append("circle")
    .attr("r", 3)
    .attr("class", function(d){
      return "waypoints " + "c" + d.properties.STOP_ID;
    })
    .style("opacity", 0);

   // Here we will make the points into a single
   // line/path. Note that we surround the featuresdata
   // with [] to tell d3 to treat all the points as a
   // single line. For now these are basically points
   // but below we set the "d" attribute using the
   // line creator function from above.
  let twoPoints = [featuresdata[0], featuresdata[1]];
  let linePath = g.selectAll(".lineConnect")
    .data([featuresdata])
    .enter()
    .append("path")
    .attr("class", "lineConnect");
    debugger

  // This will be our traveling circle it will
  // travel along our path
  let marker = g.append("circle")
    .attr("r", 10)
    .attr("id", "marker")
    .attr("class", "travelMarker");


  // For simplicity I hard-coded this! I'm taking
  // the first and the last object (the origin)
  // and destination and adding them separately to
  // better style them. There is probably a better
  // way to do this!
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

    // when the user zooms in or out you need to reset
   // the view
    map.on("moveend", reset);

    // this puts stuff on the map!
    reset();
    transition();

    // Reposition the SVG to cover the features.
    function reset() {
    var bounds = d3path.bounds(collection),
        topLeft = bounds[0],
        bottomRight = bounds[1];


    // to the SVG. Note that we're adding a little height and
    // width because otherwise the bounding box would perfectly
    // cover our features BUT... since you might be using a big
    // circle to represent a 1 dimensional point, the circle
    // might get cut off.
    text.attr("transform",
        function(d) {
            return "translate(" +
                applyLatLngToLayer(d).x + "," +
                applyLatLngToLayer(d).y + ")";
        });

    // for the points we need to convert from latlong
   // to map units
    begend.attr("transform",
    function(d) {
      return "translate(" +
      applyLatLngToLayer(d).x + "," +
      applyLatLngToLayer(d).y + ")";
    });

    // here you're setting some styles, width, heigh etc
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

    // Setting the size and location of the overall SVG container
    svg.attr("width", bottomRight[0] - topLeft[0] + 120)
        .attr("height", bottomRight[1] - topLeft[1] + 120)
        .style("left", topLeft[0] - 50 + "px")
        .style("top", topLeft[1] - 50 + "px");

    // linePath.attr("d", d3path);
    linePath.attr("d", toLine);
    debugger

    // ptPath.attr("d", d3path);
    g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
    debugger
  }


  // the transition function could have been done above using
  // chaining but it's cleaner to have a separate function.
  // the transition. Dash array expects "500, 30" where
  // 500 is the length of the "dash" 30 is the length of the
  // gap. So if you had a line that is 500 long and you used
  // "500, 0" you would have a solid line. If you had "500,500"
  // you would have a 500px line followed by a 500px gap. This
  // can be manipulated by starting with a complete gap "0,500"
  // then a small line "1,500" then bigger line "2,500" and so
  // on. The values themselves ("0,500", "1,500" etc) are being
  // fed to the attrTween operator
  function transition(path, duration) {

    linePath.transition()
      .duration(5000)
      .attrTween("stroke-dasharray", tweenDash)
      .on("end", function() {
        d3.select(this).call(transition);// infinite loop
        ptFeatures.style("opacity", 0);
    });
  } //end transition

  // this function feeds the attrTween operator above with the
  // stroke and dash lengths
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

  // Use Leaflet to implement a D3 geometric transformation.
 // the latLngToLayerPoint is a Leaflet conversion method:
 //Returns the map layer point that corresponds to the given geographical
 // coordinates (useful for placing overlays on the map).
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  // similar to projectPoint this function converts lat/long to
  // svg coordinates except that it accepts a point from our
  // GeoJSON
  function applyLatLngToLayer(d) {
    var point = map.layerPointToLatLng(new L.Point(d[0],d[1]));
  return point;
  }

});
