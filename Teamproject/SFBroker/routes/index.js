//Socket calls from/to the frontend. The format feats to the requisites of  Postman

var express    = require('express');
var router     = express.Router();
var dbAccess   = require('./dbAccess');  //*** This is should not be required here
var constants  = require('../constants');
var logic      = require('./logic');
var uuidV1     = require('uuid/v1');


var passport = require('passport');
var User = require('../models/Users.js');

var accountingTransaction   = require('../classes/AccountingTransaction');
var friendshipTransaction   = require('../classes/FriendshipTransaction');
var brokerTransaction       = require('../classes/Broker');
var coinTransaction         = require('../classes/CoinTransaction');
var deviceAssignment        = require('../classes/DeviceAssignments');

                                      //********************** everything is tested ***************//
/****************************************************************************************************************************************************
                                                             GET
*****************************************************************************************************************************************************/
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Acc transactions. */
router.get('/acctransaction', loggedIn, function(req, res, next) {
    if(req.query.all == 'X') {
        dbAccess.find({type: constants.Accounting}).exec(function (e, data) {
        if (e) return next(e);
        res.json(data); })
    }else{
        dbAccess.find({type: constants.Accounting, username: req.user.username}).exec(function (e, data) {
        if (e) return next(e);
        res.json(data); })
        }
});

/* GET friend transactions. */
router.get('/friendship', loggedIn, function(req, res, next) {
    var username = req.user.username;
    if(req.query.all == 'X') {
        dbAccess.find({type: constants.Friendship, key: 'All'}).exec(function (e, data) {
            if (e) return next(e);
            res.json(data);
        });
    }
    else{
        dbAccess.find({type: constants.Friendship, key: 'Network', username: username }).exec(function (e, data) {
            if (e) return next(e);
            var response = '{ "username": "' + username + '", "connections": ' + data + '}';
            res.json(JSON.parse(response.toString()));
            res.json(data);
        });
    }
});

/* GET users. */
router.get('/user', loggedIn, function(req, res, next) {
    if(req.query.all == 'X') {
        dbAccess.find({type: constants.User}).exec(function (e, data) {
            if(e) return next(e);
                  var result = JSON.parse('[' + JSON.stringify(data) + ']');
                  res.json(result); })
    }       else{ res.json(req.user); }
});

/* GET sfbuserinfo. */
router.get('/sfbuserinfo', loggedIn, function(req, res, next) {
    var username = req.user.username;
    logic.find({type: constants.Friends, username: username, key: 'Network'}, function (e, data) {
        if(e) return next(e);
        var response = '{ "username": "' + username + '", "connections": ' + data + '}';
        res.json(JSON.parse(response.toString()));
    });
});

/* GET sfbusertransactions. */
router.get('/sfbusertransactions', loggedIn, function(req, res, next) {
    var username = req.user.username;
    logic.find({type: constants.AllTransactions, username: username}, function (e, result) {
        if(e) return next(e);
        var fin_result = result;
        dbAccess.find({type: constants.User, username: username}).exec(function (e, data) {
            if(e) return next(e);
            var response = '{ "username": "' + username + '", "balance": ' + data.balance + ', "transactions": ' + fin_result + '}';
            res.json(JSON.parse(response.toString()));
        });
    });
});

/* GET requestedcoins. */
router.get('/requestedcoins', loggedIn, function(req, res, next) {
    var username = req.user.username;
    var x = req.body.x;
        dbAccess.find({type: constants.CoinReq, username: username}).exec(function (e, data) {
            if (e) return next(e);
            res.json(data);
        })
    /* dbAccess.find({type: constants.CoinReq}).exec(function (e, data) {
            if (e) return next(e);
            res.json(data);
        }) */
});

/* GET device. */
router.get('/device', loggedIn, function(req, res, next) {
  var username = req.user.username;
    if(req.query.all == 'X') {
        dbAccess.find({type: constants.Device}).exec(function (e, data) {
            if(e) return next(e);
            var result = JSON.parse('[' + JSON.stringify(data) + ']');
            res.json(result);
        })
    }
    else{  dbAccess.find({type: constants.Device, username: username}).exec(function (e, data) {
                    if(e) return next(e);
                    res.json(data);
                })
    }
});

