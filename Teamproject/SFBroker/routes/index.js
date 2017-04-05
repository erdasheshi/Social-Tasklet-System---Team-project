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

    if(typeof req.query.userid == 'undefined'){
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

    var userid = req.query.userid;

    logic.find({type: constants.Friends, userid: userid}, function (res) {
        if(e) return next(e);
        var response = '{ \"userid\": \"' + userid + '\", \"Conections\": ' + res + '}';
        res.json(JSON.parse(response.toString()));
    });
});

/* GET sfbusertransactions. */
router.get('/sfbusertransactions', loggedIn, function(req, res, next) {

    var userid = req.query.userid;
    var balance;

    logic.find({type: constants.AllTransactions, userid: userid}, function (result) {
        logic.find({type: constants.User, userid: userid}, function (resp) {
            balance = resp.balance;
        });
        var response = '{ "userid": "' + userid + '", "Balance": ' + balance + '", "Transactions": [' + result + ']}';
        res.json(response.toString());
    });
});

/* GET requestedcoins. */
router.get('/requestedcoins', loggedIn, function(req, res, next) {

    var userid = req.query.userid;

    dbAccess.find({type: constants.CoinReq, userid: userid}).exec(function (e, data) {
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
    var userid = req.body.userid;
    var requestedCoins = req.body.requestedCoins;
    console.log(req.body);
    var id = uuidV1();
    var approval = 'false';
    var coin_Transaction = new coinTransaction({requestid: id, userid: userid, requestedCoins: requestedCoins, approval: approval});
    coin_Transaction.save(function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

router.post('/register', function(req, res) {
    User.register(new User({    username: req.body.username,
                                email: req.body.email,
                                firstname: req.body.firstname,
                                lastname: req.body.lastname }),
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