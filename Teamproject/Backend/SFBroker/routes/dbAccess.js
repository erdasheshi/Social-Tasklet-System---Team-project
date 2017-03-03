var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

var mongoose = require('mongoose');
var Accountings = require("../models/Accountings");
var Friendships = require("../models/Friendships");

function saveAccounting(data){
    // Get our form values. These rely on the "name" attributes
    var transactionBuyer = data.buyer;
    var transactionSeller = data.seller;
    var transactionComputation = data.computation;
    var transactionCoins = data.coins;
    var transactionStatus = data.status;
    var transactionTaskletID = data.tasklet_id;

    var transaction = new Models.Accounting({ //You're entering a new transaction here
        Buyer: transactionBuyer,
        Seller: transactionSeller,
        Computation: transactionComputation,
        Coins: transactionCoins,
        Status: transactionStatus,
        Tasklet_ID: transactionTaskletID
    });

    transaction.save(function(error) { //This saves the information you see within that Acounting declaration (lines 4-6).
        if (error) {
            console.error(error);
        }
    });
}

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
            console.error(error);
        }
    });
}

function findAccounting(data){
    var accounting = mongoose.model("Accounting", Accountings.accountingSchema);
    var result = accounting.find({}, {});
    return result;
}

function findFriendship(data){
    var friendship = mongoose.model("Friendship", Friendships.friendshipSchema);
    var result = friendship.find({}, {});
    return result;
}

module.exports = {
    save: function (data) {
        if(data.type == constants.Accounting) {
            saveAccounting(data);
        }else if (data.type == constants.Friendship) {
            saveFriendship(data);
        }
    },

    find: function (data) {
        if (data.type == constants.Accounting) {
            return findAccounting(data);
        }else if (data.type == constants.Friendship) {
            return findFriendship(data);
        }
    }
};