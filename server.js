'use strict';

const Express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const app = Express();

const server = require('http').Server(app);
const AjaxRouter = require('./Routes/Handlers/Ajax/index');

app.use(compression());
app.set('trust proxy', true);

if (process.env.NODE_ENV !== 'production') {
  app.use(logger('short'));
} else {
  app.use(logger('common'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/ajax', AjaxRouter);

module.exports = server;
