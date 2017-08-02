var constants = require('../constants');
var mongoose = require('mongoose');

var Accountings  = require("../models/Accountings");
var Friendships  = require("../models/Friendships");
var Users        = require("../models/Users");
var Brokers        = require("../models/Brokers");
var Devices      = require("../models/Devices");
var CoinRequests = require("../models/CoinRequests");

var accounting = mongoose.model("Accounting", Accountings.accountingSchema);
var requests   = mongoose.model("Coins", CoinRequests.coinRequestSchema);
var friendship = mongoose.model("Friendship", Friendships.friendshipSchema);
var user = mongoose.model("users", Users.userSchema);
var broker = mongoose.model("brokers", Brokers.brokerSchema);
var device     = mongoose.model("Device", Devices.deviceSchema);


                           //********************** everything is tested ***************//
/***************************************************************************************************************************
                                                         Find
****************************************************************************************************************************/

//finding device transaction
function findDevice(data){
    var username = data.username;
    var result;
    if(typeof data.username == 'undefined'){
    result = device.find({}, {});
    }
    else {
    result = device.find({ 'username' : username });
    }
    return result;
}

function findAccounting(data){
    if(data.hasOwnProperty('username')){
        var result = accounting.find().or([{'consumer': data.username}, {'provider': data.username}]);
    } else if(typeof data.taskletid == 'undefined'){
        var result = accounting.find({}, {});
    } else{
        var result = accounting.findOne({ 'taskletid' : data.taskletid });
    }
    return result;
}

function findCoinReq(data){
    var username = data.username;
    var result;
    if (username == "") {
        result = requests.find({'approval': 'false'});   //returns only the not approved requests
    } else{
        result = requests.find({ 'username' : username });
    }
    return result;
}

function findFriendship(data)
{   var result;
    switch(data.key) {
        case 'Network':
            result = friendship.find().or([{'user_1': data.username}, {'user_2': data.username}]);
            break;
        case 'Updates':
        // in case we need to find the friendship changes performed during the day
        //not necessary at the moment
            break;
        case 'All':
            result = friendship.find();
            break;
        case 'Friends':
            result = friendship.find().where('status', constants.FriendshipStatusConfirmed).or([{'user_1': data.username}, {'user_2': data.username}]);
        break;
    }
    return result
}

function findUser(data){
    var result;
        if(typeof data.username == 'undefined'){
           result = user.find({}, {});
        }else{
           result = user.findOne({ 'username' : data.username });
        }
        return result
    }

//Finds to which broker is the user assigned to
function findBroker(data, callback) {
    var username = data.username;
    result = broker.findOne({ 'username' : username });
    if (result == null)
    { result = {'username': username, 'broker': 0}; }
    return result
}

/***************************************************************************************************************************
                                                         Delete
****************************************************************************************************************************/

//*** tested ***//
function removeDevice(data){
   switch(data.key) {
      case 'User':
            if (data.username != 'undefined')
            { device.remove({ 'username': data.username }, function(err, obj) { if (err) throw err; }) }
            break;
      case 'Device':
            if (data.Device != 'undefined')
            { device.remove({ 'device': data.device }, function(err, obj) { if (err) throw err; }) }
            break;
      default: ;
   }
}

function removeFriendship(data){
 console.log("call arrives" + data.id + "the id" + data.key + "the key" );
 var user_1 = data.user_1;
 var user_2 = data.user_2;
 var ID = data.id;

   switch(data.key) {
      case 'ID':            //*** might not be needed
            if (ID != 'undefined')
            { friendship.remove({ 'ID': ID }, function(err, obj) { if (err) throw err; }) }
            break;
      case 'Status':        //removing all the friendship transactions with the status = data.status.........not needed so far
            if (data.status == 'undefined')
            { friendship.remove({ 'status': data.status }, function(err, obj) { if (err) throw err; }) }
            break;
      case 'Friendship':
           if (user_1 != 'undefined' && user_2 != 'undefined')
           {
           friendship.remove({$or: [{ 'user_1': user_1, 'user_2': user_2 }, { 'user_2': user_1, 'user_1': user_2 }]},
           function(err, obj) { if (err) throw err; })
           }
           break;
      default: ;
   }
}

function removeUser(data){
var username = data.username;

if(typeof username != 'undefined'){
   user.remove({ 'username': data.username }, function(err, obj) { if (err) throw err; })
   friendship.remove({ 'user_1': username }, function(err, obj) { if (err) throw err; })
   friendship.remove({ 'user_2': username }, function(err, obj) { if (err) throw err; })
   device.remove({ 'username': username }, function(err, obj) { if (err) throw err; })
   coins.remove({ 'username': username }, function(err, obj) { if (err) throw err; })

   //*********** store the changes in the log.......yet to be done
  }
}

module.exports = {
    find: function(data) {
        if (data.type == constants.Accounting) {
            return findAccounting(data);
        }else if (data.type == constants.Friendship) {
            return findFriendship(data);
        }else if (data.type == constants.Device) {
            return findDevice(data);
        }else if (data.type == constants.Broker) {
            return findBroker(data);
        }else if (data.type == constants.User) {
            return findUser(data);
        }
        else if (data.type == constants.CoinReq) {
            return findCoinReq(data);
        }
    },
    remove: function(data) {
        if (data.type == constants.Friendship) {
           return removeFriendship(data);
       }else if (data.type == constants.User) {
           return removeUser(data);
       }else if (data.type == constants.Device){
           return removeDevice(data);
       }
    }
    }