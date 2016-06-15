'use strict';

const Express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = Express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const AjaxRouter = require('./Routes/Ajax/index');
const NotiSocketHandler = require('./Routes/Socket/Noti');

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
