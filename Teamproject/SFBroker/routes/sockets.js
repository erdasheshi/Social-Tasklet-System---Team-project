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
        coinTransaction.findByApproval({approval: 'false'}, function (e, data) {
            io.sockets.emit('Requested_Coins', data);
        });
    });

    //Store the request as approved and updates the balance for the user
    socket.on('CoinsApproval', function (data) {

        var username = data.username;
        var coins = parseInt(data.requestedCoins);

        new_balance = 0;
        var coinTr = coinTransaction.get({
            requestid: data.requestid,
            approval: data.approval,
            username: username,
            requestedCoins: coins
        });
        coinTr.save(function (err, post) {
            if (err) console.error(err);
        });
        user.findByUser({username: username}, function (e, data) {
            if (data.balance == undefined) {
                var old_balance = 5;
            }
            else {
                var old_balance = parseInt(data.balance);
            }
            new_balance = coins + old_balance;
            var user_balance = user.get({
                username: data.username,
                balance: new_balance,
            });
            user_balance.save(function (err, post) {
                if (err) return next(err);
            });
            console.log("The new balance of the consumer: " + new_balance);
            user_balance.update();
        });
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
    //add security check that the computation is really a number
    var cost = data.cost;
    var taskletid = data.taskletid;
    var provider = data.provider;    //***here we get the username of the provider, not the device anymore
    accountingTransaction.findByID({taskletid: taskletid}, function (e, res) {
        var initial_coins = res.coins;
        var consumer = res.consumer;
        var difference = initial_coins - cost;

        var accTransaction = accountingTransaction.get({
            consumer: consumer,
            provider: provider,
            coins: cost,
            status: constants.AccountingStatusConfirmed
        });
        accTransaction.save(function (err, post) {
            if (err) return next(err);
        });
        //transferring money to the provider
        logic.updateBalance(cost, provider);

        // fixing the balance of the consumer, based on the real cost
        logic.updateBalance(difference, consumer);
        console.log('Tasklet ' + res.taskletid + ' confirmed!');
    });
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