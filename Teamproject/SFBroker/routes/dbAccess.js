var constants = require('../constants');

var mongoose = require('mongoose');
var Accountings = require("../models/Accountings");
var Friendships = require("../models/Friendships");
var Users = require("../models/Users");
var CoinRequests = require("../models/CoinRequests");

function findAccounting(data){
    var accounting = mongoose.model("Accounting", Accountings.accountingSchema);
    if(data.hasOwnProperty('username')){
        var result = accounting.find().or([{'consumer': data.username}, {'provider': data.username}]);
    } else if(typeof data.taskletid == 'undefined'){
        var result = accounting.find({}, {});
    } else{
        var result = accounting.findOne({ 'taskletid' : data.taskletid });
    }
    return result
}

function findCoinReq(data){
    var requests = mongoose.model("Coins", CoinRequests.coinRequestSchema);
    var username = data.username;
    if (username == "") {
        var result = requests.find({'approval': 'false'});   //returns only the not approved requests
    } else{
        var result = requests.find({ 'username' : data.username });
    }
    return result
}

function findFriendship(data){
    var friendship = mongoose.model("Friendship", Friendships.friendshipSchema);
    if (typeof data.username == 'undefined') {
        var result = friendship.find({}, {});
    } else if(data.FriendshipStatus == 'Network'){
        //its better to create two functions: 1 for the requested (user_1 = username) and the other for pending (ures_2 = username)
        //this way we send less data and the network load is less
        var result = friendship.find().or([{'status': constants.FriendshipStatusConfirmed}, {'status': constants.FriendshipStatusRequested}] ).or([{'user_1': data.username}, {'user_2': data.username}]);
    }
	else {
        var result = friendship.find().where('status', constants.FriendshipStatusConfirmed).or([{'user_1': data.username}, {'user_2': data.username}]);
    }
    return result
}

function findUser(data){
    var user = require('../models/Users.js');
    if(typeof data.username == 'undefined'){
        var result = user.find({}, {});
    }else{
        var result = user.findOne({ 'username' : data.username });
    }
    return result
}

module.exports = {
    find: function (data) {
        if (data.type == constants.Accounting) {
            return findAccounting(data);
        }else if (data.type == constants.Friendship) {
            return findFriendship(data);
        }else if (data.type == constants.User) {
            return findUser(data);
        }
        else if (data.type == constants.CoinReq) {
            return findCoinReq(data);
        }
    }
};