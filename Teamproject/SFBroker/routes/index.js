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


/* GET Acc transactions. */
router.get('/acctransaction', authService.loggedIn, function (req, res, next) {

    if (req.query.all == 'X') {
        accountingTransaction.findAll(function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    } else {
        accountingTransaction.findByUser({username: req.user.username}, function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    }
});
/******************

 /* GET friend transactions. */
router.get('/friendship', authService.loggedIn, function (req, res, next) {
    if (req.query.all == 'X') {
        friendshipTransaction.findAll(function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    }
    else {
        friendshipTransaction.findNetwork({username: req.user.username}, function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    }
});

/* GET users. */
router.get('/user', authService.loggedIn, function (req, res, next) {
    if (req.query.all == 'X') {
        user.findAll(function (e, data) {
            if (e) return next(e);
            res.json(data);
        })
    }
    else {
        res.json(req.user);
    }
});


/** RECHECK following two calls */
/* GET sfbuserinfo. -- Same as friendship???? */
router.get('/sfbuserinfo', authService.loggedIn, function (req, res, next) {
    var username = req.user.username;
    logic.find({type: constants.Friends, username: username, key: 'Network'}, function (e, data) {
        if (e) return next(e);
        var response = '{ "username": "' + username + '", "connections": ' + data + '}';
        console.log(response);
        res.json(JSON.parse(response.toString()));
    });
});

/* GET sfbusertransactions.  Not used in the frontend yet???*/
router.get('/sfbusertransactions', authService.loggedIn, function (req, res, next) {
    var username = req.user.username;
    logic.find({type: constants.AllTransactions, username: username}, function (e, result) {
        if (e) return next(e);
        var fin_result = result;
        user.findByUser({username: username}), function (e, data) {
            if (e) return next(e);
            var response = '{ "username": "' + username + '", "balance": ' + data.balance + ', "transactions": ' + fin_result + '}';
            res.json(JSON.parse(response.toString()));
        });
    });
});


/* GET requestedcoins. */
router.get('/requestedcoins', authService.loggedIn, function (req, res, next) {

    coinTransaction.findByUser({username: req.user.username}, function (e, data) {
        if (e) return next(e);
        res.json(data);
    });
});

/* GET device. */
router.get('/device', authService.loggedIn, function (req, res, next) {

    if (req.query.all == 'X') {
        deviceAssignment.findAll(function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    }
    else {
        deviceAssignment.findByUser({username: req.user.username}, function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    }
});

//***
//*** update based on how will be handled a device registration
//***
router.get('/download', authService.loggedIn, function (req, res, next) {
    var filePath = "../SFBroker/download/Executable.zip";
    res.download(filePath);
});

/****************************************************************************************************************************************************
 Post
 *****************************************************************************************************************************************************/

//********* just for testing purposes ***********//
router.post('/updates', authService.loggedIn, function (req, res, next) {
    var broker = req.body.broker;

    var result = logic.updateBroker(broker);
    res.json(result);
});


/* POST /Accounting Transaction */
router.post('/acctransaction', authService.loggedIn, function (req, res, next) {
    var accTransaction = accountingTransaction.get(req.body);

    accTransaction.save(function (err, post) {
    if (err) return res.status(500).json( {err: 'Action not successful!'} );
    res.json('Action successful!');
    });
});

/*POST /Friendship*/      //making the check, if it's an update or a new transaction in the backend, is unnecessarily expensive... create two different api for each - ???
router.post('/friendship', authService.loggedIn, function (req, res, next) {

    var friendship = friendshipTransaction.get({
        user_1: req.user.username,
        user_2: req.body.user,
        status: req.body.status
    });

    friendship.save(function (err, post) {
    if (err) return res.status(500).json( {err: 'Action not successful!'} );
    res.json('Action successful!');
    });
});

/*POST /CoinRequest*/
router.post('/coinrequest', authService.loggedIn, function (req, res, next) {

    var coin_Transaction = coinTransaction.get({
        username: req.user.username,
        requestedCoins: req.body.requestedCoins,
        approval: 'false'
    });
    coin_Transaction.save(function (err, post) {
    if (err) return res.status(500).json( {err: 'Action not successful!'} );
    res.json('Coins successfully requested!');
    });
});

/*POST /Device*/
router.post('/device', authService.loggedIn, function (req, res, next) {

    var device = deviceAssignment.get({
        name: req.body.name,
        device: req.body.device,
        username: req.user.username,
        status: constants.DeviceStatusInactive,
        price: req.body.price
    });
    var id = device.device;

    var download = req.body.download;

    device.save(function (err, post) {
        if (err) return next(err);

        if (download) {
            downloadManager.provideDownload({id: id}, function (err, data) {
                if (err) return res.status(500).json({err: 'Action not successful!'} );
                res.download(data.destination);
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

/*DELETE /Friendship*/
router.delete('/friendship', authService.loggedIn, function (req, res, next) {
    var user_1 = req.user.username;
    var user_2 = req.query.user;

    friendshipTransaction.deleteByUsers({user_1: user_1, user_2: user_2}, function (err, data) {
      if (err) return res.status(500).json( {err : 'Deletion not possible!'} );
      res.json('Successful deletion!');
    });
});

/*DELETE /Device*/
router.delete('/device', authService.loggedIn, function (req, res, next) {
    var device = req.query.device;

    deviceAssignment.deleteByID({device: device, username: req.user.username}, function (err, data) {
       if (err) return res.status(500).json( {err : 'Deletion not possible!'} );
       res.json(' Device successfully deleted!');
    });
});

/*DELETE /user*/
router.delete('/user', authService.loggedIn, function (req, res, next) {
    var username = req.user.username;

    user.deleteByUsername({username: username}, function (err, data) {
      console.log("inside the function");
          if (err) return res.status(500).json( {err : 'Deletion not possible!'} );
          res.json('User successfully deleted!');
 });
 //   ***     authService.logout(req, res, function () {
 //   ***         user.deleteByUsername({username: username}, function (err, data) {
 //   ***         console.log("inside the function");
 //   ***             if (err) return next(err);
 //   ***             res.json('true');
 //   ***         });
 //   ***     });
});

module.exports = router;