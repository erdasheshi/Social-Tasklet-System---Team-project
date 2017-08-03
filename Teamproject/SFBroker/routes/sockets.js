//Socket calls with the Broker
var express = require('express')
, app = express();

var constants = require('../constants');
var dbAccess = require('./dbAccess');
var logic = require('./logic');
var log = require('./log');

var user = require('../classes/User');
var accountingTransaction = require('../classes/AccountingTransaction');
var coinTransaction = require('../classes/CoinTransaction');

// websocket
var server = require('http').createServer(app)
    , io = require('socket.io').listen(server)
    , conf = require('../config.json');

server.listen(conf.sfbroker_socket.port);

io.sockets.on('connection', function (socket) {

    //sending the coin requests to the front-end of the administrator
    socket.on('Requested_Coins', function (data) {
        var username = data.username;
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
    var  balance, further;
    var key = 'Updates';
    var min_balance = 1;
    var username = data.username;
    var broker = 5;   //*** needs to be send by the broker with the information request
    var taskletid = data.taskletid;

 console.log(data + " get brokers request data --- sockets ");
 console.log(username + " Username");
 console.log(taskletid + " taasklet id ");
 console.log(broker + " broker");

    // Check if the user has enough money in his account
    dbAccess.find({type: constants.User, username: username}).exec(function (e, user_data) {
        balance = user_data.balance;
        console.log(user_data.balance);

        //if the user has enough money, an accounting transaction will be stored and a fixed amount of money will be blocked from the user
          if(balance >= min_balance) {
             further = 'yes';
            // create dummy transaction
            var accTransaction = new accountingTransaction({
                                                    consumer: username,
                                                    coins: min_balance,
                                                    status: constants.AccountingStatusBlocked,
                                                    taskletid: taskletid,
                                                    time: new Date()
                                                    });
            accTransaction.save();
            var difference = -1 * min_balance;
            logic.updateBalance(difference, username);
            }
            else{
             further = 'no';
            }
         });
  var updates = logic.updateBroker(broker);
   //*** not sure if the taskletid needs to be passed further to the broker since he was the one who sent it in the firs place
 //the socket call that will return the results and the updates to the broker
socket_c.emit('SFInformation', {further: further, username: username, taskletid: taskletid, updates: updates});
    });

//************************************ tested until here



////*********** the part below is not changed

// Step 11: Tasklet finished + Tasklet cycles known
socket_c.on('TaskletCyclesReturn', function (data) {
console.log(" socket tasklet cycle return at the sfbroker sockets " + data.cost + " the cost sent by the broker")
    //add security check that the computation is really a number
    var cost = data.cost;
    var taskletid = data.taskletid;
    var provider = data.provider;    //***here we get the username of the provider, not the device anymore
    dbAccess.find({type: constants.Accounting, taskletid: taskletid}).exec(function (e, res) {

        var initial_coins = res.coins;
        var consumer = res.consumer;
        var difference = initial_coins - cost;

        var accTransaction = new accountingTransaction({
            consumer: consumer,
            provider: provider,
            coins: cost,
            status: constants.AccountingStatusConfirmed
        });
        accTransaction.update();

        //transferring money to the provider
        logic.updateBalance(cost, provider);

        // fixing the balance of the consumer, based on the real cost
        logic.updateBalance(difference, consumer);

        console.log(cost + ' after update cost');
        console.log('Tasklet ' + res.taskletid + ' confirmed!');
        });
    });
