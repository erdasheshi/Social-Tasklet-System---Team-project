//Socket calls from/to the frontend. The format feats to the requisites of  Postman

var express = require('express');
var router = express.Router();
var constants = require('../constants');
var logic = require('./logic');

var authService = require('./../service/authenticationService.js');
var downloadManager = require('./../service/downloadManager.js');

var accountingTransaction = require('../classes/AccountingTransaction');
var friendshipTransaction = require('../classes/FriendshipTransaction');
var coinTransaction = require('../classes/CoinTransaction');
var deviceAssignment = require('../classes/DeviceAssignments');
var user = require('../classes/User');
var replicationManager = require('./../replication/replicationManager');

var conf = require('../config.json');


/* Auth Service */
router.post('/login', function (req, res, next) {
    authService.login(req, res, next);
});

router.post('/register', function (req, res) {
    authService.register(req, res);
});

router.post('/logout', authService.loggedIn, function (req, res) {
    authService.logout(req, res);
});


/* GET Acc transactions. */              //get from the database all the tasklet transactions of the current user
router.get('/acctransaction', authService.loggedIn, function (req, res, next) {

    if (req.query.all == 'X') {
        accountingTransaction.findAll(function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    } else {
        accountingTransaction.findByUser({ username: req.user.username }, function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    }
});

/* GET friend transactions. */              //get from the database all the friendship relations of the current user
router.get('/friendship', authService.loggedIn, function (req, res, next) {
    if (req.query.all == 'X') {
        friendshipTransaction.findAll(function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    }
    else {
        logic.findFriendships({ username: req.user.username }, function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    }
});

/* GET users. */                    //get user's information
router.get('/user', authService.loggedIn, function (req, res, next) {
    var username = req.user.username;
    if (req.query.all == 'X') {
        user.findAll(function (e, data) {
            if (e) return next(e);
            var user_list = data;

            var i = 0;
            var existence = false;
            while (i < user_list.length && existence == false) {
                if (user_list[i].username == username) {
                    existence = true;
                    user_list.splice(i, 1);
                    existence = true;
                    res.json(user_list);
                }
                else {
                    i = i + 1;
                }
            }
        });
    }
    else {
        res.json(req.user);
    }
});

/* GET requestedcoins. */                   //get from the database all the coin requests of the current user
router.get('/requestedcoins', authService.loggedIn, function (req, res, next) {

    coinTransaction.findByUser({ username: req.user.username }, function (e, data) {
        if (e) return next(e);
        res.json(data);
    });
});

/* GET device. */                       //get from the database all the devices of the current user
router.get('/device', authService.loggedIn, function (req, res, next) {
    if (req.query.all == 'X') {
        deviceAssignment.findAll(function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    }
    else {
        deviceAssignment.findByUser({ username: req.user.username }, function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    }
});

//handled a device registration
router.get('/download', function (req, res, next) {
    var filePath = conf.sfbroker.download.source + '/TaskletMiddleware' + req.query.device + '.zip';
    res.download(filePath);
});

/****************************************************************************************************************************************************
 Post
 *****************************************************************************************************************************************************/

//********* just for testing purposes ***********//
router.post('/updates', authService.loggedIn, function (req, res, next) {
    var broker = req.body.broker;

    var result = replicationManager.updateBroker(broker);
    res.json(result);
});

/* POST /Accounting Transaction */          //create a tasklet transaction or update existing one
router.post('/acctransaction', authService.loggedIn, function (req, res, next) {
    var accTransaction = accountingTransaction.get(req.body);

    accTransaction.save(function (err, post) {
        if (err) return res.status(500).json({ err: 'Action not successful!' });
        res.json('Action successful!');
    });
});

/*POST /Friendship*/      ////create a new friendship or update existing one
router.post('/friendship', authService.loggedIn, function (req, res, next) {

    var friendship = friendshipTransaction.get({
        user_1: req.user.username,
        user_2: req.body.user,
        status: req.body.status
    });

    friendship.save(function (err, post) {
        if (err) return res.status(500).json({ err: 'Action not successful!' });
        res.json('Action successful!');
    });
});

/*POST /CoinRequest*/                   //create a new coin request
router.post('/coinrequest', authService.loggedIn, function (req, res, next) {

    var coin_Transaction = coinTransaction.get({
        username: req.user.username,
        requestedCoins: req.body.requestedCoins,
        approval: 'false'
    });
    coin_Transaction.save(function (err, post) {
        if (err) return res.status(500).json({ err: 'Action not successful!' });
        res.json('Coins successfully requested!');
    });
});

/*POST /Device*/                       //create a new device or update existing one
router.post('/device', authService.loggedIn, function (req, res, next) {

    var device = deviceAssignment.get({
        name: req.body.name,
        device: req.body.device,
        username: req.user.username,
        price: req.body.price
    });

    var download = req.body.download;

    device.save(function (err, data) {
        if (err) return next(err);
        var device = data.device;
        //If download was defined then provide the user with a download
        if (download) {
            downloadManager.provideDownload({ id: data.device, username: data.username }, function (err, data) {

                if (err) return res.status(500).json({ err: 'Action not successful!' });
                var response = 'http://' + conf.sfbroker.ip  + ':' + conf.sfbroker.port + '/download?device=' + device;

                res.json(response);
            });
        }
        else {
            res.json('Device successfully registered!');
        }
    });
});

/****************************************************************************************************************************************************
 Delete
 *****************************************************************************************************************************************************/

/*DELETE /Friendship*/                //delete a friendship relation from the database
router.delete('/friendship', authService.loggedIn, function (req, res, next) {
    var user_1 = req.user.username;
    var user_2 = req.query.user;

    friendshipTransaction.deleteByUsers({ user_1: user_1, user_2: user_2 }, function (err, data) {
        if (err) return res.status(500).json({ err: 'Deletion not possible!' });
        res.json('Successful deletion!');
    });
});

/*DELETE /Device*/                 //delete a device from the database
router.delete('/device', function (req, res, next) {
    var device = req.query.device;

    deviceAssignment.deleteByID({ device: device, username: req.user.username }, function (err, data) {
        if (err) return res.status(500).json({ err: 'Deletion not possible!' });
        res.json(' Device successfully deleted!');
    });
});

/*DELETE /user*/            //delete all entries related to this user (considering friendships, devices, coin requests, relations with brokers)
router.delete('/user', authService.loggedIn, function (req, res, next) {
    var username = req.user.username;

    user.deleteByUsername({ username: username }, function (err, data) {
        console.log("the callbacks worked");
        if (err) return res.status(500).json({ err: 'Deletion not possible!' });
        res.json('User successfully deleted!');

    });
});

module.exports = router;
