// import gtfs2geojson from 'gtfs2geojson';
// import fs from 'fs';
var test = require('tap').test;
var fs = require('fs');
var path = require('path');
var gtfs2geojson = require('gtfs2geojson');


// gtfs2geojson.lines(
//   fs.readFileSync('/Users/ronariav/Downloads/Jan-30-mta-RTGTFS/shapes.txt'), function (result) {
//     if (process.env.UPDATE) {
//       fs.writeFileSync(('/Users/ronariav/Downloads/Jan-30-mta-RTGTFSroutes.geojson'),
//         JSON.stringify(result, null, 2));
//     }
//
//   t.deepEqual(result, JSON.parse(fs.readFileSync(path.join(__dirname, '/Users/ronariav/Downloads/Jan-30-mta-RTGTFSroutes.geojson'))));
//   t.end();
// });


test('#lines', function(t) {
  gtfs2geojson.lines(
    fs.readFileSync('/Users/ronariav/Downloads/Jan-30-mta-RTGTFS/shapes.txt'), function (result) {
      if (process.env.UPDATE) {
        fs.writeFileSync('/Users/ronariav/Downloads/Jan-30-mta-RTGTFSroutes.geojson'),
          JSON.stringify(result, null, 2);
      }

      t.deepEqual(result, JSON.parse(fs.readFileSync('/Users/ronariav/Downloads/Jan-30-mta-RTGTFSroutes.geojson')));
      t.end();
    });
});
