var express = require('express');
var router = express.Router();
var conf = require('../config.json');
var constants = require('../constants');

var socket = require('socket.io-client')('http://localhost:' + conf.ports.sfbroker_socket);

// websocket
socket.on('connection', function () {
    // socket connected
});

socket.on('SFConnection', function () {
    console.log("Connected");
});

var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

/* GET Transactionlist page. */
router.get('/transactionlistAcc', function(req, res) {
    socket.emit('SFRead_Acc', {});

    socket.on('SFRead_Acc', function (docs) {
        // socket connected
        console.log(docs);
        res.render('transactionlistAcc', {
            "transactionlistAcc" : docs
        });
    });

});

/* GET Transactionlist page. */
router.get('/transactionlistFriend', function(req, res) {
    socket.emit('SFRead_Friend', {});

    socket.on('SFRead_Friend', function (docs) {
        // socket connected
        res.render('transactionlistFriend', {
            "transactionlistFriend" : docs
        });
    });
});

/* GET Transactionlist page. */
router.get('/transactionlistUser', function(req, res) {
    socket.emit('SFRead_User'
        //, { userid: '8080' }
        );

    socket.on('SFRead_User', function (docs) {
        // socket connected
        console.log(docs);
        res.render('transactionlistUser', {
            "transactionlistUser" : docs
        });
    });
});


router.get('/transactionlistNetwork', function(req, res) {
    socket.emit('SFB_User_ID_Info', {userid: '8080'});

    socket.on('SFB_User_ID_Info', function (docs) {
        // socket connected
        console.log(docs);

    });
});

router.get('/transactionlistAccounting', function(req, res) {
    socket.emit('SFBUserTransactions', {userid: '8080'});

    socket.on('SFBUserTransactions', function (docs) {
        // socket connected
        console.log(docs);

    });
});


router.get('/coin_request', function(req, res) {
    socket.emit('Requested_Coins');
});


/* GET New Transaction page. */
router.get('/newtransaction', function(req, res) {
    res.render('newtransaction', { title: 'Add New Transaction' });
});

/* POST to Add Transaction Service */
router.post('/addtransaction_Acc', function(req, res) {

    // Get our form values. These rely on the "name" attributes
    var transactionBuyer = req.body.buyer;
    var transactionSeller = req.body.seller;
    var transactionComputation = req.body.computation;
    var transactionCoins = req.body.coins;
    var transactionStatus = req.body.status;
    var transactionTaskletID = req.body.tasklet_id;
    socket.emit('SFWrite_Acc', {type: constants.Accounting, consumer: transactionBuyer, provider: transactionSeller, computation: transactionComputation, coins: transactionCoins, status: transactionStatus, taskletid: transactionTaskletID });
    res.redirect("transactionlistAcc");
});

/* POST to Add Transaction Service */
router.post('/addtransaction_Friend', function(req, res) {

    var transactionUser_1 = req.body.user_1;
    var transactionUser_2 = req.body.user_2;
    var transactionStatus = req.body.status;

    socket.emit('SFWrite_Friend', {type: constants.Friendship, user_1: transactionUser_1, user_2: transactionUser_2, status: transactionStatus });
    res.redirect("transactionlistFriend");
});

/* POST to Add Transaction Service */
router.post('/addUser', function(req, res) {

    var transactionUserid = req.body.userid;
    var transactionPassword = req.body.password;
    var transactionPrice = req.body.price;
    var transactionEmail = req.body.email;
    var transactionFirstname = req.body.firstname;
    var transactionLastname = req.body.lastname;

    socket.emit('SFWrite_User', {
        type: constants.User,
        userid: transactionUserid,
        password: transactionPassword,
        price: transactionPrice,
        email: transactionEmail,
        firstname: transactionFirstname,
        lastname: transactionLastname,
    });
    res.redirect("transactionlistUser");
});

module.exports = router;
