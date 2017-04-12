var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json')
,	uuidV1 = require('uuid/v1')
, 	constants = require('./constants');

// Webserver
server.listen(conf.broker.port);

// static files
app.use(express.static(__dirname + '/public'));

// if path / is called
app.get('/', function (req, res) {
	// index.html showing
	res.sendfile(__dirname + '/public/index.html');
});

// Websocket
io.sockets.on('connection', function (socket) {

    var address = socket.request.connection;
    console.log('New connection from ' + address.remoteAddress + ':' + address.remotePort);

	//Connecting new Consumer/Provider with Broker
	socket.on('event', function (data) {
		console.log('New Entity online');	
	});

    // Step 1: Handle Tasklet request
    socket.on('TaskletSendBroker', function (data) {
        // Creating Tasklet ID
		var taskletid = uuidV1();
        // Step 1: Illustrating the Tasklet request
        io.sockets.emit('ShowTaskletRequest', {zeit: new Date(), name: data.name, taskletid: taskletid, cost: data.cost, privacy: data.privacy, speed: data.speed,reliability: data.reliability});
		// Step 2: Balance request to SFBroker
        io.sockets.emit('CheckBalance',{
            name: data.name,
            taskletid: taskletid,
            cost: data.cost,
            privacy: data.privacy,
            speed: data.speed,
            reliability: data.reliability
        });
    });

	// Step 3: Receiving the balance from SFBroker
    socket.on('CheckBalance', function (data) {
        var balance = data.balance;
        if ( balance < 30) {
            console.log('ba ' + balance);
            io.sockets.emit('CancelTasklet', {name: data.name});
        }
        
        else {
           // Step 4: Information request to SFBroker
            io.sockets.emit('SFInformation', {
                zeit: new Date(),
                name: data.name,
                taskletid: data.taskletid,
                cost: data.cost,
                privacy: data.privacy,
                speed: data.speed,
                reliability: data.reliability
            });
        }
    });
	
	// Step 5: Receiving potential provider information from SFBroker
	socket.on('SFInformation', function (data) {
		io.sockets.emit('ShowProviderInformation', {zeit: new Date(), name: data.name, taskletid: data.taskletid, potentialprovider: data.potentialprovider });
		
		// Including the speed and reliability informations
		addInformations(data.potentialprovider);

		//Step 6: Finding most suitable provider
		var provider = scheduling(data.potentialprovider, data.cost, data.reliability, data.speed);

		// Step 7: Sending provider and consumer, coins to be blocked information to SFBroker
		//SFBroker blocks the coins from the consumer
        io.sockets.emit('ProviderConsumerInformation', {zeit: new Date(), consumer: data.name, taskletid: data.taskletid, provider: provider, coins: 30 });
	});
	 // Step 9: Receiving potential provider information from SFBroker
	socket.on('ProviderConsumerInformation', function (res) {
		
		// Step 10: Informing consumer and provider about the coins blocking

            io.sockets.emit('CoinsBlock', {
                zeit: new Date(),
                success: res.success,
                consumer: res.consumer,
                provider: res.provider,
                status: res.status,
                coins: res.coins,
                taskletid: res.taskletid
            });

	});
	
	// Step 11: Provider gets Tasklets
	socket.on('SendingTaskletToProvider', function (data) {
		io.sockets.emit('SendingTaskletToProvider', data);
	});
	
	// Step 15: Consumer gets Tasklet result
	socket.on('SendTaskletResultToConsumer', function (data) {
		io.sockets.emit('SendTaskletResultToConsumer', data);
	});
	
});

function addInformations(potentialprovider){
	
	for(var i= 0; i < potentialprovider.length; i++){
		potentialprovider.splice(i, 1, {username: potentialprovider[i].username, price: potentialprovider[i].price, actualreliability: 5, actualspeed: 5});
	}
	return potentialprovider;
	
}

// Currently not used; returns random number for reliability and speed, 1-10
function randomNumber(){
	return Math.floor((Math.random() * 10) + 1)
}

// Step 6: Scheduler chooses based on QoC the most suitable provider
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
		
		if(potentialprovider[i].price > 10){
		console.log('Price is more than 10 ! Please revise');
		}
		
		var newscore = (weightcost * potentialprovider[i].price) + (weightreliability * potentialprovider[i].actualreliability) + (weightspeed * potentialprovider[i].actualspeed);
		
		if(newscore < score){
			score = newscore;
			provider = potentialprovider[i].username;
		}
	}
	
	return provider;

}

console.log('Broker runs on http://' + conf.broker.ip  + ':' + conf.broker.port + '/');