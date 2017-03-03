var express = require('express');
var app = express();

// websocket
var server = require('http').createServer(app)
    ,   io = require('socket.io').listen(server)
    ,   conf = require('../config.json');

var mongoose = require('mongoose');
var Accountings = require("../models/Accountings");
var Friendships = require("../models/Friendships");
var dbAccess = require('./dbAccess')

server.listen(conf.ports.sfbroker_socket);

io.sockets.on('connection', function (socket) {
    // der Client ist verbunden
    socket.emit('SFConnection', { zeit: new Date(), text: 'Connected!' });
    // wenn ein Benutzer einen Text senden
    socket.on('SFBRead', function (data) {
        // so wird dieser Text an alle anderen Benutzer gesendet

        var accounting = mongoose.model("Accounting", Accountings.accountingSchema);

        accounting.find({},{},function(e,docs){
            io.sockets.emit('SFBRead', docs);
        });
    });

    socket.on('SFWrite_Acc', function (data) {

        dbAccess.save(data);
    });

    socket.on('SFRead_Acc', function (data) {

        console.log('SFRead_Acc');
        var accounting = mongoose.model("Accounting", Accountings.accountingSchema);

        accounting.find({},{},function(e,docs){
                socket.emit('SFRead_Acc', docs);
        });
    });

    socket.on('SFWrite_Friend', function (data) {
        dbAccess.save(data);
    });

    socket.on('SFRead_Friend', function (data) {

        var friendship = mongoose.model("Friendship", Friendships.friendshipSchema);

        friendship.find({},{},function(e,docs){
            socket.emit('SFRead_Friend', docs);
        });
    });
});

//Data exchange Broker/ SFBroker

// Connect to broker
var socket_c = require('socket.io-client')('http://localhost:' + conf.ports.broker);

// Add a connect listener
socket_c.on('event', function(socket) {
    console.log('Connected to Broker!');
});

socket_c.emit('event', { name: 'ads', privacy: 'ase', cost: '123' });

socket_c.on("SFSelected", function(data){

});