// Socket Requests
var net = require('net');
var conf = require('./../../config.json');
var pH = require('./protocolHeader');
var providerList = require('./providerList');
var constants = require('./../../constants');

var Map = require("collections/map");

var vmupSockets = new Map();

// Socket VM Up
var server_vmup = net.createServer(function (socket) {

    socket.on('error', function (exc) {
        console.log("Ignoring exception: " + exc);
    });

    socket.on('data', function (data) {

		var vmup = Buffer.alloc(0);
		var socketIdentifier = socket.remoteAddress + ":" + socket.remotePort;
		 
        if (data.length == 16) {
            vmup = data;
			if (vmupSockets.has(socketIdentifier)) vmupSockets.delete(socketIdentifier);
        }
        else {
			if(vmupSockets.has(socketIdentifier)){
				var tmpData = vmupSockets.get(socketIdentifier)
                var vmupLength = tmpData.data.length + data.length;
                vmup =  Buffer.concat([ tmpData.data, data ], vmupLength);	
			}
			  else {
                vmupSockets.add({
                    data : data
                }, socketIdentifier);
            }
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
                    providerList.decreaseAvailableVMs(address, 1);
                }

                else if (messageType != constants.vmUpMessage && messageType != constants.vmDownMessage) {
                    console.log('Received a wrong message type in vmup data');
                }
            });
        }
        else if (vmup.length > 16){
        }
    });

    socket.on('close', function (data) {

    });
});

server_vmup.listen(conf.vmup.port, conf.vmup.ip);