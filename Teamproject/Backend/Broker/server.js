var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json');

// Webserver
// auf den Port x schalten
server.listen(conf.port);

	// statische Dateien ausliefern
app.use(express.static(__dirname + '/public'));

// wenn der Pfad / aufgerufen wird
app.get('/', function (req, res) {
	// so wird die Datei index.html ausgegeben
	res.sendfile(__dirname + '/public/index.html');
});

// Websocket
io.sockets.on('connection', function (socket) {

	// If user sends request to Broker
	socket.on('event', function (data) {
		console.log('Bei Server angekommen');
		// Request received and sent to all users
		io.sockets.emit('event', { zeit: new Date(), name: data.name || 'Anonym', cost: data.cost, privacy: data.privacy });
	});
});


console.log('Der Server läuft nun unter http://127.0.0.1:' + conf.port + '/');