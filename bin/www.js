"use strict";

const app = require('../server');
app.set('port', process.env.port || 3001);

app.listen(app.get('port'), () => {
  console.log('Api server listen port :', app.get('port'));
});