router.get('/logout', loggedIn, function(req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

//***
//*** update based on how will be handled a device registration
//***
router.get('/download', loggedIn, function (req, res, next) {
    var filePath = "../SFBroker/download/Executable.zip";
    res.download(filePath);
});
                                       //********************** everything is tested ***************//
/****************************************************************************************************************************************************
                                                             Post
*****************************************************************************************************************************************************/

/* POST /Accounting Transaction */
router.post('/acctransaction', loggedIn, function(req, res, next) {
    var accTransaction = new accountingTransaction(req.body, function (e) {
        if (e) return next(e);
        accTransaction.save(function (err, post) {
            if (err) return next(err);
            res.json(post);
        });
    });
});

//********* just for testing purposes ***********// ---- DEPRECATED ----
router.post('/broker', loggedIn, function(req, res, next) {
    var username = req.body.username;
    var broker = req.body.broker;

    var broker = new brokerTransaction({         username: username,
                                                 broker:   broker });
    broker.save(function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});


//********* just for testing purposes ***********//
router.post('/updates', loggedIn, function(req, res, next) {
    var broker = req.body.broker;

    var result = logic.updateBroker(broker);
        res.json(result);
});


/*POST /Friendship*/      //making the check, if it's an update or a new transaction in the backend, is unnecessarily expensive... create two different api for each
 router.post('/friendship', loggedIn, function(req, res, next) {
     var username = req.user.username;
     var user_2 = req.body.name;
     var status = req.body.status;
       console.log("the status" + status);
     var id;
      if (req.body.id == 'undefined')
          { id = uuidV1(); }
      else { id = req.body.id;
      }

     var friendship = new friendshipTransaction ({ ID:     id,
                                                   user_1: username,
                                                   user_2: user_2,
                                                   status: status  });
    friendship.save(function (err, post) {
         if (err) return next(err);
         res.json(post);
     });
    //Store in the log the deleted or confirmed friendships
    if (status == 'Confirmed' || status == 'Deleted'){
    console.log("11111111111111");
    var key = 'friendship';
    logic. CollectUpdates(req, id, key);
     }
     });

/*POST /CoinRequest*/
router.post('/coinrequest', loggedIn, function(req, res, next) {
    var username = req.user.username;
    var requestedCoins = req.body.requestedCoins;
    console.log(req.body);
    var id = uuidV1();
    var approval = 'false';
    var coin_Transaction = new coinTransaction({ requestid:      id,
                                                 username:       username,
                                                 requestedCoins: requestedCoins,
                                                 approval:       approval });
    coin_Transaction.save(function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/*POST /Device*/
router.post('/device', loggedIn, function(req, res, next) {
     var username = req.user.username;
     var name = req.body.name;
     var price = req.body.price;
     var device = uuidV1();
     var status = 'inactive';
     var device = new deviceAssignment({ name:     name,
                                         username: username,
                                         device:   device,
                                         status:   status,
                                         price:    price });
    device.save(function (err, post) {
                 if (err) return next(err);
                 res.json(post);
             });
    //Store in the log the added device
    var key = 'device';
    logic. CollectUpdates(req, device, key);
     });


router.post('/register', function(req, res) {
    User.register(new User({    username:  req.body.username,
                                email:     req.body.email,
                                firstname: req.body.firstname,
                                lastname:  req.body.lastname,
                                password:  req.body.password,
                                balance:   100  }),
        req.body.password, function(err, account) {
            if (err) {
                return res.status(500).json({
                    err: err
                });
            }
            var broker = new brokerTransaction({    username: req.body.username,
                                                    broker:   5 });
            broker.save(function (err, post) {
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
                return res.status(300).json({
                    err: 'Could not log in user'
                });
            }
            res.status(200).json({
                status: 'Login successful!'
            });
        });
    })(req, res, next);
});
                                               //********************** everything is tested ***************//
/****************************************************************************************************************************************************
                                                             Delete
*****************************************************************************************************************************************************/

/*DELETE /Friendship*/
router.delete('/friendship', loggedIn, function(req, res, next) {
    var username = req.user.username;
    var user_2 = req.body.name;
    var key = 'Friendship';
    var id = req.body.id;

    dbAccess.remove({type: constants.Friendship, user_1: username, user_2: user_2, key: key });
    res.json('true');  //needs to catch the response of the function  call

    if (status == 'Deleted'){
    var x = 'd_friendship';
    logic. CollectUpdates(req, id, x);
     }
});

/*DELETE /user*/
router.delete('/user', loggedIn, function(req, res, next) {
    var username = req.user.username;
    dbAccess.remove({type: constants.User, username: username});
    res.json('true');  //change it: needs to catch the response of the function  call
});

/*DELETE /Device*/
router.delete('/device', loggedIn, function(req, res, next) {
    var device = req.body.device;
    var key = 'Device';

    dbAccess.remove({type: constants.Device, device: device, key: key });
    res.json('true');  //change it: needs to catch the response of the function  call

    //Store in the log the added device
    var log_key = 'd_device';
    logic.CollectUpdates(req, device, log_key);
});
                                                     //********************** everything is tested ***************//
/****************************************************************************************************************************************************
                                                             Update
*****************************************************************************************************************************************************/

/*POST /update_device*/
router.post('/update_device', loggedIn, function(req, res, next) {
     var username = req.user.username;
     var name = req.body.name;
     var device = req.body.device;
     var price = req.body.price;
     var status = req.body.status;

     var device = new deviceAssignment({ name:     name,
                                         username: username,
                                         device:   device,
                                         status:   status,
                                         price:    price });
    device.update(function (err, post) {
                 if (err) return next(err);
                 res.json(post);
             });
    //Store in the log the updated device
    var key = 'u_device';
    logic. CollectUpdates(req, device, key);
     });

function loggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.status(401).json({
            status: 'LogIn'
        });
    }
}
module.exports = router;
