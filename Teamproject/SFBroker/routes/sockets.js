var express = require('express')
, _ = require('lodash')
, app = express()
,	uuidV1 = require('uuid/v1');

// websocket
var server = require('http').createServer(app)
    , io = require('socket.io').listen(server)
    , conf = require('../config.json');

var dbAccess = require('./dbAccess');
var accountingTransaction = require('../classes/AccountingTransaction');
var friendshipTransaction = require('../classes/FriendshipTransaction');
var coinTransaction = require('../classes/CoinTransactions');

var user = require('../classes/User');
var logic = require('./logic');

var constants = require('../constants');

server.listen(conf.ports.sfbroker_socket);

io.sockets.on('connection', function (socket) {
    // der Client ist verbunden
    socket.emit('SFConnection', {zeit: new Date(), text: 'Connected!'});

    socket.on('SFWrite_Acc', function (data) {
        console.log(data);
        var accTransaction = new accountingTransaction(data);
        accTransaction.save();
    });

    socket.on('SFRead_Acc', function (data) {
        dbAccess.find({type: constants.Accounting}).exec(function (e, data) {
            socket.emit('SFRead_Acc', data);
        })
    });

    socket.on('SFWrite_Friend', function (data) {
        console.log(data);
        var friendTransaction = new friendshipTransaction(data);
        friendTransaction.save();
    });

    socket.on('SFRead_Friend', function (data) {
        dbAccess.find({type: constants.Friendship}).exec(function (e, data) {
            socket.emit('SFRead_Friend', data);
        })
    });

    socket.on('SFWrite_User', function (data) {
        var userSave = new user(data);
        userSave.save();
    });

    socket.on('SFRead_User', function (data) {
        try {
            dbAccess.find({type: constants.User, userid: data.userid}).exec(function (e, data) {
                var result = JSON.parse('[' + JSON.stringify(data) + ']');
                socket.emit('SFRead_User', result);
            })
        }
        catch (e) {
            if (e instanceof TypeError) {
                dbAccess.find({type: constants.User}).exec(function (e, data) {
                    socket.emit('SFRead_User', data);
                })
            }
        }
    });

    // Step 11: Tasklet finished + Tasklet cycles known
    socket.on('TaskletCycles', function (data) {
        var computation = data.computation;
        dbAccess.find({type: constants.Accounting, taskletid: data.taskletid}).exec(function (e, res) {
            var accTransaction = new accountingTransaction({
                consumer: res.consumer,
                provider: res.provider,
                computation: computation,
                coins: computation,
                status: constants.AccountingStatusComputed,
                taskletid: res.taskletid
            });
            accTransaction.update();
            socket.emit('TaskletCyclesCoinsBlocked', res);
        })
    });

    // Step 14: Receiving the Tasklet result confirmation
    socket.on('TaskletResultConfirm', function (data) {
        var computation = data.computation;
        // Step 15: Releasing the blocked coins
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
            console.log('Tasklet ' + res.taskletid + ' confirmed!');
        })
    });

    //Sending the list of friends and potential friends to the frontend
    socket.on('SFB_User_ID_Info', function (data) {

        var userid = data.userid;
        logic.find({type: constants.Friends, userid: userid}, function (res) {
            var response = '{ \"userid\": \"' + userid + '\", \"Conections\": ' + res + '}';
console.log(response);
            socket.emit('SFB_User_ID_Info', JSON.parse(response.toString()));
        });
    });

    //**********
    //Sending the list of transactions and the balance of the user
    socket.on('SFBUserTransactions', function (data) {

        var userid = data.userid;

        logic.find({type: constants.AllTransactions, userid: userid}, function (res) {
            var response = '{ \"userid\": \"' + userid + '\", \"Transactions:\": ' + res + '}';
            socket.emit('SFBUserTransactions', JSON.parse(response.toString()));
        });
        //***********
    });

    // Get coin requests and stores them in the database
    socket.on('Coin_request', function(data) {
    var userid = data.userid;
    var requestedCoins = data.requestedCoins;
    var id = uuidV1();
    var approval = 'false';

       var coin_Transaction = new coinTransaction({requestid: id, userid: userid, requestedCoins: requestedCoins, approval: approval});
        coin_Transaction.save();
        });

    //sending the coin requests to the front-end of the administrator
    socket.on('Requested_Coins', function (data) {
        var userid = data.userid;

        dbAccess.find({type: constants.CoinReq, userid: userid}).exec(function (e, data) {
            console.log(data);
            io.sockets.emit('Requested_Coins', data);
        })
    });

   //Store the request as approved and updates the balance for the user
    socket.on('CoinsApproval', function (data) {

      var userid   = data.userid;
      var coins    = parseInt( data.requestedCoins);
        new_balance = 0 ;

        console.log(data);
        var coinTr = new coinTransaction({
            requestid: data.requestid,
            approval: data.approval,
            userid: userid,
            requestedCoins: coins
        });
        coinTr.update();

        dbAccess.find({type: constants.User, userid: userid}).exec(function (e, data) {

            if (data.balance == undefined){
           var old_balance = 5;
               }
           else {
                var old_balance = parseInt(data.balance);
            }
            new_balance = coins + old_balance;

            var user_balance = new user({
                userid: data.userid,
                balance: new_balance,
            });

            console.log(new_balance);
            user_balance.update();

        });
           })

});
//Data exchange Broker/ SFBroker

// Connect to broker
var socket_c = require('socket.io-client')('http://localhost:' + conf.ports.broker);

socket_c.emit('event', {connection: 'I want to connect'});

// Step 3: Finding and sending friends information for Broker
socket_c.on('SFInformation', function (data) {
    var userid = data.name;
    var taskletid = data.taskletid;
    var cost = data.cost;
    var reliability = data.reliability;
    var speed = data.speed;
    var qoc_privacy = data.privacy;

    logic.find({type: constants.PotentialProvider, userid: userid, privacy: qoc_privacy}, function (res) {
        //builds the string that will be sent via socket.emit
        var response = '{ \"name\": \"' + userid + '\", \"taskletid\": \"' + taskletid + '\", \"cost\": \"' + cost + '\", \"reliability\": \"' + reliability + '\", \"speed\": \"' + speed + '\", \"potentialprovider\": ' + res + '}';
        console.log(response);
        socket_c.emit('SFInformation', JSON.parse(response.toString()));
    });

});
;


// Step 5: Receiving provider and consumer informations from Broker
socket_c.on('ProviderConsumerInformation', function (data) {
    var accTransaction = new accountingTransaction({
        consumer: data.consumer,
        provider: data.provider,
        computation: '100',
        coins: '200',
        status: constants.AccountingStatusBlocked,
        taskletid: data.taskletid
    });
    accTransaction.save();
    socket_c.emit('ProviderConsumerInformation', {
        success: true,
        consumer: data.consumer,
        provider: data.provider,
        status: constants.AccountingStatusBlocked,
        taskletid: data.taskletid
    });
});

