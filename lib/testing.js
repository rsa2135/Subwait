import * as d3 from 'd3';
import interpolateString from 'd3-interpolate';


  export const test = () => {
  let points = [
      [480, 200],
      [580, 400],
      [680, 100],
      [780, 300],
      [180, 300],
      [280, 100],
      [380, 400]
    ];

  var times = [3000, 100, 5000, 100, 3000, 100, 1000];
  var totalTime = times.reduce(function (a, b) {return a + b;}, 0);

  var svg = d3.select("body").append("svg")
      .attr("width", 960)
      .attr("height", 500);

  var path = svg.append("path")
      .data([points])
      .attr("d", d3.line(curveCardinalClosed));

  svg.selectAll(".point")
      .data(points)
    .enter().append("circle")
      .attr("r", 4)
      .attr("transform", function(d) { return "translate(" + d + ")"; });

  var circle = svg.append("circle")
      .attr("r", 13)
      .attr("transform", "translate(" + points[0] + ")");

  function transition() {
    circle.transition()
        .duration(totalTime)
        .ease('linear')
        .attrTween("transform", translateAlong(path.node()))
        .each("end", transition);
  }

  // initial computation, linear time needed to reach a point
  var timeToReachPoint = []
  var pathLength = path.node().getTotalLength();
  var pointIndex = 0
  for (var t = 0; pointIndex < points.length && t <= 1; t += 0.0001) {
    var data = points[pointIndex]
    var point = path.node().getPointAtLength(t * pathLength)
    // if the distance to the point[i] is approximately less than 1 unit
    // make `t` the linear time needed to get to that point
    if (Math.sqrt(Math.pow(data[0] - point.x, 2) + Math.pow(data[1] - point.y, 2)) < 1) {
      timeToReachPoint.push(t);
      pointIndex += 1
    }
  }
  timeToReachPoint.push(1)

  function translateAlong(path) {
    return function(d, i, a) {
      return function(t) {
        // TODO: optimize
        var timeElapsed = t * totalTime
        var acc = 0
        for (var it = 0; acc + times[it] < timeElapsed; it += 1) {
          acc += times[it]
        }
        var previousTime = timeToReachPoint[it]
        var diffWithNext = timeToReachPoint[it + 1] - timeToReachPoint[it]
        // range mapping
        var placeInDiff = diffWithNext * ((timeElapsed - acc) / times[it])
        var p = path.getPointAtLength((previousTime + placeInDiff) * pathLength)
        return "translate(" + p.x + "," + p.y + ")"
      }
    }
  }

  transition();
  }
