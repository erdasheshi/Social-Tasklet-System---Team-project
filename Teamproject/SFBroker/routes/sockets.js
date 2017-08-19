//Socket calls with the Broker
var express = require('express')
    , app = express();

var constants = require('../constants');
var logic = require('./logic');
var log = require('./../replication/log');

var user = require('../classes/User');
var accountingTransaction = require('../classes/AccountingTransaction');
var coinTransaction = require('../classes/CoinTransaction');
var deviceAssignment = require('../classes/DeviceAssignments');


var replicationManager = require('./../replication/replicationManager');

// websocket
var server = require('http').createServer(app)
    , io = require('socket.io').listen(server)
    , conf = require('../config.json');

server.listen(conf.sfbroker_socket.port);

io.sockets.on('connection', function (socket) {

    //sending the coin requests to the front-end of the administrator
    socket.on('Requested_Coins', function (data) {
    console.log("the request comes");
        coinTransaction.findByApproval({approval: 'false'}, function (e, data) {
        console.log("the results are sent");
            io.sockets.emit('Requested_Coins', data);
        });
    });

    //Store the request as approved and updates the balance for the user
    socket.on('CoinsApproval', function (data) {

        var username = data.username;
        var coins = parseInt(data.requestedCoins);

        var coinTr = coinTransaction.get({
            requestid: data.requestid,
            approval: data.approval,
            username: username,
            requestedCoins: coins
        });
        coinTr.save(function (err, post) {
            if (err) console.error(err);
        });

        var difference = coins;
        logic.updateBalance(difference, username);

    })
});

// Connect to Broker
var socket_c = require('socket.io-client')('http://' + conf.broker.ip + ':' + conf.broker.port);
socket_c.emit('event', {connection: 'I want to connect'});

// Step 3: Finding and sending friends information for Broker
socket_c.on('SFInformation', function (data) {
    var balance, further;
    var key = 'Updates';
    var min_balance = 1;
    var device = data.device;
    var broker = 5;   //*** needs to be send by the broker with the information request
    var taskletid = data.taskletid;

    deviceAssignment.findByID({device: device}, function (error, data) {

        var username = data.username;

        console.log("Received tasklet request: " + username + " Username " + taskletid + " taskletid " + broker + " broker");

        // Check if the user has enough money in his account
        user.findByUser({username: username}, function (e, user_data) {
            balance = user_data.balance;

            //if the user has enough money, an accounting transaction will be stored and a fixed amount of money will be blocked from the user
            if (balance >= min_balance) {
                further = true;
                // create dummy transaction
                var accTransaction = accountingTransaction.get({
                    consumer: username,
                    coins: min_balance,
                    status: constants.AccountingStatusBlocked,
                    taskletid: taskletid,
                    time: new Date()
                });
                accTransaction.save(function (err, post) {
                    if (err) return next(err);
                });
                var difference = -1 * min_balance;
                logic.updateBalance(difference, username);
            }
            else {
                further = false;
            }

            var updates = replicationManager.updateBroker(broker);
            //*** not sure if the taskletid needs to be passed further to the broker since he was the one who sent it in the firs place
            //the socket call that will return the results and the updates to the broker
            socket_c.emit('SFInformation', {
                further: further,
                username: username,
                taskletid: taskletid,
                updates: updates
            });
        });

    });

});

// Step 11: Tasklet finished + Tasklet cycles known
socket_c.on('TaskletCyclesReturn', function (data) {
if(data != null){
var providers = data.provider;
var taskletid = data.taskletid;

accountingTransaction.findByID({taskletid: taskletid}, function (e, res) {
    var initial_coins = res.coins;
    var consumer = res.consumer;

providers.forEach(function ( device, index, array){
    var cost = device.cost;
    var device = device.device;
var total = 0 ;
    var difference = initial_coins - cost;

    deviceAssignment.findByID({device: device}, function (error, data) {

        var username = data.username;
total = total + cost;
//generate a list of providers and the total of the cost then update the transaction

    //transferring money to the provider
    logic.updateBalance(cost, username);
});

  var accTransaction = accountingTransaction.get({ //transfer in the end
        consumer: consumer,
        provider: provider,
        coins: cost,
        status: constants.AccountingStatusConfirmed
    });
    accTransaction.save(function (err, post) {
        if (err) return next(err);
    });
    // fixing the balance of the consumer, based on the real cost
    logic.updateBalance(difference, consumer);
    console.log('Tasklet ' + res.taskletid + ' confirmed!');
    });
    });
    };
    });


//Activate device when recieved the first heartbeat
        socket_c.on('ActivateDevice', function (data) {
            if (data.status == constants.DeviceStatusActive) {
                deviceAssignment.findByID({device: data.device}, function (e, data) {
                    var device = deviceAssignment.get({
                        username: data.username,
                        name: data.name,
                        device: data.device,
                        price: data.price,
                        status: constants.DeviceStatusActive
                    });

                    device.save(function (err, post) {
                        if (err) return next(err);
                    });
                });
            }
        });