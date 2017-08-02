var express = require('express');
var router = express.Router();
var dbAccess = require('./dbAccess');
var constants = require('../constants');
var logic = require('./logic');
var uuidV1 = require('uuid/v1');

var friendshipTransaction   = require('../classes/FriendshipTransaction');
var coinTransaction         = require('../classes/CoinTransaction');
var User                    = require('../models/Users.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET friend transactions. */
router.get('/friendship', loggedIn, function(req, res, next) {
    var username = req.user.username;
    if(req.query.all == 'X') {
        dbAccess.find({type: constants.Friendship}).exec(function (e, data) {
            if (e) return next(e);
            res.json(data);
        })
    }
    //when finding only the friendships related to a specific user
 //***  else if (req.query.Network == 'Network'){
 //***   dbAccess.find({type: constants.Friendship, username: username, Network: 'Network'}).exec(function (e, data) {
 //***              if (e) return next(e);
 //***              res.json(data);
 //***          })
 //***  }
  else{
        dbAccess.find({type: constants.Friendship, username: username }).exec(function (e, data) {
            if (e) return next(e);
            res.json(data);
        })
    }
});

/* GET users. */
router.get('/user', loggedIn, function(req, res, next) {
  var username = req.user.username;
    if(req.query.all == 'X') {
        dbAccess.find({type: constants.User}).exec(function (e, data) {
            if(e) return next(e);
            var result = JSON.parse('[' + JSON.stringify(data) + ']');
            res.json(result);
        })
    }
    else{
     dbAccess.find({type: constants.User, username: username}).exec(function (e, data) {
                if(e) return next(e);
                var result = JSON.parse('[' + JSON.stringify(data) + ']');
                res.json(result);
            }
//**********        res.json(req.user);
    }
});

/* GET devices. */
router.get('/devices', loggedIn, function(req, res, next) {

    var user = req.user.user;
    var device = req.user.device;
    var x = req.body.x;

        dbAccess.find({type: constants.Device, ID: ID}).exec(function (e, data) {
            if (e) return next(e);
            res.json(data);
        })
});

/// Post
/* POST /Friend Transaction */
router.post('/friendship', loggedIn, function(req, res, next) {
    var id = uuidV1();
    var friendTransaction = new friendshipTransaction({ID: id, user_1: req.user.user_1, user_2: req.body.req.user.user_2});
    friendTransaction.save(function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

router.post('/user', function(req, res) {
   var user = new user({username: req.body.username, price: req.body.price, version: 0});
   user.save(function (err, post) {
     if (err) return next(err);
     res.json(post);
     });
});

router.get('/download', loggedIn, function (req, res, next) {
    var filePath = "../SFBroker/download/Executable.zip";
    res.download(filePath);
});


module.exports = router;