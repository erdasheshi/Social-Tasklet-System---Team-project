var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json')
,	uuidV1 = require('uuid/v1');

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
		console.log('New Seller/Buyer online');	
	});

    // Step 1: Handle Tasklet request
    socket.on('TaskletSendBroker', function (data) {
        // Creating Tasklet ID
		var taskletid = uuidV1();
		// Request sent for illustrating on Website
        io.sockets.emit('show', { zeit: new Date(), name: data.name || 'Anonym', taskletid: taskletid, cost: data.cost, privacy: data.privacy });
    });
});


console.log('Broker runs on http://127.0.0.1:' + conf.ports.broker + '/');