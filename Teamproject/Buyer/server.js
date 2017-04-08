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
var socket_sf = require('socket.io-client')('http://localhost:' + conf.ports.sfbroker_socket);

//Step 10: Receiving the coins block status
socket_c.on('CoinsBlock', function(data){
	if(port == data.consumer || port == data.provider){
	// Step 10: Status sent for illustrating on website
		io.sockets.emit('ShowCoinsBlock', {zeit: new Date(), success: data.success, consumer: data.consumer, provider: data.provider, status: data.status, taskletid: data.taskletid, coins: data.coins});
	}
	if(port == data.consumer){
		io.sockets.emit('ShowTaskletCalc', {zeit: new Date(), provider: data.provider, consumer: data.consumer, taskletid: data.taskletid});
	}
});

// Step 3: Balance was not sufficient
socket_c.on('CancelTasklet', function(data){
	io.sockets.emit('CancelTasklet', data);
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
		io.sockets.emit('ShowTaskletRequest', { zeit: new Date(), name: name, cost: data.cost, privacy: data.privacy, speed: data.speed, reliability: data.reliability });
		// Step 1: Request sent to Broker
		socket_c.emit('TaskletSendBroker', {zeit: new Date(), name: name, cost: data.cost, privacy: data.privacy, speed: data.speed, reliability: data.reliability });

    });

	// Step 11: Consumer sends Tasklet to Provider
	socket.on('SendTaskletToProvider', function (data){
		var socket_s = require('socket.io-client')('http://localhost:' + data.provider)
		socket_s.emit('SendingTaskletToProvider', {taskletid: data.taskletid, provider: data.provider, consumer: data.consumer});

	});

	// Step 11: Provider receives Tasklet
	socket.on('SendingTaskletToProvider', function (data) {
		// Sent for illustrating on website
        io.sockets.emit('ShowTaskletReceived', {zeit: new Date(), consumer: data.consumer, taskletid: data.taskletid});
	});

	// Step 13: Sending Tasklet cycles to SFBroker
    socket.on('TaskletCycles', function (data) {
        socket_sf.emit('TaskletCycles', data);
    });

	// Step 15: Sending Tasklet result to consumer
    socket.on('ReturnTaskletToConsumer', function (data){
        var socket_b = require('socket.io-client')('http://localhost:' + data.consumer)
        socket_b.emit('SendTaskletResultToConsumer', {taskletid: data.taskletid, provider: data.provider, coins: data.coins, computation: data.computation, consumer: data.consumer, result: data.result});
    });

	// Step 15: Receiving the Tasklet result from provider
    socket.on('SendTaskletResultToConsumer', function (data){
        console.log('Tasklet result received from '+ data.provider);
        io.sockets.emit('ShowTaskletFinished', { zeit: new Date(), taskletid: data.taskletid, coins: data.coins, computation: data.computation, provider: data.provider, consumer: data.consumer, result: data.result});
    });

	// Step 16: Sending confirmation to the SF Broker of the received result
    socket.on('TaskletResultConfirm', function (data){
        console.log('Confirm Tasklet to SF Broker!');
        socket_sf.emit('TaskletResultConfirm', data);
    });
});

// Step 14: SF Broker blocked coins for the Provider
socket_sf.on('TaskletCyclesCoinsBlocked', function(data){
    if(port == data.provider) {
        io.sockets.emit('ShowTaskletCyclesCoinsBlocked',{zeit: new Date(), coins: data.coins, confirmation: data.confirmation, provider: data.provider, consumer: data.consumer, taskletid: data.taskletid, computation: data.computation});
    }
});

console.log('Consumer/Provider runs on http://127.0.0.1:' + port + '/');