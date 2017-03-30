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
		
		// Including the speed and reliability informations
		addInformations(data.potentialprovider);

		//Step 4: Finding most suitable provider
		var provider = scheduling(data.potentialprovider, data.cost, data.reliability, data.speed);
		
		// Step 5: Sending provider and consumer information to SFBroker
        io.sockets.emit('ProviderConsumerInformation', {zeit: new Date(), consumer: data.name, taskletid: data.taskletid, provider: provider });
	 });
	 
	 // Step 7: Receiving potential provider information from SFBroker
	socket.on('ProviderConsumerInformation', function (data) {
		// Step 8: Informing consumer and provider about the coins blocking
		io.sockets.emit('CoinsBlock', {zeit: new Date(), success: data.success, consumer: data.consumer, provider: data.provider, status: data.status, taskletid: data.taskletid});
	});
	
});

function addInformations(potentialprovider){
	
	for(var i= 0; i < potentialprovider.length; i++){
		potentialprovider.splice(i, 1, {userid: potentialprovider[i].userid, price: potentialprovider[i].price, actualreliability: 5, actualspeed: 5});
	}
	return potentialprovider;
	
}

// Currently not used; returns random number for reliability and speed, 1-10
function randomNumber(){
	return Math.floor((Math.random() * 10) + 1)
}

// Step 4: Scheduler chooses based on QoC the most suitable provider
// Assuming price range is 1-10 and for reliability and speed 1 is best, 10 is worst
function scheduling(potentialprovider, cost, reliability, speed){
	
	//Converting QoC high and low to 9 and 1
	if(cost == 'low'){
		cost = 9;
	}
	else{
		cost= 1;
	}
	
	if(reliability == 'high'){
		reliability = 9;
	}
	else {
		reliability = 1;
	}
	
	if (speed == 'high'){
		speed = 9;
	}
	else {
		speed = 1;
	}
	
	
	// Calculating the weights based on QoC high and low
	var total = cost + reliability + speed;
	
	var weightcost = cost / total;
	var weightreliability = reliability / total;
	var weightspeed = speed / total;
	
	var provider = '';
	var score = 11;
	
	// Calculating the score (1-10) for every potential provider
	for(var i= 0; i < potentialprovider.length; i++){
		
		var newscore = (weightcost * potentialprovider[i].price) + (weightreliability * potentialprovider[i].actualreliability) + (weightspeed * potentialprovider[i].actualspeed);
		
		if(newscore < score){
			score = newscore;
			provider = potentialprovider[i].userid;
		}
	}
	
	return provider;

}

console.log('Broker runs on http://127.0.0.1:' + conf.ports.broker + '/');