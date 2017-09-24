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

    //sending the pending coin requests to the Administrator
    socket.on('Requested_Coins', function (data) {
        coinTransaction.findByApproval({ approval: 'false' }, function (e, data) {
            io.sockets.emit('Requested_Coins', data);
        });
    });

    //Store the approved coin requests and updates the balance for the user - requests approved by the Administrator
    socket.on('CoinsApproval', function (data) {

        var username = data.username;
        var coins = parseInt(data.requestedCoins);
        var logic = require('./logic');

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
socket_c.emit('event', { connection: 'I want to connect' });

// checking the balance status of the consumer (the user who sent the tasklet request) and sending possible updates to the broker
socket_c.on('SFInformation', function (data) {
    var balance, further;
    var key = 'Updates';
    var min_balance = 1;
    var device = data.device;
    var broker = 5;   //*** needs to be send by the broker with the information request
    var taskletid = data.taskletid;

    var accountingTransaction = require('../classes/AccountingTransaction');
    var deviceAssignment = require('../classes/DeviceAssignments');

//retrieve data about the device from where the tasklet request was sent
    deviceAssignment.findByID({ device: device }, function (error, data) {
        if (data) {
            //find the owner of the device and check its balance
            var username = data.username;

            console.log("Received tasklet request from user:  " + username + " with tasklet_id: " + taskletid + " and broker: " + broker);

            // Check if the user has enough money in his account
            user.findByUser({ username: username }, function (e, user_data) {
                balance = user_data.balance;


                //if the user has enough money, an accounting transaction will be stored and a fixed amount of money will be blocked from the user
                if (balance >= min_balance) {
                    further = true;   //notify the broker that the user has enough money and the process can proceed further

                    // create dummy transaction - to keep as a record so we can trace tasklets later during the procees
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

                    //block min_balance coins from the consumer
                    var difference = -1 * min_balance;

                    var logic = require('./logic');

                    //update the balance of the consumer
                    logic.updateBalance(difference, username);
                }
                else {  //if the user doesn't have enough money then inform the broker so it can block the process at this point
                    further = false;
                }
                //collect and send the updates for the broker - the one who sent this specific socket call (SFInformation)
                var replicationManager = require('./../replication/replicationManager');
                var updates = replicationManager.updateBroker(broker)
                socket_c.emit('SFInformation', {
                    further: further,
                    username: username,
                    taskletid: taskletid,
                    updates: updates
                });

            });
        }
    });
});

// Tasklet finished + Tasklet cycles known
socket_c.on('TaskletCyclesReturn', function (data) {

    if ( data != null ) {
        var providers = data.providers;
        var taskletid = data.taskletid;

        //find the existing tasklet transaction - the one that was created when the tasklet request was received
        accountingTransaction.findByID({ taskletid: taskletid }, function (e, res) {
            if (e) console.error(err, null);

            var transaction_id = res[0].transaction_id;
            var initial_coins = res[0].coins;
            var consumer = res[0].consumer;
            var total = 0;
            var logic = require('./logic');
            var processor = 0;

            if( data.providers.length != 0){ //if the tasklet was computed by at least one provider - providers were found

            //Create a new tasklet transaction for each provider. Tasklet_id is the same for all of them
            providers.forEach(function (provider, index, array) {
                var cost = provider.cost;
                var device = provider.device;
                var finished;
                //calculate the total cost of the tasklet


                total = total + cost;

                //find the owner of the device used as a provider for the tasklet
                deviceAssignment.findByID({ device: device }, function (e, data) {
                    if (e) console.error(err, null);
                    var device_owner = data.username;
                    finished = false;
                    var accTransaction = accountingTransaction.get({
                        taskletid: taskletid,
                        consumer: consumer,
                        provider: device_owner,
                        coins: cost,
                        status: constants.AccountingStatusConfirmed
                    });
                    accTransaction.save(function (err, post) {
                        if (err) return next(err);
                    });

                    //transferring money to the provider

                   logic.updateBalance(cost, device_owner);

                    //calculate the amount still to be payed by the user when considering the fixed amount subtracted in step 3
                    processor = processor + 1;
                    if ( processor == providers.length ) {
                        // fixing the balance of the consumer, based on the calculated taskelt's cost
                        var difference = initial_coins - total;
                        logic.updateBalance(difference, consumer);
                    }
                });
            });

            //delete the transaction entry stored when the tasklet request was received in step 3
            accountingTransaction.deleteByTransactionID({ transaction_id: transaction_id }, function (e, res) {
                if (e) console.error(err, null);
            });

            console.log('Tasklet ' + res[0].taskletid + ' confirmed!');
                        }
            else {    //the tasklet was not computed - no providers were found

            //update the information in the transaction created when the tasklet request was received
                 var accTransaction = accountingTransaction.get({
                                    taskletid: taskletid,
                                    consumer: consumer,
                                    provider: null,
                                    coins: 0,
                                    status: constants.AccountingStatusNotComputed
                                });
                 //return back the blocked coin to the consumer
                 difference = +1 ;
                 logic.updateBalance(difference, consumer);
                 console.log('No provider for Tasklet ' + data.taskletid + ' found!')
            }
        });
    }
});

//Activate device when the first heartbeat is received by the broker
socket_c.on('ActivateDevice', function (data) {
    if (data.status == constants.DeviceStatusActive) {
        var device = data.device;

        //update the status of the device to Active
        deviceAssignment.findByID({ device: device }, function (e, data) {
            var new_device = deviceAssignment.get({
                device: device,
                username: data.username,
                name: data.name,
                price: data.price,
                status: constants.DeviceStatusActive
            });
            new_device.save(function (err, post) {
                if (err) return next(err);
            });
        });
    }
});

//send the global update to the broker - update send daily to each of the brokers that were outdated
function send_global_updates(broker, updates) {
    socket_c.emit('GlobalUpdate', { broker: broker, updates: updates });
}

module.exports = {
    send_global_updates: function(broker, updates) {
        return send_global_updates(broker, updates);
    }
}