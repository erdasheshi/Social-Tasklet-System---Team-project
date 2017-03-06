var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

var mongoose = require('mongoose');
var Accountings = require("../models/Accountings");
var Friendships = require("../models/Friendships");

function findAccounting(data){
    var accounting = mongoose.model("Accounting", Accountings.accountingSchema);
    if(typeof data.taskletid == 'undefined'){
        var result = accounting.find({}, {});
    }else{
        var result = accounting.findOne({ Tasklet_ID : data.taskletid });
    }
    return result
}

function findFriendship(data){
    var friendship = mongoose.model("Friendship", Friendships.friendshipSchema);
    var result = friendship.find({}, {});
    return result
}

module.exports = {
    find: function (data) {
        if (data.type == constants.Accounting) {
            return findAccounting(data);
        }else if (data.type == constants.Friendship) {
            return findFriendship(data);
        }
    }
};