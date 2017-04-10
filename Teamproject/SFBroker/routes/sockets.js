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

io.sockets.on('connection', function (socket) {
    // der Client ist verbunden
    socket.emit('SFConnection', {zeit: new Date(), text: 'Connected!'});
/*
    socket.on('SFWrite_User', function (data) { // Move to register
        var userSave = new user(data);
        userSave.save();
    });
*/
    // Step 13: Tasklet finished + Tasklet cycles known
    socket.on('TaskletCycles', function (data) {
        //add security check that the computation is really a number
        var computation = data.computation;
        var cost;
        var price;
        var confirmation = true;
        var difference;
        dbAccess.find({type: constants.Accounting, taskletid: data.taskletid}).exec(function (e, res) {
            dbAccess.find({type: constants.User, username: res.provider}).exec(function (e, udata) {
               
                price = udata.price;
				
                cost = parseInt(computation) * price;
                console.log('computation  ' + computation);
                console.log('cost ' + cost);
                difference = res.coins - cost;

                var accTransaction = new accountingTransaction({
                    consumer: res.consumer,
                    provider: res.provider,
                    computation: computation,
                    coins: cost,
                    status: constants.AccountingStatusComputed,
                    taskletid: res.taskletid
                });
                accTransaction.update();

                //calculates the difference between the blocked coins and the real cost
                // function call to the e updatebalanc function outside
                UpdateBalance(difference, res.consumer);

                io.sockets.emit('TaskletCyclesCoinsBlocked', {
                    consumer: res.consumer,
                    provider: res.provider,
                    taskletid: res.taskletid,
                    confirmation: confirmation,
                    computation: computation,
                    coins: cost,
                    status: constants.AccountingStatusComputed
                });
            });
        });
    });

    // Step 16: Receiving the Tasklet result confirmation
    socket.on('TaskletResultConfirm', function (data) {
        var computation = data.computation;
        // Step 17: Releasing the blocked coins
        dbAccess.find({type: constants.Accounting, taskletid: data.taskletid}).exec(function (e, res) {
            var accTransaction = new accountingTransaction({
                consumer: res.consumer,
                provider: res.provider,
                computation: res.computation,
                coins: res.coins,
                status: constants.AccountingStatusConfirmed,
                taskletid: res.taskletid
            });
            accTransaction.update();

            UpdateBalance(res.coins, res.provider);
            console.log('Tasklet ' + res.taskletid + ' confirmed!');
        })
    });

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

// Connect to broker
var socket_c = require('socket.io-client')('http://' + conf.broker.ip + ':' + conf.broker.port);

socket_c.emit('event', {connection: 'I want to connect'});

// Step 5: Finding and sending friends information for Broker
socket_c.on('SFInformation', function (data) {
    var username = data.name;
    var taskletid = data.taskletid;
    var cost = data.cost;
    var reliability = data.reliability;
    var speed = data.speed;
    var qoc_privacy = data.privacy;

    logic.find({type: constants.PotentialProvider, username: username, privacy: qoc_privacy}, function (res) {
        //builds the string that will be sent via socket.emit
        var response = '{ \"name\": \"' + username + '\", \"taskletid\": \"' + taskletid + '\", \"cost\": \"' + cost + '\", \"reliability\": \"' + reliability + '\", \"speed\": \"' + speed + '\", \"potentialprovider\": ' + res + '}';
        socket_c.emit('SFInformation', JSON.parse(response.toString()));
    });
});
;

// Step 7: Receiving provider and consumer informations from Broker
socket_c.on('ProviderConsumerInformation', function (data) {
    var accTransaction = new accountingTransaction({
        consumer: data.consumer,
        provider: data.provider,
        computation: 0,
        coins: data.coins,
        status: constants.AccountingStatusBlocked,
        taskletid: data.taskletid
    });
    accTransaction.save();

    socket_c.emit('ProviderConsumerInformation', {
        consumer: data.consumer,
        provider: data.provider,
        taskletid: data.taskletid,
        success: true,
        coins: data.coins,
        status: constants.AccountingStatusBlocked
    });
    dbAccess.find({type: constants.User, username: data.consumer}).exec(function (e, res) {
        console.log("Result: " + res);
        var old_balance = parseInt(res.balance);
        var new_balance = old_balance - data.coins;
        console.log("Old:" + old_balance);
        console.log("Change:" + data.coins);
        var user_balance = new user({
            username: res.username,
            balance: new_balance,
        });
        console.log(new_balance);
        user_balance.update();
    });

});

socket_c.on('CheckBalance', function (data) {
    var username = data.name;
    var name = data.name;
    var taskletid = data.taskletid;
    var cost = data.cost;
    var privacy = data.privacy;
    var speed = data.speed;
    var reliability = data.reliability;
    dbAccess.find({type: constants.User, username: username}).exec(function (e, data) {
        var balance = data.balance;
        console.log(balance);
        socket_c.emit('CheckBalance', {
            balance: balance,
            zeit: new Date(),
            name: name,
            taskletid: taskletid,
            cost: cost,
            privacy: privacy,
            speed: speed,
            reliability: reliability

        });
    });
});

function UpdateBalance(difference, username) {
    dbAccess.find({type: constants.User, username: username}).exec(function (e, data) {
        var balance = data.balance;
        balance = balance + difference;
        var userb = new user({
            username: username,
            balance: balance,
        });
        userb.update();
    });
};