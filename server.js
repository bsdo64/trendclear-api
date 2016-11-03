'use strict';

const Express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const app = Express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const AjaxRouter = require('./Routes/Handlers/Ajax/index');
const NotiSocketHandler = require('./Routes/Socket/Noti');

app.use(compression());
app.set('trust proxy', true);

if (process.env.NODE_ENV !== 'production') {
  app.use(logger('short'));
} else {
  app.use(logger('common'));
}

app.notiIo = io.of('/noti');
app.io = io;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/ajax', AjaxRouter);

app.notiIo.on('connection', function (socket) {

  socket.on('join_room', NotiSocketHandler.joinHandler(socket))
});

module.exports = server;
