var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json')
, 	constants = require('./constants');
 
var port = conf.admin.port;
console.log('Port: ' + port);

// Webserver
server.listen(port);

// Connect to SFbroker
var socket_sf = require('socket.io-client')('http://' + conf.sfbroker_socket.ip + ':' + conf.sfbroker_socket.port);

// static files
app.use(express.static(__dirname + '/public'));

// if path / is called
app.get('/', function (req, res) {
	// index.html showing
	res.sendfile(__dirname + '/public/index.html');
});

// Websocket
io.sockets.on('connection', function (socket) {
     //triggered from a frontend button pushed by the Admin
	socket.on('SendCoinsApproval', function (data){

	//send approval to the SF-Broker
		socket_sf.emit('CoinsApproval', {requestid: data.requestid, username: data.username, requestedCoins: data.requestedcoins, approval: data.approval});
	});
	//triggered from the frond-end - button "Get Requests"
	socket.on('GetRequests', function (data) {

	    //send request to the SF-Broker
    	socket_sf.emit('Requested_Coins', {username: ''});
    });
});

// Receiving coin request from SFBroker
socket_sf.on('Requested_Coins', function (data){
		for(var i= 0; i < data.length; i++){
		//showing the recieved coins request in the front-end of the Admin
		io.sockets.emit('ShowCoinRequest', {zeit: new Date(), requestid: data[i].requestid, username: data[i].username, requestedcoins: data[i].requestedCoins});
		}
});

console.log('Admin runs on http://' + conf.admin.ip + ':' + conf.admin.port);
