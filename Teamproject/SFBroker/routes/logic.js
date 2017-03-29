/**
 * Created by alexb on 3/18/2017.
 */
var dbAccess = require('./dbAccess');
var constants = require('../constants');

function findPotentialProvider(consumer, callback) {
    var potentialprovider = '[';
    var consumer = consumer.userid;
    var provider;
    var privacy = consumer.privacy;
    var userProcessed = 0;
    if (privacy == "high") {
        dbAccess.find({type: constants.Friendship, userid: consumer}).exec(function (e, res) {
            res.forEach(function (data, index, array) {
                if (data.user_1 == consumer) {
                    provider = data.user_2;
                } else if (data.user_2 == consumer) {
                    provider = data.user_1;
                }
                dbAccess.find({type: constants.User, userid: provider}).exec(function (e, res) {
                    potentialprovider = potentialprovider.concat('{ \"userid\": \"' + res.userid + '\", \"price\": ' + res.price + '}');
                    userProcessed += 1;
                    if (userProcessed == array.length) {
                        potentialprovider = potentialprovider.concat(']');
                        potentialprovider = potentialprovider.replace('}{', '},{');
                        callback(potentialprovider);
                    }
                });
            })
        });
    }
    else {
        dbAccess.find({type: constants.User}).exec(function (e, res) {
            res.forEach(function (data, index, array) {


                potentialprovider = potentialprovider.concat('{ \"userid\": \"' + data.userid + '\", \"price\": ' + data.price + '}');
                userProcessed += 1;
                if (userProcessed == array.length) {
                    potentialprovider = potentialprovider.concat(']');
                    potentialprovider = potentialprovider.replace('}{', '},{');
                    callback(potentialprovider);
                }else {
                    potentialprovider = potentialprovider.replace('}{', '},{');
                }
            });

        });
    }
}
//*****

function findFriends(user, callback) {
    var F_List = '[';
    var user = user.userid;
    var friend;
    var key = 'Network';
    var F_status;
    var userProcessed = 0;
    dbAccess.find({type: constants.Friendship, userid: user, FriendshipStatus: key}).exec(function (e, res) {
        res.forEach(function (data, index, array) {
            if (data.user_1 == user) {
                friend = data.user_2;
            } else if (data.user_2 == user) {
                friend = data.user_1;
            }

            F_List = F_List.concat('{ \"userid\": \"' + friend + '\", \"Friendship_Status\": \"' + data.status + '\"}');
            userProcessed += 1;
            if (userProcessed == array.length) {
                F_List = F_List.concat(']');
                F_List = F_List.replace('}{', '},{');
                callback(F_List);
            }
            else{
                F_List = F_List.replace('}{', '},{');
            }
        });

    });
}

//*****

// *****
module.exports = {
    find: function (data, callback) {
        console.log(data);
        if (data.type == constants.PotentialProvider) {
            return findPotentialProvider(data, callback);
        } else if (data.type == constants.Friends) {
            return findFriends(data, callback);
        }
    }
};