/**
 * Created by alexb on 7/7/2017.
 */

// Socket Requests
var net = require('net');
var conf   = require('./../../config.json');

// Socket Heartbeat
var server_heartbeat = net.createServer(function(socket) {

    socket.on('error', function (exc) {
        console.log("ignoring exception: " + exc);
    });

    socket.on('data', function(data) {
        console.log(data.toString());
        console.log(socket.remoteAddress + ":" +socket.remotePort);

        socket.write(socket.remoteAddress + ":" +socket.remotePort);
        socket.pipe(socket);

        socket.end();
    });

    socket.on('close', function(data) {
        console.log('CLOSED');
    });
});

server_heartbeat.listen(conf.heartbeat.port, conf.heartbeat.ip);