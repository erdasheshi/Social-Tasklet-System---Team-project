var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json');

// Processing the stated port number
if (process.argv.length <= 2) {
    console.log("Port number needed");
    process.exit(-1);
}
 
var port = process.argv[2];
console.log('Port: ' + port);

// Webserver
server.listen(port);

// Connect to broker
var socket_c = require('socket.io-client')('http://localhost:' + conf.ports.broker);

// Add a connect listener
socket_c.on('event', function(socket) {
    console.log('Connected to Broker!');
});

socket_c.on('connection', function () {
    // socket connected
    console.log('Connected to Broker via connecton!');
});

socket_c.emit('event', { name: 'ads', privacy: 'ase', cost: '123' });

// static files
app.use(express.static(__dirname + '/public'));

// if path / is called
app.get('/', function (req, res) {
	// index.html showing
	res.sendfile(__dirname + '/public/index.html');
});

// Websocket
io.sockets.on('connection', function (socket) {

	// If user sends request to Broker
	socket.on('TaskletRequest', function (data) {
		// Step 1: Request sent for illustrating on Website
		io.sockets.emit('TaskletRequest', { zeit: new Date(), name: data.name, cost: data.cost, privacy: data.privacy });
		// Step 1: Request sent to Broker
		socket_c.emit('TaskletSendBroker', {zeit: new Date(), name: data.name, cost: data.cost, privacy: data.privacy });

		
        // Tasklet can be calculated
        //io.sockets.emit('TaskletCalc', { zeit: new Date(), tasklet_id: data.tasklet_id || 'Anonym', seller: 'User ID'});

        // Tasklet can be calculated
        //io.sockets.emit('TaskletFinished', { zeit: new Date(), tasklet_id: data.tasklet_id || 'Anonym', seller: 'User ID'});

        // Tasklet can be calculated
        //io.sockets.emit('TaskletReceived', { zeit: new Date(), tasklet_id: data.tasklet_id || 'Anonym', buyer: 'User ID'});
        

	});
});


console.log('Buyer/Seller runs on http://127.0.0.1:' + port + '/');