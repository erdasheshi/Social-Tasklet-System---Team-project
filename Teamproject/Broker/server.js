var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json')
,	uuidV1 = require('uuid/v1')
, 	constants = require('./constants');

// Webserver
server.listen(conf.ports.broker);

// static files
app.use(express.static(__dirname + '/public'));

// if path / is called
app.get('/', function (req, res) {
	// index.html showing
	res.sendfile(__dirname + '/public/index.html');
});

// Websocket
io.sockets.on('connection', function (socket) {

	//Connecting new Consumer/Provider with Broker
	socket.on('event', function (data) {
		console.log('New Entity online');	
	});

    // Step 1: Handle Tasklet request
    socket.on('TaskletSendBroker', function (data) {
        // Creating Tasklet ID
		var taskletid = uuidV1();
		// Request sent for illustrating on Website
		
        io.sockets.emit('ShowTaskletRequest', { zeit: new Date(), name: data.name, taskletid: taskletid, cost: data.cost, privacy: data.privacy, speed: data.speed, reliability: data.reliability});

		// Step 2: Information request to SFBroker
		io.sockets.emit('SFInformation', {zeit: new Date(), name: data.name, taskletid : taskletid, cost: data.cost, privacy: data.privacy, speed: data.speed, reliability: data.reliability});
    });
	
	
	// Step 3: Receiving potential provider information from SFBroker
	socket.on('SFInformation', function (data) {
		io.sockets.emit('ShowProviderInformation', {zeit: new Date(), name: data.name, taskletid: data.taskletid, potentialprovider: data.potentialprovider });
		//Step 4: Finding most suitable provider
		var provider = scheduling(data.potentialprovider);
		// Step 5: Sending provider and consumer information to SFBroker
        io.sockets.emit('ProviderConsumerInformation', {zeit: new Date(), consumer: data.name, taskletid: data.taskletid, provider: provider });
	 });
	 
	 // Step 7: Receiving potential provider information from SFBroker
	socket.on('ProviderConsumerInformation', function (data) {
		// Step 8: Informing consumer and provider about the coins blocking
		io.sockets.emit('CoinsBlock', {zeit: new Date(), success: data.success, consumer: data.consumer, provider: data.provider, status: data.status, taskletid: data.taskletid});
	});
	
});

// Step 4: Scheduler chooses first element in array
function scheduling(potentialprovider) {
	
return potentialprovider[0].userid;

};

console.log('Broker runs on http://127.0.0.1:' + conf.ports.broker + '/');