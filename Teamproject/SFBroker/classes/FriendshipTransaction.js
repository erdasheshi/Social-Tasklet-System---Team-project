var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var uuidV1 = require('uuid/v1');
var logic = require('../routes/logic');

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
//creates a new database entry or updates the existing ones
friendshipTransaction.prototype.save = function (callback) {
    var user_1 = this.user_1;
    var user_2 = this.user_2;
    var status = this.status;
    var id     = this.id;
    Friendship.findOne({ 'user_1': user_1, 'user_2': user_2 }).exec(function (e, udata) {
    //if no entry was not found, then search again with the other combination of user_2, user_1
        if (udata == null) {
            Friendship.findOne({ 'user_1': user_2, 'user_2': user_1 }).exec(function (e, data) {
            //if no entry was not found with neither of the combination, then create its
                if (data == null) {
                    var transaction = new Friendship({ //You're entering a new transaction here
                        id : id,
                        user_1: user_1,
                        user_2: user_2,
                        status: status
                    });
                    transaction.save({}, function (error, data) {
                        if (error) {
                            callback(error, false);
                        }
                        if (callback) {
                            //Store in the log the confirmed friendships
                            if (status == constants.AccountingStatusConfirmed) {
                                replicationManager.CollectUpdates({
                                    id : id,
                                    username: user_1,
                                    user_2: user_2,
                                    key: constants.Friendship
                                });
                            }
                            callback(null, true);
                        }
                    });
                }
                //an entry was found, therefore update it with the new values
                else {
                    Friendship.update({ 'user_1': user_2, 'user_2': user_1 }, { 'status': status }, function (e, data) {
                        if (e) {
                            callback(e, false);
                        }
                        if (callback) {
                            //Store in the log the confirmed friendships
                            if (status == constants.AccountingStatusConfirmed) {
                                replicationManager.CollectUpdates({
                                    id : id,
                                    username: user_1,
                                    user_2: user_2,
                                    key: constants.Friendship
                                });
                            }
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
                    //Store in the log the confirmed friendships
                    if (status == constants.AccountingStatusConfirmed) {
                        replicationManager.CollectUpdates({
                            id : id,
                            username: user_1,
                            user_2: user_2,
                            key: constants.Friendship
                        });
                    }
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

//find all the friendship transactions of a user, independent of the status
function findNetwork(data, callback) {
    var username = data.username;
    Friendship.find().or([ { 'user_1': username }, { 'user_2': username } ]).exec(function (e, data) {
       if (e) return next(e, null);
       callback(null, data);
});
}

//find only the friendship transactions with the status set to "Confirmed"
  function findFriends(data, callback) {
      var username = data.username;
      Friendship.find().where('status', constants.FriendshipStatusConfirmed).or([ { 'user_1': username }, { 'user_2': username } ]).exec(function (e, data) {
          if (e) callback(e, null);
          callback(null, data);
      });
  }

//delete the single entry that matches the given ID
function deleteByID(data, callback) {
    var id = data.id;

    Friendship.find({ 'id': id }).exec(function (e, data) {
    var user_1 = data.user_1;
    var user_2 = data.user_2;

    Friendship.remove({ 'id': data.id }, function (err, obj) {
        if (err){
        callback(err, null);
        }
        else {
            replicationManager.CollectUpdates({
                username : data.user_1,
                user_2 : data.user_2,
                id: id,
                key: 'd_friendship'
            });
            callback(null, true);
        }
    });
    });
}

//delete the entry that contains user_1 and user_2
function deleteByUsers(data, callback) {
    var user_1 = data.user_1;
    var user_2 = data.user_2;

  Friendship.remove({ $or: [ { 'user_1': data.user_1, 'user_2': user_2 }, { 'user_2': user_1, 'user_1': user_2  } ]
    }, function (err, data) {
       if (err) console.error(err, null);
        else {
            Friendship.find().or([ { 'user_1': user_1, 'user_2': user_2}, {'user_1': user_2, 'user_2': user_1 } ]).exec(function (e, data) {
            replicationManager.CollectUpdates({
                username: user_1,
                user_2: user_2,
                id: data.id,
                key: 'd_friendship'
            });
            });
             callback(null, true);
            }
    });
}

//delete the entries that belong to a certain user
function deleteByUser(data, callback) {
var user_1 = data.username;
Friendship.find().or([ { 'user_1': user_1 }, { 'user_2': user_1} ]).exec(function (e, res){
res.forEach(function (data, index, array) {
var id = data.id;
  deleteByID({ id: id }, function (e, data) {
        if (e) callback(e, null);
    });
    });
  if (e) callback(e, null);
  callback(null, true);
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
        return deleteByUsers(data, callback);
    },

    deleteByUser: function (data, callback) {
        return deleteByUser(data, callback);
    },
}