// Socket Requests
var net = require('net');
var conf = require('./../../config.json');
var pH = require('./protocolHeader');
var providerList = require('./providerList');
var constants = require('./../../constants');

var vmup = Buffer.alloc(0);

// Socket VM Up
var server_vmup = net.createServer(function (socket) {

    socket.on('error', function (exc) {
        console.log("Ignoring exception: " + exc);
    });

    socket.on('data', function (data) {

        if (data.length == 16) {
            vmup = data;
        }
        else {
            var vmupLength = vmup.length + data.length;
            vmup = Buffer.concat([vmup, data], vmupLength);
        }

        if (vmup.length == 16) {

            pH.readProtocolHeader(vmup, function (e, data) {
                var messageType = data;
                var address = socket.remoteAddress;

                if (messageType < 0) {
                    console.log('Invalid message');
                }

                if (messageType == constants.vmUpMessage) {
                    providerList.increaseAvailableVMs(address);
                }

                if (messageType == constants.vmDownMessage) {
                    providerList.decreaseAvailableVMs(address);
                }

                else if (messageType != constants.vmUpMessage && messageType != constants.vmDownMessage) {
                    console.log('Received a wrong message type in vmup data');
                }
                vmup = Buffer.alloc(0);
            });
        }
        else if (vmup.length > 16){
            vmup = Buffer.alloc(0);
        }
    });

    socket.on('close', function (data) {

    });
});

server_vmup.listen(conf.vmup.port, conf.vmup.ip);