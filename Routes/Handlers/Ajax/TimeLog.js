/**
 * Created by dobyeongsu on 2016. 7. 18..
 */
const now = require('performance-now');
let start;

module.exports = {
  Start: function startTime(req, res, next) {
    "use strict";
    start = now();

    next();
  },
  End: function endTime(req, res, next) {
    "use strict";

    let end = now();
    console.log((end-start).toFixed(3));

    next();
  }
};


