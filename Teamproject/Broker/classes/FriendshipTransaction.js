var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var uuidV1 = require('uuid/v1');

var mongoose = require('mongoose');
var Friendships = require("../models/Friendships");
var Friendship = mongoose.model("Friendship", Friendships.friendshipSchema);

var replicationManager = require('./../replication/replicationManager');

function friendshipTransaction(data) {
    this.id = data.id;
    if (!this.id) {
        this.id = uuidV1();
    }
    this.user_1 = data.user_1;
    this.user_2 = data.user_2;
    this.status = data.status;
}

friendshipTransaction.prototype.save = function (callback) {
    var user_1 = this.user_1;
    var user_2 = this.user_2;
    var status = this.status;
    Friendship.findOne({ 'user_1': this.user_1, 'user_2': this.user_2 }).exec(function (e, udata) {
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

function findAll(callback) {
    Friendship.find({}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

function findNetwork(data, callback) {
    var username = data.username;
    Friendship.find().or([ { 'user_1': username }, { 'user_2': username } ]).exec(function (e, data) {
        if (e) return next(e, null);
        var response = '{ "username": "' + username + '", "connections": ' + JSON.stringify(data) + '}';
        callback(null, JSON.parse(response.toString()));

    });
}

function findFriends(data, callback) {
    var username = data.username;
    Friendship.find().where('status', constants.FriendshipStatusConfirmed).or([ { 'user_1': username }, { 'user_2': username } ]).exec(function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

function deleteByID(data, callback) {
    var id = data.id;
    friendship.remove({ 'id': data.id }, function (err, obj) {
        if (err) callback(err, null);
        else {
            replicationManager.CollectUpdates({
                id: id,
                key: 'd_friendship'
            });
            if (callback) callback(null, true);
        }

    });
}

function deleteByUsers(data, callback) {
    var user_1 = data.user_1;
    var user_2 = data.user_2;

    friendship.remove({
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

function deleteByUser(data, callback) {
    var user_1 = data.username;

    friendship.remove({
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