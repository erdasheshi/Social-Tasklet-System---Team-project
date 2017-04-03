var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json')
, 	constants = require('./constants');

// Processing the stated port number
if (process.argv.length <= 2) {
    console.log("Port number needed");
    process.exit(-1);
}
 
var port = process.argv[2];
console.log('Port: ' + port);

// Webserver
server.listen(port);

// Connect to SFbroker
var socket_sf = require('socket.io-client')('http://localhost:' + conf.ports.sfbroker_socket);

// static files
app.use(express.static(__dirname + '/public'));

// if path / is called
app.get('/', function (req, res) {
	// index.html showing
	res.sendfile(__dirname + '/public/index.html');
});

// Websocket
io.sockets.on('connection', function (socket) {
		
	socket.on('SendCoinsApproval', function (data){
		socket_sf.emit('CoinsApproval', {requestid: data.requestid, userid: data.userid, requestedCoins: data.requestedcoins, approval: data.approval});
	});
	
});

// Receiving coin request from SFBroker
socket_sf.on('Requested_Coins', function (data){
		console.log(data.length + 'Coin request(s) arrived');
		for(var i= 0; i < data.length; i++){
		io.sockets.emit('ShowCoinRequest', {zeit: new Date(), requestid: data[i].requestid, userid: data[i].userid, requestedcoins: data[i].requestedCoins});
		}
});



console.log('Admin runs on http://127.0.0.1:' + port + '/');