// Socket Requests
var net = require('net');
var conf = require('./../../config.json');
var pH = require('./protocolHeader');
var providerList = require('./providerList');
var constants = require('./../../constants');

var Map = require("collections/map");


var heartbeatSockets = new Map();

// Socket Heartbeat
var server_heartbeat = net.createServer(function (socket) {

    socket.on('error', function (exc) {
        console.log("Ignoring exception: " + exc);
    });

    socket.on('data', function (data) {
        console.log(data);
        var heartbeat = Buffer.alloc(0);

        var socketIdentifier = socket.remoteAddress + ":" + socket.remotePort;
        if (data.length == 16) {
            heartbeat = data;
            if (heartbeatSockets.has(socketIdentifier)) heartbeatSockets.delete(socketIdentifier);
        }
        else {
            if (heartbeatSockets.has(socketIdentifier)) {
                var tmpData = heartbeatSockets.get(socketIdentifier)
                var heartbeatLength = tmpData.data.length + data.length;
                heartbeat =  Buffer.concat([ tmpData.data, data ], heartbeatLength);
            }
            else {
                heartbeatSockets.add({
                    data : data
                }, socketIdentifier);
            }
        }

        if (heartbeat.length == 16) {
            pH.readProtocolHeader(heartbeat, function (e, data) {
                var messageType = data;

                if (messageType < 0) {
                    console.log('Invalid message');
                }

                if (messageType == constants.bHeartbeatMessage) {
                    console.log('Heartbeat from: ' + socket.remoteAddress + ":" + socket.remotePort);
                    var address = socket.remoteAddress;
                    var deviceID = heartbeat.readInt32LE(12);

                    //Adding the new client if it is not yet in the list
                    //Otherwise just update the timestamp
                    providerList.insertProvider(address, deviceID);

                    pH.writeProtocolHeader(constants.bIPMessage, function (e, data) {
                        var buf1 = data;
                        var buf2 = Buffer.alloc(4);
                        buf2.writeInt32LE(address, 0);

                        var totalLength = buf1.length + buf2.length;
                        var buf = Buffer.concat([ buf1, buf2 ], totalLength);

                        socket.write(buf, function (err) {
                            socket.end();
                        });
                    });
                }

                if (messageType == constants.benchmarkMessage) {
                    var address = socket.remoteAddress;
                    var benchmark = heartbeat.readFloatLE(12);

                    //Replace the default benchmark with the actual one
                    providerList.updateBenchmark(address, benchmark);
                    providerList.decreaseAvailableVMs(address);
                }


                else if (messageType != constants.bHeartbeatMessage && messageType != constants.benchmarkMessage) {
                    console.log('Received a wrong message type in heartbeat data');
                }
            });
        }
        else if (heartbeat.length > 16) {
            pH.writeProtocolHeader(constants.bIPMessage, function (e, data) {
                var address = socket.remoteAddress;
                var buf1 = data;
                var buf2 = Buffer.alloc(4);
                buf2.writeInt32LE(address, 0);

                var totalLength = buf1.length + buf2.length;
                var buf = Buffer.concat([ buf1, buf2 ], totalLength);

                socket.write(buf, function (err) {
                    socket.end();
                });

                if (heartbeatSockets.has(socketIdentifier)) heartbeatSockets.delete(socketIdentifier);

            });

        }

    });

    socket.on('close', function (data) {

    });
});


providerList.updateProviderList();

server_heartbeat.listen(conf.heartbeat.port, conf.heartbeat.ip);