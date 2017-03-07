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

// Connect to broker
var socket_c = require('socket.io-client')('http://localhost:' + conf.ports.broker);
var socket_sf = require('socket.io-client')('http://localhost:' + conf.ports.sfbroker_socket)

//Step 8: Receiving the coins block status
socket_c.on('CoinsBlock', function(data){
	if(port == data.buyer || port == data.seller){
	// Step 8: Status sent for illustrating on website
		io.sockets.emit('ShowCoinsBlock', {zeit: new Date(), success: data.success, buyer: data.buyer, seller: data.seller, status: data.status, taskletid: data.taskletid});
	}
	
	if(port == data.buyer){
	
		io.sockets.emit('ShowTaskletCalc', {zeit: new Date(), seller: data.seller, buyer: data.buyer, taskletid: data.taskletid});
	}
			
});

socket_c.emit('event', {connection : 'I want to connect'});

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
		var name = port;
		// Step 1: Request sent for illustrating on website
		io.sockets.emit('ShowTaskletRequest', { zeit: new Date(), name: name, cost: data.cost, privacy: data.privacy });
		// Step 1: Request sent to Broker
		socket_c.emit('TaskletSendBroker', {zeit: new Date(), name: name, cost: data.cost, privacy: data.privacy });
	});
	
	// Step 9: Buyer sends Tasklet to Seller
	socket.on('SendTaskletToSeller', function (data){
		var socket_s = require('socket.io-client')('http://localhost:' + data.seller)
		socket_s.emit('SendingTaskletToSeller', {taskletid: data.taskletid, seller: data.seller, buyer: data.buyer});
	});
	
	// Step 9: Seller receives Tasklet
	socket.on('SendingTaskletToSeller', function (data) {
		// Sent for illustrating on website
		io.sockets.emit('ShowTaskletReceived', {zeit: new Date(), buyer: data.buyer, taskletid: data.taskletid});
	});

    socket.on('TaskletCycles', function (data) {
        socket_sf.emit('TaskletCycles', data);
    });

    socket.on('ReturnTaskletToBuyer', function (data){
        var socket_b = require('socket.io-client')('http://localhost:' + data.buyer)
        socket_b.emit('SendTaskletResultToBuyer', {taskletid: data.taskletid, seller: data.seller, buyer: data.buyer, result: data.result});
    });

    socket.on('SendTaskletResultToBuyer', function (data){
        console.log('Tasklet result received from '+ data.seller);
        io.sockets.emit('TaskletFinished', { zeit: new Date(), taskletid: data.taskletid, seller: data.seller, buyer: data.buyer, result: data.result});
    });

    socket.on('TaskletResultConfirm', function (data){
        console.log('Confirm Tasklet to SF Broker!');
        socket_sf.emit('TaskletResultConfirm', data);
    });

});

socket_sf.on('TaskletCyclesMoneyBlocked', function(data){
	console.log('Money for Cycles Blocked!');
    if(port == data.seller) {
        io.sockets.emit('TaskletCyclesMoneyBlocked', {zeit: new Date(), seller: data.seller, buyer: data.buyer, taskletid: data.taskletid});
    }
});


console.log('Buyer/Seller runs on http://127.0.0.1:' + port + '/');