import { map, layer, coloring } from './mapAndRoutesSetup';
import { svg, g, animation } from './svgLayer2';
// import { svg, g, animation } from './svgLayer3';
// import { svg, g, animation } from '../scratchpad';
import * as d3 from 'd3';
import interpolateString from 'd3-interpolate';

import moment from 'moment';
let clock = moment([2017, 1, 5]);
let screenclock;

// debugger
const startClock = () => {
  screenclock = document.getElementById('clock');
  clock.interval = setInterval(() => {
    clock.add(1, "second");
    screenclock.innerHTML = clock.format("h:mm:ss a");
  }, 1000);
};

startClock();
