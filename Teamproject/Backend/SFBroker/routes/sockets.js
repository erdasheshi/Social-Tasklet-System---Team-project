var express = require('express');
var app = express();

// websocket
var server = require('http').createServer(app)
    ,   io = require('socket.io').listen(server)
    ,   conf = require('../config.json');

var dbAccess = require('./dbAccess')
var constants = require('../constants');

server.listen(conf.ports.sfbroker_socket);

io.sockets.on('connection', function (socket) {
    // der Client ist verbunden
    socket.emit('SFConnection', { zeit: new Date(), text: 'Connected!' });

    socket.on('SFWrite_Acc', function (data) {
        dbAccess.save(data);
    });

    socket.on('SFRead_Acc', function (data) {
        dbAccess.find({ type: constants.Accounting }).exec(function(e, data){
            socket.emit('SFRead_Acc', data);
        })
    });

    socket.on('SFWrite_Friend', function (data) {
        dbAccess.save(data);
    });

    socket.on('SFRead_Friend', function (data) {
        dbAccess.find({ type: constants.Friendship }).exec(function(e, data) {
            socket.emit('SFRead_Friend', data);
        })
    });

    socket.on('TaskletCalculated', function (data){

    })
});

//Data exchange Broker/ SFBroker

// Connect to broker
var socket_c = require('socket.io-client')('http://localhost:' + conf.ports.broker);

socket_c.emit('event', { name: 'ads', privacy: 'ase', cost: '123' });

// Add a connect listener
socket_c.on('event', function(socket) {
    console.log('Connected to Broker!');
});

socket_c.on('SFInformation', function(data){

    // further Logic for QoC needed! --> logic.js

    socket_c.emit('SFInformation', {name: data.name, taskletid: data.taskletid, potentialseller: ['User_1', 'User_2', 'User_3'] });
});

socket_c.on('SellerBuyer', function(data){

    dbAccess.save({type: constants.Accounting, buyer: data.buyer, seller: data.seller, computation: '100', coins: '200', status: costants.AccountingStatusBlocked, tasklet_id: data.taskletid }, function(err, data){
        socket_c.emit('SellerBuyer', { success: false, buyer: data.buyer, seller: data.seller, status: costants.AccountingStatusBlocked, tasklet_id: data.taskletid});
    })

    socket_c.emit('SellerBuyer', { success: true, buyer: data.buyer, seller: data.seller, status: costants.AccountingStatusBlocked, tasklet_id: data.taskletid});
});