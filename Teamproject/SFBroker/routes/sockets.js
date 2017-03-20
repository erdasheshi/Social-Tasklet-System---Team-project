var express = require('express');
var _ = require('lodash');
var app = express();

// websocket
var server = require('http').createServer(app)
    ,   io = require('socket.io').listen(server)
    ,   conf = require('../config.json');

var dbAccess = require('./dbAccess');
var accountingTransaction = require('../classes/AccountingTransaction');
var friendshipTransaction = require('../classes/FriendshipTransaction');
var user = require('../classes/User');
var logic = require('./logic');

var constants = require('../constants');

server.listen(conf.ports.sfbroker_socket);

io.sockets.on('connection', function (socket) {
    // der Client ist verbunden
    socket.emit('SFConnection', { zeit: new Date(), text: 'Connected!' });

    socket.on('SFWrite_Acc', function (data) {
        var accTransaction = new accountingTransaction(data);
        accTransaction.save();
    });

    socket.on('SFRead_Acc', function (data) {
        dbAccess.find({ type: constants.Accounting }).exec(function(e, data) {
            socket.emit('SFRead_Acc', data);
        })
    });

    socket.on('SFWrite_Friend', function (data) {
        console.log(data);
        var friendTransaction = new friendshipTransaction(data);
        friendTransaction.save();
    });

    socket.on('SFRead_Friend', function (data) {
        dbAccess.find({ type: constants.Friendship }).exec(function(e, data) {
            socket.emit('SFRead_Friend', data);
        })
    });

    socket.on('SFWrite_User', function (data) {
        console.log(data);
        var userSave = new user(data);
        userSave.save();
    });

    socket.on('SFRead_User', function (data) {
        try{
            dbAccess.find({ type: constants.User, userid: data.userid }).exec(function(e, data) {
                var result = JSON.parse('[' + JSON.stringify(data) + ']');
                socket.emit('SFRead_User', result);
            })
        }
        catch(e){
            if(e instanceof TypeError){
                dbAccess.find({ type: constants.User }).exec(function(e, data) {
                    socket.emit('SFRead_User', data);
                })
            }
        }
    });

    // Step 11: Tasklet finished + Tasklet cycles known
    socket.on('TaskletCycles', function(data){
        var computation = data.computation;
        dbAccess.find({ type: constants.Accounting, taskletid: data.taskletid }).exec(function(e, res) {
            var accTransaction = new accountingTransaction({consumer: res.consumer, provider: res.provider, computation: computation, coins: computation, status: constants.AccountingStatusComputed, taskletid: res.taskletid});
            accTransaction.update();
            socket.emit('TaskletCyclesCoinsBlocked', res);
        })
    });

	// Step 14: Receiving the Tasklet result confirmation
    socket.on('TaskletResultConfirm', function(data){
        var computation = data.computation;
		// Step 15: Releasing the blocked coins
        dbAccess.find({ type: constants.Accounting, taskletid: data.taskletid }).exec(function(e, res) {
            var accTransaction = new accountingTransaction({consumer: res.consumer, provider: res.provider, computation: res.computation, coins: res.coins, status: constants.AccountingStatusConfirmed, taskletid: res.taskletid});
            accTransaction.update();
            console.log('Tasklet ' + res.taskletid + ' confirmed!');
        })
    });
});

//Data exchange Broker/ SFBroker

// Connect to broker
var socket_c = require('socket.io-client')('http://localhost:' + conf.ports.broker);

socket_c.emit('event', {connection: 'I want to connect'});

// Step 3: Finding and sending friends information for Broker
socket_c.on('SFInformation', function(data){
    var userid = data.name;
    var taskletid = data.taskletid;
	var cost = data.cost;
	var reliability = data.reliability;
	var speed = data.speed;
    logic.findPotentialProvider(data, function(res){
        var response = '{ \"name\": \"' + userid + '\", \"taskletid\": \"' + taskletid + '\", \"cost\": \"' + cost + '\", \"reliability\": \"' + reliability + '\", \"speed\": \"' + speed + '\", \"potentialprovider\": ' + res + '}';
        socket_c.emit('SFInformation', JSON.parse(response.toString()));
    })

});;


// Step 5: Receiving provider and consumer informations from Broker
socket_c.on('ProviderConsumerInformation', function(data){
    var accTransaction = new accountingTransaction({consumer: data.consumer, provider: data.provider, computation: '100', coins: '200', status: constants.AccountingStatusBlocked, taskletid: data.taskletid});
    accTransaction.save();
    socket_c.emit('ProviderConsumerInformation', { success: true, consumer: data.consumer, provider: data.provider, status: constants.AccountingStatusBlocked, taskletid: data.taskletid});
});

