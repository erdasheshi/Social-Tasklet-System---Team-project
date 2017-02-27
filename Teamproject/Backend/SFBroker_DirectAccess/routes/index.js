var express = require('express');
var router = express.Router();
var conf = require('../config.json');

var socket = require('socket.io-client')('http://localhost:' + conf.port);

// websocket
socket.on('connection', function () {
    // socket connected
});

socket.on('SFConnection', function () {
    console.log("Connected");
});

var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

/* GET Transactionlist page. */
router.get('/transactionlist', function(req, res) {
    socket.emit('SFRead_Acc', {});

    socket.on('SFRead_Acc', function (docs) {
        // socket connected
        res.render('transactionlist', {
            "transactionlist" : docs
        });
    });
});

/* GET New Transaction page. */
router.get('/newtransaction', function(req, res) {
    res.render('newtransaction', { title: 'Add New Transaction' });
});

/* POST to Add Transaction Service */
router.post('/addtransaction', function(req, res) {

    // Get our form values. These rely on the "name" attributes
    //var transactionType = req.body.type;

    var transactionBuyer = req.body.buyer;
    var transactionSeller = req.body.seller;
    var transactionComputation = req.body.computation;
    var transactionCoins = req.body.coins;
    var transactionStatus = req.body.status;
    var transactionTaskletID = req.body.tasklet_id;

    socket.emit('SFWrite', { buyer: transactionBuyer, seller: transactionSeller, computation: transactionComputation, coins: transactionCoins, status: transactionStatus, tasklet_id: transactionTaskletID });
    res.redirect("transactionlist");
});

module.exports = router;
