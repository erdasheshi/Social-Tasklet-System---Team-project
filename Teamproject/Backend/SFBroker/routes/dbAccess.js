var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

var mongoose = require('mongoose');
var Accountings = require("../models/Accountings");
var Friendships = require("../models/Friendships");

function saveFriendship(data){
    // Get our form values. These rely on the "name" attributes
    var transactionUser_1 = data.user_1;
    var transactionUser_2 = data.user_2;
    var transactionStatus = data.status;


    var transaction = new Models.Friendship({ //You're entering a new transaction here
        User_1: transactionUser_1,
        User_2: transactionUser_2,
        Status: transactionStatus
    });

    transaction.save(function(error) { //This saves the information you see within that Acounting declaration (lines 4-6).
        if (error) {
            return next(error);
        }
    });
}

function findAccounting(data){
    var accounting = mongoose.model("Accounting", Accountings.accountingSchema);
    var result = accounting.find({}, {});
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