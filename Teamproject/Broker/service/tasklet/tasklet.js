/**
 * Created by alexb on 7/7/2017.
 */
// Socket Requests
var net = require('net');
var conf   = require('./../../config.json');

var server_request = net.createServer(function(socket) {

    socket.on('error', function (exc) {
        console.log("ignoring exception: " + exc);
    });

    socket.on('data', function(data) {
        console.log(data.toString());
        socket.end();
    });
});

server_request.listen(conf.tasklet.port, conf.tasklet.ip);