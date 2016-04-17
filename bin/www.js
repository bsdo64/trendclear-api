"use strict";

const app = require('../server');
app.set('port', process.env.port || 8888);

app.listen(app.get('port'), () => {
  console.log()
});