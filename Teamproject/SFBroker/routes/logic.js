//the functions that are used in the APIs with the Broker
var constants = require('../constants');

var mongoose = require('mongoose');
var Friendships = require("../models/Friendships");
var accountingTransaction = require('../classes/AccountingTransaction');
var friendshipTransaction = require('../classes/FriendshipTransaction');
var devices = require('../classes/DeviceAssignments');

var user = require('../classes/User');

function findAllTransactions(user, callback) {
    var user = user.username;
    var transactionsProcessed = 0;
    var transactionList = '[';
    accountingTransaction.findByUser({ username: user }, function (e, res) {
        if (e) callback(e, null);
        res.forEach(function (data, index, array) {
            transactionList = transactionList.concat('{ "consumer": "' + data.consumer +
                '", "provider": "' + data.provider +
                '", "computation": ' + data.computation +
                ', "coins": ' + data.coins +
                ', "status": "' + data.status +
                '", "taskletid": "' + data.taskletid + '" }');
            transactionsProcessed += 1;
            if (transactionsProcessed == array.length) {
                transactionList = transactionList.concat(']');
                transactionList = transactionList.replace('}{', '},{');
                callback(null, transactionList);
            }
            else {
                transactionList = transactionList.replace('}{', '},{');
            }
        });
    });
}

function findFriendships(data, callback) {
console.log("in the findfriendship function");
    var F_List = '[';
    var user = data.username;
    var friend, status;
    var userProcessed = 0;
    friendshipTransaction.findNetwork({username: user}, function (e, res) {
        if (e) callback(e, null);
        
        if (res.length > 0) {
        res.forEach(function (data, index, array) {
            if (data.status == constants.FriendshipStatusRequested) {
                if (data.user_1 == user) {
                    friend = data.user_2;
                    status = constants.FriendshipStatusRequested;
                } else if (data.user_2 == user) {
                    friend = data.user_1;
                    status = constants.FriendshipStatusPending;
                }
            }
            else if (data.status == constants.FriendshipStatusConfirmed) {
                if (data.user_1 == user) {
                    friend = data.user_2;
                } else if (data.user_2 == user) {
                    friend = data.user_1;
                }
                status = data.status;
        }
            F_List = F_List.concat('{ "name": "' + friend + '", "status": "' + status + '"}');
            userProcessed += 1;
            if (userProcessed == array.length) {
                F_List = F_List.concat(']');
                F_List = F_List.replace('}{', '},{');
            }
            else{
                F_List = F_List.replace('}{', '},{');
            }
        });
        }
        else {
              F_List = F_List.concat(']');
        }
callback(null, F_List);
    });
    }

//update user's balance
function updateBalance(difference, username) {
    user.findByUser({ username: username}, function (e, data) {
        var balance = data.balance;

        if (isNaN(difference)){
            difference = 0; }
        balance = balance + difference;
          var userb = user.get({
            username: username,
            balance: balance,
          });
          userb.save(function (err, post) {
              if (err) return next(err);
          });
    });
};

module.exports = {
    findFriendships : function( data, callback)  {
             return findFriendships( data, callback) ; },

    findAllTransactions : function(user, callback)  {
             return findAllTransactions(user, callback) ; },

    updateBalance: function(difference, username) {
            return updateBalance(difference, username); },

};
