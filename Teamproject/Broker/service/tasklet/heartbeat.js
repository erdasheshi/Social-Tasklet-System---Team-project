// Socket Requests
var net = require('net');
var conf = require('./../../config.json');
var pH = require('./protocolHeader');
var providerList = require('./providerList');
var constants = require('./../../constants');

var heartbeat = Buffer.alloc(0);

// Socket Heartbeat
var server_heartbeat = net.createServer(function (socket) {

    socket.on('error', function (exc) {
        console.log("Ignoring exception: " + exc);
    });

    socket.on('data', function (data) {
        console.log(data);
        if (data.length == 16) {
            heartbeat = data;
        }
        else {
            var heartbeatLength = heartbeat.length + data.length;
            heartbeat = Buffer.concat([heartbeat, data], heartbeatLength);
        }

        if (heartbeat.length == 16) {
            var messageType = pH.readProtocolHeader(heartbeat);

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

                var buf1 = pH.writeProtocolHeader(constants.bIPMessage);
                var buf2 = Buffer.alloc(4);
                buf2.writeInt32LE(address, 0);

                var totalLength = buf1.length + buf2.length;
                var buf = Buffer.concat([buf1, buf2], totalLength);

                heartbeat = Buffer.alloc(0);

                socket.write(buf, function(err) { socket.end(); });

            }

            if (messageType == constants.benchmarkMessage) {
                var address = socket.remoteAddress;
                var benchmark = data.readFloatLE(12);

                //Replace the default benchmark with the actual one
                providerList.updateBenchmark(address, benchmark);
                providerList.decreaseAvailableVMs(address);
            }

            else if (messageType != constants.bHeartbeatMessage && messageType != constants.benchmarkMessage) {
                console.log('Received a wrong message type in heartbeat data');
            }
        }
        else if (heartbeat.length > 16) {
            var buf1 = pH.writeProtocolHeader(constants.bIPMessage);
            var buf2 = Buffer.alloc(4);
            buf2.writeInt32LE(address, 0);

            var totalLength = buf1.length + buf2.length;
            var buf = Buffer.concat([buf1, buf2], totalLength);

            socket.write(buf, function(err) { socket.end(); });
        }

    });

    socket.on('close', function (data) {

    });
});


providerList.updateProviderList();

server_heartbeat.listen(conf.heartbeat.port, conf.heartbeat.ip);