var express = require('express');
var router = express.Router();
var dbAccess = require('./dbAccess');
var constants = require('../constants');
var logic = require('./logic');
var uuidV1 = require('uuid/v1');

var accountingTransaction   = require('../classes/AccountingTransaction');
var friendshipTransaction   = require('../classes/FriendshipTransaction');
var coinTransaction         = require('../classes/CoinTransaction');

var passport = require('passport');

var User = require('../models/Users.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Acc transactions. */
router.get('/acctransaction', loggedIn, function(req, res, next) {
    console.log(req);
    dbAccess.find({type: constants.Accounting}).exec(function (e, data) {
        if(e) return next(e);
        res.json(data);
    })
});

/* GET friend transactions. */
router.get('/friendship', loggedIn, function(req, res, next) {
    dbAccess.find({type: constants.Friendship}).exec(function (e, data) {
        if(e) return next(e);
        res.json(data);
    })
});

/* GET users. */
router.get('/user', loggedIn, function(req, res, next) {

    if(typeof req.query.username == 'undefined'){
        dbAccess.find({type: constants.User}).exec(function (e, data) {
            if(e) return next(e);
            var result = JSON.parse('[' + JSON.stringify(data) + ']');
            res.json(result);
        })
    }
    else{
        dbAccess.find({type: constants.User}).exec(function (e, data) {
            if(e) return next(e);
            res.json(data);
        })
    }
});

/* GET sfbuserinfo. */
router.get('/sfbuserinfo', loggedIn, function(req, res, next) {

    var username = req.query.username;

    logic.find({type: constants.Friends, username: username}, function (res) {
        if(e) return next(e);
        var response = '{ \"username\": \"' + username + '\", \"Conections\": ' + res + '}';
        res.json(JSON.parse(response.toString()));
    });
});

/* GET sfbusertransactions. */
router.get('/sfbusertransactions', loggedIn, function(req, res, next) {

    var username = req.query.username;
    var balance;

    logic.find({type: constants.AllTransactions, username: username}, function (result) {
        logic.find({type: constants.User, username: username}, function (resp) {
            balance = resp.balance;
        });
        var response = '{ "username": "' + username + '", "Balance": ' + balance + '", "Transactions": [' + result + ']}';
        res.json(response.toString());
    });
});

/* GET requestedcoins. */
router.get('/requestedcoins', loggedIn, function(req, res, next) {

    var username = req.query.username;

    dbAccess.find({type: constants.CoinReq, username: username}).exec(function (e, data) {
        if(e) return next(e);
        res.json(data);
    })
});

/// Post
/* POST /Accounting Transaction */
router.post('/acctransaction', loggedIn, function(req, res, next) {
    var accTransaction = new accountingTransaction(req.body);
    accTransaction.save(function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* POST /Friend Transaction */
router.post('/friendship', loggedIn, function(req, res, next) {
    var friendTransaction = new friendshipTransaction(req.body);
    friendTransaction.save(function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/*POST /CoinRequest*/
router.post('/coinrequest', loggedIn, function(req, res, next) {
    var username = req.body.username;
    var requestedCoins = req.body.requestedCoins;
    console.log(req.body);
    var id = uuidV1();
    var approval = 'false';
    var coin_Transaction = new coinTransaction({requestid: id, username: username, requestedCoins: requestedCoins, approval: approval});
    coin_Transaction.save(function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

router.post('/register', function(req, res) {
    User.register(new User({    username: req.body.username,
                                email: req.body.email,
                                firstname: req.body.firstname,
                                lastname: req.body.lastname,
                                price: req.body.price,
                                balance: 100}),
        req.body.password, function(err, account) {
            if (err) {
                return res.status(500).json({
                    err: err
                });
            }
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json({
                    status: 'Registration successful!'
                });
            });
        });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            res.status(200).json({
                status: 'Login successful!'
            });
        });
    })(req, res, next);
});

router.get('/logout', loggedIn, function(req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

router.get('/download', loggedIn, function (req, res, next) {
    var filePath = "../SFBroker/download/test.txt";
    res.download(filePath);
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401).json({
            status: 'LogIn'
        });
    }
}

module.exports = router;