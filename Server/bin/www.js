#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('myapp:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
var io = require('socket.io')(server, {
    origins: '*:*'
});
/**
 * Listen on provided port, on all network interfaces.
 */


var models = require('../models');

models.waterline.initialize(models.config, function (err, models) {
    if (err)
        throw err;
    // console.log(models.collections);
    app.models = models.collections;
    app.connections = models.connections;

    // Start Server
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    setInterval(function () {
        var machine1Speed = getRandomArbitrary(0, 700);
        var machine2Speed = getRandomArbitrary(0, 700);
        var machine3Speed = getRandomArbitrary(0, 700);
        var a = machine1Speed + machine2Speed + machine3Speed;
        var storeSpeed = getRandomArbitrary(a, a + 500);
        io.sockets.emit("eps", {
            process_speed: (machine1Speed + machine2Speed + machine3Speed),
            store_speed: storeSpeed,
            machine1: machine1Speed,
            machine2: machine2Speed,
            machine3: machine3Speed
        });
    }, 900);


    io.on('connection', function (socket) {
        socket.on('receive1', function (speedReceive, speedSaveDB) {
            eps = parseInt(speedReceive);
        })
    });
});



function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}



console.log('start socket io');
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
