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
        var friendTransaction = new friendshipTransaction(data);
        friendTransaction.save();
    });

    socket.on('SFRead_Friend', function (data) {
        dbAccess.find({ type: constants.Friendship }).exec(function(e, data) {
            socket.emit('SFRead_Friend', data);
        })
    });

    socket.on('TaskletCalculated', function (data){

    })
    // Step 11: Tasklet finished + Tasklet cycles known
    socket.on('TaskletCycles', function(data){
        var computation = data.computation;
        dbAccess.find({ type: constants.Accounting, taskletid: data.taskletid }).exec(function(e, res) {
            var accTransaction = new accountingTransaction({buyer: res.buyer, seller: res.seller, computation: computation, coins: computation, status: constants.AccountingStatusComputed, taskletid: res.taskletid});
            accTransaction.update();
            socket.emit('TaskletCyclesMoneyBlocked', res);
        })
    });


    socket.on('TaskletResultConfirm', function(data){
        var computation = data.computation;
        dbAccess.find({ type: constants.Accounting, taskletid: data.taskletid }).exec(function(e, res) {
            var accTransaction = new accountingTransaction({buyer: res.buyer, seller: res.seller, computation: res.computation, coins: res.coins, status: constants.AccountingStatusConfirmed, taskletid: res.taskletid});
            accTransaction.update();
            console.log('Tasklet ' + res.taskletid + ' confirmed!');
        })
    });
});

//Data exchange Broker/ SFBroker

// Connect to broker
var socket_c = require('socket.io-client')('http://localhost:' + conf.ports.broker);

socket_c.emit('event', { name: 'ads', privacy: 'ase', cost: '123' });

// Step 3: Finding and sending friends information for Broker
socket_c.on('SFInformation', function(data){

    // further Logic for QoC needed! --> logic.js

    socket_c.emit('SFInformation', {name: data.name, taskletid: data.taskletid, potentialseller: [{ userid: '8081', price: '1'}, { userid: '8082', price: '2'}, { userid: '8083', price: '3'}, { userid: '8084', price: '4'}]});
});


// Step 5: Receiving Seller and Buyer informations from Broker
socket_c.on('SellerBuyerInformation', function(data){
    var accTransaction = new accountingTransaction({buyer: data.buyer, seller: data.seller, computation: '100', coins: '200', status: constants.AccountingStatusBlocked, taskletid: data.taskletid});
    accTransaction.save();
    socket_c.emit('SellerBuyerInformation', { success: true, buyer: data.buyer, seller: data.seller, status: constants.AccountingStatusBlocked, taskletid: data.taskletid});
});

