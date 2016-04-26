'use strict';

const Express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = Express();

const ServerRouter = require('./Routes/Server/index');
const AjaxRouter = require('./Routes/Ajax/index');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/compose', ServerRouter);
app.use('/ajax', AjaxRouter);

module.exports = app;
