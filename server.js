'use strict';

const Express = require('express');
const app = Express();

const ServerRoute = require('./Routes/Server/index');

app.use('/compose', ServerRoute);

module.exports = app;
