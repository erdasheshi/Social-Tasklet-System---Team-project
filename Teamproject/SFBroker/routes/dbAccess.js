var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

var mongoose = require('mongoose');
var Accountings = require("../models/Accountings");
var Friendships = require("../models/Friendships");
var Users = require("../models/Users");

function findAccounting(data){
    var accounting = mongoose.model("Accounting", Accountings.accountingSchema);
    if(typeof data.taskletid == 'undefined'){
        var result = accounting.find({}, {});
    }else{
        var result = accounting.findOne({ 'taskletid' : data.taskletid });
    }
    return result
}


//*****
function findFriendship(data){
    var friendship = mongoose.model("Friendship", Friendships.friendshipSchema);
    var result = friendship.find({}, {});
    if (typeof data.userid == 'undefined') {
        var result = friendship.find({}, {});
    } else if(data.FriendshipStatus == 'Requested'){
        var result = friendship.find().where('status', constants.FriendshipStatusConfirmed).or('status', constants.FriendshipStatusRequested).or([{'user_1': data.userid}, {'user_2': data.userid}]);
    }
	
	else {
        var result = friendship.find().where('status', constants.FriendshipStatusConfirmed).or([{'user_1': data.userid}, {'user_2': data.userid}]);
    }
    return result
}
//*****


function findUser(data){
    var user = mongoose.model("User", Users.userSchema);
    if(typeof data.userid == 'undefined'){
        var result = user.find({}, {});
    }else{
        var result = user.findOne({ 'userid' : data.userid });
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
    }
};