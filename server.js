'use strict';

const Express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = Express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const AjaxRouter = require('./Routes/Ajax/index');

app.notiIo = io.of('/noti');
app.io = io;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/ajax', AjaxRouter);

app.notiIo.on('connection', function (socket) {
  console.log('111111111111');
  socket.on('join_room', function () {

    console.log('333333333333');
    socket.join('bsdo');
  })
});

module.exports = server;
