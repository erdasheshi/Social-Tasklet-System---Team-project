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
    // receive heartbeat from Tasklet Middleware
    socket.on('data', function (data) {
        console.log(data);
        var heartbeat = Buffer.alloc(0);

        var socketIdentifier = socket.remoteAddress + ":" + socket.remotePort;
        // Check for sufficient length of data
        if (data.length == 16) {
            heartbeat = data;
            if (heartbeatSockets.has(socketIdentifier)) heartbeatSockets.delete(socketIdentifier);
        }
        // Glue data to existing data and check, if it is now long enough.
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

        // interpret heartbeat
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
                       
						var addressArray = address.split('.');
						console.log('Ip ' + addressArray);
                        console.log('Ip0 ' + addressArray[0]);
                        console.log('Ip1 ' + addressArray[1]);
                        console.log('Ip2 ' + addressArray[2]);

						var buf2 = Buffer.alloc(4);
						buf2.writeIntLE(addressArray[0],0, 1);
						buf2.writeIntLE(addressArray[1],1, 1);
						buf2.writeIntLE(addressArray[2],2, 1);
						buf2.writeIntLE(addressArray[3],3, 1);

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
                    providerList.decreaseAvailableVMs(address, 1);
                }


                else if (messageType != constants.bHeartbeatMessage && messageType != constants.benchmarkMessage) {
                    console.log('Received a wrong message type in heartbeat data');
                }
            });
        }
        // received too much data --> something went wrong.
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
//providerList.addDummyData();  //--> Use this function ONLY for testing purposes!

server_heartbeat.listen(conf.heartbeat.port, conf.heartbeat.ip);