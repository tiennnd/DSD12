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
var unirest = require('unirest');
var server = http.createServer(app);
var io = require('socket.io')(server, {
    origins: '*:*'
});
/**
 * Listen on provided port, on all network interfaces.
 */


function updateDBCountStored() {
    app.models.log.count().exec(function (err, data) {
        if (!err) {
            io.sockets.emit("stored", {total: data});
        }
    });
}
function updateQueueCount() {
    var queueUrl = "http://tiennd:123456@192.168.1.43:15672/api/queues";
    var queueName = "queuelogf";
    unirest.get(queueUrl).end(function (response) {
        if (response.body) {
            for (i = 0; i < response.body.length; i++) {
                if (response.body[i].name == queueName) {
                    if (response.body[i].messages_ready && response.body[i].messages_ready) {
                        console.log("size: " + response.body[i].messages_ready);
                        io.sockets.emit('queue_size', {
                            log: response.body[i].messages_ready
                        })
                    }
                }
            }

        }
    });
}
function updateLastVisitPath() {
    app.models.log.find().sort({
        "data.time_local_log": 0
    }).limit(4).exec(function (err, dataLog) {
        if (!err) {
            var paths = [];
            for (i = 0; i < dataLog.length; i++) {
                paths.push(dataLog[i].data.path);
            }
            app.models.log.native(function (err, collection) {
                collection.aggregate([
                    {
                        $match: {
                            "data.path": {$in: paths}
                        }
                    },
                    {
                        $group: {
                            _id: {
                                path: "$data.path"
                            },
                            count: {
                                $sum: 1
                            }
                        }
                    }
                ], function (err, data) {
                    if (err) {
                    } else {
                        var result = [];
                        for (i = 0; i < dataLog.length; i++) {
                            for (j = 0; j < data.length; j++) {
                                if (dataLog[i].data.path == data[j]._id.path) {
                                    result.push({
                                        path: dataLog[i].data.path,
                                        method: dataLog[i].data.method,
                                        last_visit: dataLog[i].data.time_local_log,
                                        status: dataLog[i].data.status,
                                        count: data[j].count
                                    });
                                    break;
                                }
                            }
                        }
                        io.sockets.emit("update_last_vist", {
                            logs: result

                        })
                    }
                });
            });
        }
    })
}
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

//    setInterval(function () {
//        var machine1Speed = getRandomArbitrary(0, 700);
//        var machine2Speed = getRandomArbitrary(0, 700);
//        var machine3Speed = getRandomArbitrary(0, 700);
//        var a = machine1Speed + machine2Speed + machine3Speed;
//        var storeSpeed = getRandomArbitrary(a, a + 500);
//        io.sockets.emit("eps", {
//            process_speed: (machine1Speed + machine2Speed + machine3Speed),
//            store_speed: storeSpeed,
//            machine1: machine1Speed,
//            machine2: machine2Speed,
//            machine3: machine3Speed
//        });
//    }, 900);
    setInterval(function () {
        updateDBCountStored();
        updateQueueCount();
    }, 1500);
    setInterval(function () {
        updateLastVisitPath()
    }, 2000);

    var m1Count = 0, m2Count = 0, m3Count = 0;
    var machine1Speed = {process: 0, store: 0, recieve: 0}, machine2Speed = {process: 0, store: 0, recieve: 0}, machine3Speed = {process: 0, store: 0, recieve: 0};
    function sendSpeed() {
        io.sockets.emit("eps", {
            machine1: machine1Speed,
            machine2: machine2Speed,
            machine3: machine3Speed
        });
        //console.log("set 0");
        //machine1Speed = {process: 0, store: 0}, machine2Speed = {process: 0, store: 0}, machine3Speed = {process: 0, store: 0}
    }
    io.on('connection', function (socket) {
        socket.on('receive1', function (speedReceive, totalmessageRecieve, speedSaveDB) {
            machine1Speed = {
                process: speedReceive,
                store: speedSaveDB,
                recieve: totalmessageRecieve
            }
        })
        socket.on('receive2', function (speedReceive, totalmessageRecieve, speedSaveDB) {
            console.log("machine2: " + speedReceive + " " + totalmessageRecieve + " " + speedSaveDB);
            machine2Speed = {
                process: speedReceive,
                store: speedSaveDB,
                recieve: totalmessageRecieve
            }
        })
        socket.on('receive3', function (speedReceive, totalmessageRecieve, speedSaveDB) {
            machine3Speed = {
                process: speedReceive,
                store: speedSaveDB,
                recieve: totalmessageRecieve
            }
        });
        socket.on('disconnect', function () {
            machine1Speed = {process: 0, store: 0, recieve: 0}, machine2Speed = {process: 0, store: 0, recieve: 0}, machine3Speed = {process: 0, store: 0, recieve: 0};

        })
    });
    setInterval(function () {
        sendSpeed();
    }, 1000);
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
