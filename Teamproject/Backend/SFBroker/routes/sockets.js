var express = require('express');
var app = express();

// websocket
var server = require('http').createServer(app)
    ,   io = require('socket.io').listen(server)
    ,   conf = require('../config.json');

var mongoose = require('mongoose');
var Accountings = require("../models/Accountings");
var Friendships = require("../models/Friendships");
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

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

        // Get our form values. These rely on the "name" attributes
        var transactionBuyer = data.buyer;
        var transactionSeller = data.seller;
        var transactionComputation = data.computation;
        var transactionCoins = data.coins;
        var transactionStatus = data.status;
        var transactionTaskletID = data.tasklet_id;

        var transaction = new Models.Accounting({ //You're entering a new transaction here
            Buyer: transactionBuyer,
            Seller: transactionSeller,
            Computation: transactionComputation,
            Coins: transactionCoins,
            Status: transactionStatus,
            Tasklet_ID: transactionTaskletID
        });

        transaction.save(function(error) { //This saves the information you see within that Acounting declaration (lines 4-6).
            if (error) {
                console.error(error);
            }
        });
    });

    socket.on('SFRead_Acc', function (data) {

        var accounting = mongoose.model("Accounting", Accountings.accountingSchema);

        accounting.find({},{},function(e,docs){
                socket.emit('SFRead_Acc', docs);
        });
    });

    socket.on('SFWrite_Friend', function (data) {

        // Get our form values. These rely on the "name" attributes
        var transactionUser_1 = data.user_1;
        var transactionUser_2 = data.user_2;
        var transactionStatus = data.status;


        var transaction = new Models.Friendship({ //You're entering a new transaction here
            User_1: transactionUser_1,
            User_2: transactionUser_2,
            Status: transactionStatus
        });

        transaction.save(function(error) { //This saves the information you see within that Acounting declaration (lines 4-6).
            if (error) {
                console.error(error);
            }
        });
    });

    socket.on('SFRead_Friend', function (data) {

        var friendship = mongoose.model("Friendship", Friendships.friendshipSchema);

        friendship.find({},{},function(e,docs){
            socket.emit('SFRead_Friend', docs);
        });
    });
});