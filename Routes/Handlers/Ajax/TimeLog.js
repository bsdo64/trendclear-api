/**
 * Created by dobyeongsu on 2016. 7. 18..
 */
const now = require('performance-now');

function TimeLog(TimerName) {
  this.startTime = null;
  this.endTime = null;
  this.timerName = TimerName;

  this.startRouteHandler = (req, res, next) => {
    this.startTime = now();

    next();
  };

  this.endRouteHandler = (req, res, next) => {
    this.endTime = now();
    console.log(this.timerName + ' : ' + (this.endTime - this.startTime).toFixed(3));

    next();
  };

  this.start = (timerName) => {
    this.startTime = now();
    this.timerName = timerName;
  };

  this.end = () => {
    this.endTime = now();
    console.log(this.timerName + ' : ' + (this.endTime - this.startTime).toFixed(3));
  };
}

module.exports = TimeLog;
