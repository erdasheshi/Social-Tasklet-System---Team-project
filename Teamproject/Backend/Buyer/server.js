var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json');

if (process.argv.length <= 2) {
    console.log("Port number needed");
    process.exit(-1);
}
 
var port = process.argv[2];
console.log('Port: ' + port);

// Webserver - Client
// auf den Port x schalten
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

	// statische Dateien ausliefern
app.use(express.static(__dirname + '/public'));

// wenn der Pfad / aufgerufen wird
app.get('/', function (req, res) {
	// so wird die Datei index.html ausgegeben
	res.sendfile(__dirname + '/public/index.html');
});

// Websocketnpm inst
io.sockets.on('connection', function (socket) {

	// If user sends request to Broker
	socket.on('TaskletSend', function (data) {
		// Request received and sent to all users
		io.sockets.emit('TaskletSend', { zeit: new Date(), tasklet_id: data.tasklet_id || 'Anonym', cost: data.cost, privacy: data.privacy });

		socket_c.emit('TaskletSendBroker', {zeit: new Date(), tasklet_id: data.tasklet_id || 'Anonym', cost: data.cost, privacy: data.privacy });

		
        // Tasklet can be calculated
        io.sockets.emit('TaskletCalc', { zeit: new Date(), tasklet_id: data.tasklet_id || 'Anonym', seller: 'User ID'});

        // Tasklet can be calculated
        io.sockets.emit('TaskletFinished', { zeit: new Date(), tasklet_id: data.tasklet_id || 'Anonym', seller: 'User ID'});

        // Tasklet can be calculated
        io.sockets.emit('TaskletReceived', { zeit: new Date(), tasklet_id: data.tasklet_id || 'Anonym', buyer: 'User ID'});
        

	});
});


console.log('Buyer/Seller runs on http://127.0.0.1:' + port + '/');