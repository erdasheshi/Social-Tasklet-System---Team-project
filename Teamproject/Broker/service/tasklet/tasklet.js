
var net = require('net');
var conf  = require('./../../config.json');
var pH 	= require('./protocolHeader');
var providerList 	= require('./providerList');
var constants = require('./../../constants');
var uuidV1 = require('uuid/v1');


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
			
			var taskletid = uuidV1();
			var broker_id = 3; //important in case of distributed - multiple brokers

			// TODO: Get the username
			
			var isRemote = data.readInt32LE(12);
			var requestedNumber = data.readInt32LE(16);
			var requestedInstances = data.readInt32LE(20);
			var minimumSpeed = data.readFloatLE(24);
			var requestingIP = data.readInt32LE(28);
			var cost = data.readInt32LE(32); 
			var privacy = data.readInt32LE(36);
			
			requestingIP = socket.remoteAddress;
			var deviceID = providerList.getDeviceID(requestingIP);
			
			console.log('Remote: ' + isRemote + ' Number: ' + requestedNumber + ' Instances: ' + requestedInstances + ' Minimum Speed: ' + minimumSpeed + ' Requesting IP: ' + requestingIP + ' Cost: ' + cost + ' Privacy: ' + privacy);
			//Step 2: Sending information request to SFBroker
			//sendSFInformation(username, taskletid, broker_id);
			
			// Step 4: Finding most suitable provider
			//var selectedProvider = scheduling(XXX);
			
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