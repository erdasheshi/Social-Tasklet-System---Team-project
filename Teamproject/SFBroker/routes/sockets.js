var express = require('express')
, app = express();

// websocket
var server = require('http').createServer(app)
    , io = require('socket.io').listen(server)
    , conf = require('../config.json');

var dbAccess = require('./dbAccess');
var accountingTransaction = require('../classes/AccountingTransaction');
var coinTransaction = require('../classes/CoinTransaction');

var user = require('../classes/User');
var logic = require('./logic');

var constants = require('../constants');
server.listen(conf.sfbroker_socket.port);
console.log(conf.sfbroker_socket.port);

io.sockets.on('connection', function (socket) {

    //sending the coin requests to the front-end of the administrator
    socket.on('Requested_Coins', function (data) {
        var username = data.username;
        console.log('Request received!');
        dbAccess.find({type: constants.CoinReq, username: username}).exec(function (e, data) {
            console.log(data);
            io.sockets.emit('Requested_Coins', data);
        })
    });

   //Store the request as approved and updates the balance for the user
    socket.on('CoinsApproval', function (data) {
      var username   = data.username;
      var coins    = parseInt( data.requestedCoins);
        new_balance = 0 ;
        console.log(data);
        var coinTr = new coinTransaction({
            requestid: data.requestid,
            approval: data.approval,
            username: username,
            requestedCoins: coins
        });
        coinTr.update();
        dbAccess.find({type: constants.User, username: username}).exec(function (e, data) {
            if (data.balance == undefined){
           var old_balance = 5;
               }
           else {
                var old_balance = parseInt(data.balance);
            }
            new_balance = coins + old_balance;
            var user_balance = new user({
                username: data.username,
                balance: new_balance,
            });
            console.log(new_balance);
            user_balance.update();
        });
           })
});

//Data exchange Broker/ SFBroker

// Connect to Broker
var socket_c = require('socket.io-client')('http://' + conf.broker.ip + ':' + conf.broker.port);

socket_c.emit('event', {connection: 'I want to connect'});

// Step 3: Finding and sending friends information for Broker
socket_c.on('SFInformation', function (data) {
    var username = data.name;
    var taskletid = data.taskletid;
    var cost = data.cost;
    var reliability = data.reliability;
    var speed = data.speed;
    var qoc_privacy = data.privacy;
	// Setting the required minimum balance
    var min_balance = 1;

    // Check Balance >= min_balance
    dbAccess.find({type: constants.User, username: username}).exec(function (e, data) {
        var balance = data.balance;

        if(balance >= min_balance) {
            logic.find({
                type: constants.PotentialProvider,
                username: username,
                privacy: qoc_privacy
            }, function (e, res) {
                //builds the string that will be sent via socket.emit
                var response = '{ \"username\": \"' + username + '\", \"taskletid\": \"' + taskletid + '\", \"cost\": \"' + cost + '\", \"reliability\": \"' + reliability + '\", \"speed\": \"' + speed + '\", \"potentialprovider\": ' + res + '}';
                socket_c.emit('SFInformation', JSON.parse(response.toString()));
            });

            // create dummy transaction
            var accTransaction = new accountingTransaction({
                consumer: username,
                computation: 0,
                coins: min_balance,
                status: constants.AccountingStatusBlocked,
                taskletid: taskletid
            });
            accTransaction.save();

            var difference = -1 * min_balance;
            logic.updateBalance(difference, username);

        }
        else{
            socket_c.emit('SFInformation', {balance_check: false, username : username, taskletid : taskletid, min_balance : min_balance});
        }

    });

});

// Step 11: Tasklet finished + Tasklet cycles known
socket_c.on('TaskletCyclesReturn', function (data) {
    //add security check that the computation is really a number
    var computation = data.computation;
    var cost;
    var price;
    var taskletid = data.taskletid;
    var provider = data.provider;

    dbAccess.find({type: constants.Accounting, taskletid: taskletid}).exec(function (e, res) {

        var initial_coins = res.coins;
        var consumer = res.consumer;

        dbAccess.find({type: constants.User, username: provider}).exec(function (e, udata) {

            price = udata.price;

            cost = computation * price;
            console.log('computation  ' + computation);
            console.log('cost ' + cost);
            var difference = initial_coins - cost;

            var accTransaction = new accountingTransaction({
                consumer: consumer,
                provider: provider,
                computation: computation,
                coins: cost,
                status: constants.AccountingStatusConfirmed,
                taskletid: taskletid
            });
            accTransaction.save();

            // function call for the updatebalanc function
            logic.updateBalance(cost, provider);

            // function call for the updatebalanc function
            logic.updateBalance(difference, consumer);

            console.log(cost + ' after update cost');
            console.log('Tasklet ' + res.taskletid + ' confirmed!');
        });
    });
});

