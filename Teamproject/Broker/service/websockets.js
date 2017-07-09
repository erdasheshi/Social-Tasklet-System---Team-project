/**
 * Created by alexb on 7/7/2017.
 */
var io, uuidV1, constants;

module.exports = function (server) {
    io = require('socket.io').listen(server);
    uuidV1 = require('uuid/v1');
    constants = require('./../constants');

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
            io.sockets.emit('ShowTaskletRequest', {
                zeit: new Date(),
                name: data.name,
                taskletid: taskletid,
                cost: data.cost,
                privacy: data.privacy,
                speed: data.speed,
                reliability: data.reliability
            });

            // Step 2: Information request to SFBroker
            io.sockets.emit('SFInformation', {
                zeit: new Date(),
                name: data.name,
                taskletid: taskletid,
                cost: data.cost,
                privacy: data.privacy,
                speed: data.speed,
                reliability: data.reliability
            });
        });

        // Step 3: Receiving potential provider information from SFBroker
        socket.on('SFInformation', function (data) {

            if (typeof data.balance_check == 'undefined') {

                // Illustrating the Provider informations
                io.sockets.emit('ShowProviderInformation', {
                    zeit: new Date(),
                    username: data.username,
                    taskletid: data.taskletid,
                    potentialprovider: data.potentialprovider
                });

                // Including the speed and reliability informations
                addInformations(data.potentialprovider);

                //Step 4: Finding most suitable provider
                var provider = scheduling(data.potentialprovider, data.cost, data.reliability, data.speed);
                var consumer = data.username;

                // Step 5: Informing consumer
                io.sockets.emit('CoinsBlock', {consumer: consumer, provider: provider, taskletid: data.taskletid});
            }

            else {
                // If balance not sufficient, inform the Consumer about the cancelation
                io.sockets.emit('CancelTasklet', {
                    zeit: new Date(),
                    balance_check: data.balance_check,
                    consumer: data.username,
                    taskletid: data.taskletid,
                    min_balance: data.min_balance
                });
            }
        });

        // Steps 9 & 10: Receiving notification including the consumed time from Provider and sending this to the SFBroker
        socket.on('TaskletCyclesReturn', function (data) {
            io.sockets.emit('SendTaskletResultToConsumer', data);

            io.sockets.emit('TaskletCyclesReturn', data);
        });

        // Step 6: Provider gets Tasklets
        socket.on('SendingTaskletToProvider', function (data) {
            io.sockets.emit('SendingTaskletToProvider', data);
        });

    });

};

// Used for adding the speed and reliability informations
function addInformations(potentialprovider) {

    for (var i = 0; i < potentialprovider.length; i++) {
        potentialprovider.splice(i, 1, {
            username: potentialprovider[i].username,
            price: potentialprovider[i].price,
            actualreliability: 5,
            actualspeed: 5
        });
    }
    return potentialprovider;

}

// Step 4: Scheduler chooses based on QoC the most suitable provider
// Assuming price range is 1-10 and for reliability and speed 1 is best, 10 is worst
function scheduling(potentialprovider, cost, reliability, speed) {

    //Converting QoC high and low to 9 and 1
    cost = cost === 'low' ? 9 : 1;
    reliability = reliability === 'high' ? 9 : 1;
    speed = speed === 'high' ? 9 : 1;

    // Calculating the weights based on QoC high and low
    var total = cost + reliability + speed;

    var weightcost = cost / total;
    var weightreliability = reliability / total;
    var weightspeed = speed / total;

    var provider = '';
    var score = 11;

    // Calculating the score (1-10) for every potential provider
    for (var i = 0; i < potentialprovider.length; i++) {

        if (potentialprovider[i].price > 10) {
            console.log('Price is more than 10 ! Please revise');
        }

        var newscore = (weightcost * potentialprovider[i].price) + (weightreliability * potentialprovider[i].actualreliability) + (weightspeed * potentialprovider[i].actualspeed);

        if (newscore < score) {
            score = newscore;
            provider = potentialprovider[i].username;
        }
    }

    return provider;

}