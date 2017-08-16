
// Socket Requests
var net = require('net');
var conf  = require('./../../config.json');
var pH 	= require('./protocolHeader');
var providerList 	= require('./providerList');
var constants = require('./../../constants');

// Socket VM Up
var server_vmup = net.createServer(function(socket) {

    socket.on('error', function (exc) {
        console.log("Ignoring exception: " + exc);
    });

    socket.on('data', function(data) {

	console.log(data);
	
	if(data.length ==4){
	}
	
	else{
        var messageType = pH.readProtocolHeader(data);
		var address = socket.remoteAddress;
		
		if(messageType < 0){
			console.log('Invalid message');
		}
		
		if(messageType == constants.vmUpMessage){
			providerList.increaseAvailableVMs(address);
		}
		
		if(messageType == constants.vmDownMessage){
			providerList.decreaseAvailableVMs(address);
		}
		
		else if(messageType != constants.vmUpMessage && messageType != constants.vmDownMessage){
			console.log('Received a wrong message type in vmup data');
		}
	}
    });
	
	socket.on('close', function(data) {

    });
});

server_vmup.listen(conf.vmup.port, conf.vmup.ip);