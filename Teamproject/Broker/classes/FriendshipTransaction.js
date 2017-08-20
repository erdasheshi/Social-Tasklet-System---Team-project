var constants = require('../constants');
var uuidV1 = require('uuid/v1');

var mongoose = require('mongoose');
var Friendships = require("../models/Friendships");
var Friendship = mongoose.model("Friendship", Friendships.friendshipSchema);

function friendshipTransaction(data) {
    this.id = data.id;
    if (!this.id) {
        this.id = uuidV1();
    }
    this.user_1 = data.user_1;
    this.user_2 = data.user_2;
    this.status = data.status;
}
//creates a new database entry or updates the existing ones
friendshipTransaction.prototype.save = function (callback) {
    var user_1 = this.user_1;
    var user_2 = this.user_2;
    var status = this.status;
    Friendship.findOne({ 'user_1': user_1, 'user_2': user_2 }).exec(function (e, udata) {
        //if no entry was not found, then create it
        if (udata == null) {
            Friendship.findOne({ 'user_1': user_2, 'user_2': user_1 }).exec(function (e, data) {
                if (data == null) {
                    var transaction = new Friendship({ //You're entering a new transaction here
                        user_1: user_1,
                        user_2: user_2,
                        status: status
                    });
                    transaction.save({}, function (error, data) {
                        if (error) {
                            callback(error, false);
                        }
                        if (callback) {
                            callback(null, true);
                        }
                    });
                }
                else {
                    Friendship.update({ 'user_1': user_2, 'user_2': user_1 }, { 'status': status }, function (e, data) {
                        if (e) {
                            callback(e, false);
                        }
                        if (callback) {
                            //Store in the log the confirmed friendships
                            callback(null, true);
                        }
                    });
                }
            });
        }
        //an entry was found, therefore update it with the new values
        else {
            Friendship.update({ 'user_1': user_1, 'user_2': user_2 }, { 'status': status }, function (e, data) {
                if (e) {
                    callback(e, false);
                }
                if (callback) {
                    callback(null, true);
                }
            });
        }
    });
}

//find all the entries in the database
function findAll(callback) {
    Friendship.find({}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

//find the list fo friends for the given user
function findFriends(data, callback){
    var username = data.username;
    var friends_list = [];
    Friendship.find().where('status', constants.FriendshipStatusConfirmed).or([ { 'user_1': username }, { 'user_2': username } ]).exec(function (e, res) {
        if (e) callback(e, null);

        //find the username of the friends
        res.forEach(function ( data, index, array){
        if(data.user_1 == username) {
        friends_list = friends_list.concat({ username: data.user_2 });
        }
        else{
        friends_list = friends_list.concat({ username: data.user_1 });
         }
         });
        callback(null, friends_list);
    });
}

//check the existence of a friendship transaction between two users
function findExistence(data, callback) {
    var user_1 = data.user_1;
    var user_2 = data.user_2;
    var existence = "false";

    Friendship.findOne({ 'user_1': user_1, 'user_2': user_2 }).exec(function (e, res) {
        if (res != null) {
            existence = "true";
        }
        else {
            Friendship.findOne({ 'user_1': user_2, 'user_2': user_1 }).exec(function (e, res) {
                if (res != null) {
                    existence = "true";
                }
            });
        }
        callback(null, existence);
    });
}

function findFriendsOfFriends(data, callback) {
    var user_1 = data.user_1;
    var user_2 = data.user_2;
    var existence = "false";

    findFriends({ username: user_1 }, function (e, data) {
        if (e) callback(e, null);
        if (JSON.stringify(data) == "[]") callback(null, existence);
        else {
            var processed = 0;
            data.forEach(function (entry, index, array) {

                if (entry.user_1 == user_1) {
                    findExistence({ user_1: entry.user_2, user_2: user_2 }, function (e, result) {
                        if (result == "true") {
                            existence = "true";
                            callback(null, existence);
                        }
                        processed += 1;
                        if (processed == array.length && existence == "false") {
                            callback(null, existence);
                        }
                    });
                }
                else {
                    findExistence({ user_1: entry.user_1, user_2: user_2 }, function (e, result) {
                        if (result == "true") {
                            existence = "true";
                            callback(null, existence);
                        }
                        processed += 1;
                        if (processed == array.length && existence == "false") {
                            callback(null, existence);
                        }
                    });
                }

            });
        }
    });
}

//delete the single entry that matches the given ID
function deleteByID(data, callback) {
    var id = data.id;
    Friendship.remove({ 'id': data.id }, function (err, obj) {
        if (err) {
         callback(err, null);
        }
        else {
            if (callback) callback(null, true);
        }
    });
}

//delete the entry that contains user_1 and user_2               ( ?not used in the broker ---- to be removed )
function deleteByUsers(data, callback) {
    var user_1 = data.user_1;
    var user_2 = data.user_2;

    Friendship.remove({
        $or: [ { 'user_1': data.user_1, 'user_2': user_2 }, {
            'user_2': user_1, 'user_1': user_2
        } ]
    }, function (err, data) {
        if (err) callback(err, null);

            if (callback) {
                callback(null, true);
            }
    });
}

//delete the entries that belong to a certain user               ( ?not used in the broker ---- to be removed )
function deleteByUser(data, callback) {
    var user_1 = data.username;

    Friendship.remove({
        $or: [ { 'user_1': data.user_1 }, { 'user_2': user_1 } ] }, function (err, data) {
        if (err) callback(err, null);

            if (callback) {
                callback(null, true);
            }
    });
}

module.exports = {
    friendshipTransaction: friendshipTransaction,

    get: function (data) {
        return new friendshipTransaction(data);
    },

    findFriends: function (data, callback) {
        return findFriends(data, callback);
    },

    findAll: function (callback) {
        return findAll(callback);
    },

    findNetwork: function (data, callback) {
        return findNetwork(data, callback);
    },

    findExistence: function (data, callback) {
        return findExistence(data, callback);
    },

    findFriendsOfFriends: function (data, callback) {
        return findFriendsOfFriends(data, callback);
    },

    deleteByID: function (data, callback) {
        return deleteByID(data, callback);
    },

    deleteByUsers: function (data, callback) {
        return deleteByUsers(data, calback);
    },

    deleteByUser: function (data, callback) {
        return deleteByUser(data, calback);
    },
}