//the functions that are used in the APIs with the Broker
var constants = require('../constants');

var mongoose = require('mongoose');
var Friendships = require("../models/Friendships");
var accountingTransaction = require('../classes/AccountingTransaction');
var friendshipTransaction = require('../classes/FriendshipTransaction');
var devices = require('../classes/DeviceAssignments');

var user = require('../classes/User');

//find all the transactions belonging to one user
function findAllTransactions(user, callback) {
    var user = user.username;
    var transactionsProcessed = 0;
    var transactionList = '[';
    //search the database for transactions belonging to the given user
    accountingTransaction.findByUser({username: user}, function (e, res) {
        if (e) callback(e, null);

        //create a json file with the found transactions
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

//find the friends/requested friends/ pending friends of a user - information to be used in API for the frontend
function findFriendships(data, callback) {
    var F_List = '[';
    var user = data.username;
    var friend, status;
    var userProcessed = 0;
    //find all friendship transactions of a user
    friendshipTransaction.findNetwork({username: user}, function (e, res) {
        if (e) callback(e, null);

        if (res.length > 0) {
            res.forEach(function (data, index, array) {
            /*friendship relation with the status requested & this user is set as a the first user in the transaction
            then set the status of this transaction to Requested - this user is the one who sent the friendship request */
                if (data.status == constants.FriendshipStatusRequested) {
                    if (data.user_1 == user) {
                        friend = data.user_2;
                        status = constants.FriendshipStatusRequested;
                    }
                    /*friendship relation with the status requested & this user is set as a the second user in the transaction
                    then set the status of this transaction to Pending - the friendship request was initiated by another user*/
                    else if (data.user_2 == user) {
                        friend = data.user_1;
                        status = constants.FriendshipStatusPending;
                    }
                }
                //if its a confirmed friendship relation set the status to Confirmed
                else if (data.status == constants.FriendshipStatusConfirmed) {
                    if (data.user_1 == user) {
                        friend = data.user_2;
                    } else if (data.user_2 == user) {
                        friend = data.user_1;
                    }
                    status = data.status;
                }
                //create json file
                F_List = F_List.concat('{ "name": "' + friend + '", "status": "' + status + '"}');
                userProcessed += 1;
                if (userProcessed == array.length) {
                    F_List = F_List.concat(']');
                    F_List = F_List.replace('}{', '},{');
                }
                else {
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
    //find the user with the given username
    user.findByUser({username: username}, function (e, data) {
        var balance = data.balance;

        //if the value of difference was not defined then set it to zero
        if (isNaN(difference)) {
            difference = 0;
        }
        //adjust balance based on the value of the difference
        balance = balance + difference;

        //update user's balance
        var userb = user.get({
            username: username,
            balance: balance,
        });
        userb.save(function (err, post) {
            if (err) return next(err);
            return true;
        });
    });
};

module.exports = {
    findFriendships: function (data, callback) {
        return findFriendships(data, callback);
    },

    findAllTransactions: function (user, callback) {
        return findAllTransactions(user, callback);
    },

    updateBalance: function (difference, username) {
        return updateBalance(difference, username);
    },

};
