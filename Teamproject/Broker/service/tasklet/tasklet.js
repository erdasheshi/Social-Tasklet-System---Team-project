
// Socket Requests
var net = require('net');
var conf  = require('./../../config.json');
var pH 	= require('./protocolHeader');
var providerList 	= require('./providerList');
var constants = require('./../../constants');

// Socket Request
var server_request = net.createServer(function(socket) {

    socket.on('error', function (exc) {
        console.log("Ignoring exception: " + exc);
    });

    socket.on('data', function(data) {
		
		var messageType = pH.readProtocolHeader(data);

		if(messageType < 0){
			console.log('Invalid message');
		}
		
		// Step 1: Receiving Tasklet Request
		if(messageType == constants.bRequestMessage){
			
			//TODO: Changing the request informations!!
			var isRemote = data.readInt32LE(12);
			if(isRemote = 1){
				isRemote = true;
			}
			else{
				isRemote = false;
			}
			
			var requestedNumber = data.readInt32LE(16);
			
			var requestedInstances = data.readInt32LE(20);
			
			var minimumSpeed = data.readFloatLE(24);
			
			console.log('Remote: ' + isRemote + ' Number: ' + requestedNumber + ' Instances: ' + requestedInstances + ' Speed: ' + minimumSpeed);
			
			//TODO: Step 2: Sending information request to SFBroker
			
			// Step 4: Finding most suitable provider
			//var selectedProvider = scheduling(XXX);
			//TODO: Which informations do we use 
			
			// Step 5: Informing the consumer
			var buf1 = pH.writeProtocolHeader(constants.bResponseMessage);
			
			
		}
		
		else if(messageType != constants.bRequestMessage){
			console.log('Received a wrong message type in tasklet data');
		}
		
    });
	
	 socket.on('close', function(data) {

    });
});

server_request.listen(conf.tasklet.port, conf.tasklet.ip);