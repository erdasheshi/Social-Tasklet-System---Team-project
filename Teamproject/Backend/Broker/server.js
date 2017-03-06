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

	//Connecting new Seller/Buyer with Broker
	socket.on('event', function (data) {
		console.log('New Entity online');	
	});

    // Step 1: Handle Tasklet request
    socket.on('TaskletSendBroker', function (data) {
        // Creating Tasklet ID
		var taskletid = uuidV1();
		// Request sent for illustrating on Website
        io.sockets.emit('ShowTaskletRequest', { zeit: new Date(), name: data.name || 'Anonym', taskletid: taskletid, cost: data.cost, privacy: data.privacy });

		// Step 2: Information request to SFBroker
		io.sockets.emit('SFInformation', {zeit: new Date(), name: data.name, taskletid : taskletid, cost: data.cost, privacy: data.privacy });
    });
	
	// Step 3: Receiving potential seller information from SFBroker
	socket.on('SFInformation', function (data) {
		io.sockets.emit('ShowSellerInformation', {zeit: new Date(), name: data.name, taskletid: data.taskletid, potentialseller: data.potentialseller });
		//Step 4: Finding most suitable seller
		var seller = scheduling(data.potentialseller);
		// Step 5: Sending seller and buyer information to SFBroker
        io.sockets.emit('SellerBuyerInformation', {zeit: new Date(), buyer: data.name, taskletid: data.taskletid, seller: seller });
	 });
	 
	 // Step 7: Receiving potential seller information from SFBroker
	socket.on('SellerBuyerInformation', function (data) {
		// Step 8: Informing buyer and seller about the coins blocking
		io.sockets.emit('CoinsBlock', {zeit: new Date(), success: data.success, buyer: data.buyer, seller: data.seller,
										status: data.status, taskletid: data.taskletid});
	
	});
	
});

// Step 4: Scheduler chooses first element in array
function scheduling(potentialseller) {
	
return potentialseller[0];

};

console.log('Broker runs on http://127.0.0.1:' + conf.ports.broker + '/');