
// Socket Requests
var net = require('net');
var conf  = require('./../../config.json');
var pH 	= require('./protocolHeader');
var providerList 	= require('./providerList');
var constants = require('./../../constants');

// Socket Heartbeat
var server_heartbeat = net.createServer(function(socket) {

    socket.on('error', function (exc) {
        console.log("Ignoring exception: " + exc);
    });

    socket.on('data', function(data) {

        console.log(data.toString());
        console.log(socket.remoteAddress + ":" +socket.remotePort);

        socket.write(socket.remoteAddress + ":" +socket.remotePort);

        socket.pipe(socket);

		var protocolHeader = pH.readProtocolHeader(data);



		if(protocolHeader.MessageType < 0){
			console.log('Invalid message');
		}
		
		if(protocolHeader.MessageType == constants.bHeartbeatMessage){
			console.log('Heartbeat from: ' + socket.remoteAddress + ":" + socket.remotePort);
			
			//Adding the new client if it is not yet in the list
			//Otherwise just update the timestamp
			providerList.insertProvider(socket.remoteAddress);

            var responseHeader = JSON.parse(JSON.stringify(protocolHeader));
			responseHeader.MessageType = constants.bIPMessage;

			var buf1 = pH.writeProtocolHeader(responseHeader);
			
			var buf2 = Buffer.alloc(4);
			var address = socket.remoteAddress;
			buf2.writeInt32LE(address,0);
			
			var totalLength = buf1.length + buf2.length;
			var buf = Buffer.concat([buf1,buf2],totalLength);
			
			socket.write(buf);
            socket.pipe(socket);

			
		}
		console.log(protocolHeader.MessageType);
		if(protocolHeader.MessageType == constants.benchmarkMessage){
			var address = socket.remoteAddress;
			var benchmark = data.readFloatLE(12);
			
			//Replace the default benchmark with the actual one
			providerList.updateBenchmark(address, benchmark);
			providerList.decreaseAvailableVMs(address);
		}
		
		else if(protocolHeader.MessageType != constants.bHeartbeatMessage && protocolHeader.MessageType != constants.benchmarkMessage){
			console.log('Received a wrong message type in heartbeat data');
		}

        socket.end();

    });

    socket.on('close', function(data) {

    });
});


providerList.updateProviderList();

server_heartbeat.listen(conf.heartbeat.port, conf.heartbeat.ip);