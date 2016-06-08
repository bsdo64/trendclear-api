"use strict";

const server = require('../server');
//app.set('port', process.env.port || 3001);

server.listen(3001, () => {
  console.log('Api server listen port :', 3001);
});