/**
 * Created by alexb on 3/18/2017.
 */
var dbAccess = require('./dbAccess');
var constants = require('../constants');

function findPotentialProvider(consumer, callback) {
    var potentialprovider = '[';
    var consumer = consumer.username;
    var provider;
    var privacy = consumer.privacy;
    var userProcessed = 0;
    if (privacy == "high") {
        dbAccess.find({type: constants.Friendship, username: consumer}).exec(function (e, res) {
            if (e) callback(e, null);
            res.forEach(function (data, index, array) {
                if (data.user_1 == consumer) {
                    provider = data.user_2;
                } else if (data.user_2 == consumer) {
                    provider = data.user_1;
                }
                dbAccess.find({type: constants.User, username: provider}).exec(function (e, res) {
                    if( res.username !== consumer){
                        potentialprovider = potentialprovider.concat('{ \"username\": \"' + res.username + '\", \"price\": ' + res.price + '}');
                    }
                    userProcessed += 1;
                    if (userProcessed == array.length) {
                        potentialprovider = potentialprovider.concat(']');
                        potentialprovider = potentialprovider.replace('}{', '},{');
                        if(callback) callback(null, potentialprovider);
                    }
                });
            })
        });
    }
    else {
        dbAccess.find({type: constants.User}).exec(function (e, res) {
            if (e) callback(e, null);
            res.forEach(function (data, index, array) {
                if( data.username !== consumer) {
                    potentialprovider = potentialprovider.concat('{ \"username\": \"' + data.username + '\", \"price\": ' + data.price + '}');
                }
                userProcessed += 1;
                if (userProcessed == array.length) {
                    potentialprovider = potentialprovider.concat(']');
                    potentialprovider = potentialprovider.replace('}{', '},{');
                    callback(null, potentialprovider);
                }else {
                    potentialprovider = potentialprovider.replace('}{', '},{');
                }
            });
        });
    }
}

function findFriends(user, callback) {
    var F_List = '[';
    var user = user.username;
    var friend;
    var key = 'Network';
    var F_status;
    var userProcessed = 0;
    dbAccess.find({type: constants.Friendship, username: user, FriendshipStatus: key}).exec(function (e, res) {
        if (e) callback(e, null);

        res.forEach(function (data, index, array) {
            if (data.status == constants.FriendshipStatusRequested) {
                if (data.user_1 == user) {
                    friend = data.user_2;
                    F_status = 'requested';
                } else if (data.user_2 == user) {
                    friend = data.user_1;
                    F_status = 'pending';
                }
            }
            else if (data.status == constants.FriendshipStatusConfirmed) {
                if (data.user_1 == user) {
                    friend = data.user_2;
                } else if (data.user_2 == user) {
                    friend = data.user_1;
                }
                F_status = data.status;
        }
            F_List = F_List.concat('{ "name": "' + friend + '", "Friendship_Status": "' + F_status + '"}');
            userProcessed += 1;
            if (userProcessed == array.length) {
                F_List = F_List.concat(']');
                F_List = F_List.replace('}{', '},{');
                callback(null, F_List);
            }
            else{
                F_List = F_List.replace('}{', '},{');
            }
        });
    });
}
function findAllTransactions(user, callback) {
    var user = user.username;
    dbAccess.find({type: constants.Accounting, username: user}).exec(function (e, res) {
        if (e) callback(e, null);
        callback(null, res);
           });
        }

module.exports = {
    find: function (data, callback) {
        if (data.type == constants.PotentialProvider) {
            return findPotentialProvider(data, callback);
        } else if (data.type == constants.Friends) {
            return findFriends(data, callback);
        } else if (data.type == constants.AllTransactions) {
            return findAllTransactions(data, callback);
        }
    }
};