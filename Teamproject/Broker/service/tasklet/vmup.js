/**
 * Created by alexb on 7/7/2017.
 */

// Socket Requests
var net    = require('net');
var conf   = require('./../../config.json');

// Socket VM Up
var server_vmup = net.createServer(function(socket) {

    socket.on('error', function (exc) {
        console.log("ignoring exception: " + exc);
    });

    socket.on('data', function(data) {
        console.log(data.toString());
        socket.end();
    });
});

server_vmup.listen(conf.vmup.port, conf.vmup.ip);