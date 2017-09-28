const port = process.env.PORT || 3000;
//Logger init
const logger = require('log');
const log = new logger('debug');
//Server init
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
//Sanitize
const sanitize = require('sanitize-html');

//Start the things
manageServer();
manageChat();

/*
    Manage all Server functions.
     - Routing
*/
function manageServer() {
    app.use('/static', express.static('client/files'));
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, '/client/index.html'));
    })
    app.get('/:id', function (req, res) {
        res.sendFile(path.join(__dirname, '/client/chat.html'));
    })
    app.get('/*', function (req, res) {
        res.sendStatus(400);
    })
}

/*
    Manage all Chat functions.
     - Message on connection
*/
function manageChat() {
    io.on('connection', function (socket) {
        //Initialized user in room.
        socket.on('initUserInRoom', function (msg, room, success) {
            //Sanitize input
            room = san(room), msg = san(msg);
            //Set username of socket
            socket.username = msg;
            //Set joindate of socket
            socket.joinDate = new Date();
            //Join socket to room
            socket.join(room);
            //Notify all other sockets in room
            io.in(room).emit('sOut', `${socket.username} joined.`);
            //Setup things on the client side.
            success();
            //Log all the things.
            log.info(`[${room}] - ${socket.username} joined.`);

            //Setup event on user input.
            socket.on('uIn', function (msg) {
                io.in(room).emit('uOut', msg, socket.username);
                log.info(`[${room}] - ${socket.username}: ${msg}`);
            })

            //Setup event on user leave.
            socket.on('disconnect', function () {
                io.in(room).emit('sOut', `${socket.username} left.`);
                log.info(`[${room}] - ${socket.username} left.`);
            })
        })
    })
}

//HELPER: Sanitize input
const san = (input) => sanitize(input, { allowedTags: [] });

//Start server
server.listen(port, function () {
    log.notice(`The server has been started on port ${port}`);
});