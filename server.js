global.rootPath = __dirname;

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const app = express();

const AjaxRouter = require('./Routes/Handlers/Ajax');

if (process.env.NODE_ENV !== 'production') {
  app.use(logger('short'));
} else {
  app.use(logger('common'));
}

app.use(compression());
app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/ajax', AjaxRouter);

module.exports = app;
