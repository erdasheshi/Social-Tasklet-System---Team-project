var constants, Models,  mongoose, broker, friendship, device, coins;

constants = require('../constants');
Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
mongoose = require('mongoose');

friendship  = require('./FriendshipTransaction.js');
device      = require('./DeviceAssignments.js');
coins       = require('./CoinTransaction.js');

// user schema/model
var User = require('../models/Users.js');

function user(data) {
        this.firstname = data.firstname,
        this.username = data.username,
        this.password = data.password,
        this.email = data.email,
        this.lastname = data.lastname,
        this.balance = data.balance
}

user.prototype.save = function (callback) {
    var tmpUser = this;
    User.findOne({'username': tmpUser.username}, function (e, udata) {
        if (udata == null) {
            var element = new User(tmpUser);
            element.save({}, function (error, data) {
                if (error) {
                    console.error(error);
                }
                if (callback) {
                    callback(null, true);
                }
            });
        }
        else {
            User.update({'username': tmpUser.username},{
            username: username,
            password: password,
            email: email,
            firstname: firstname,
            lastname: lastname,
            balance: balance
                }, function (error, data) {
                    if (error) {
                        callback(error, false);
                    }
                    else if (callback) {
                        callback(null, true);
                    }
                });
        }
    });
}

function findAll(callback) {
    User.find({}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

function findByUser(data, callback) {
    User.findOne({ 'username' : data.username }, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

function deleteByUsername(data, callback){
console.log( username + " the delete user is called")
    var username = data.username;
    friendship.deleteByUser({ username : username }, function(e, data){
        if (e) callback(e, null);
        device.deleteByUser({ username : username }, function(e, data) {

            if (e) callback(e, null);
            coins.deleteByUser({ username : username }, function(e, data) {
                if (e) callback(e, null);
                User.remove({ 'username': username }, function (err, data) {
console.log("after deleting the coin requests");
                    if (err) callback(err, null);
                    if (callback) callback(null, true);
                });
            });
        });
    });
}

module.exports = {
    user : user,

    get : function(data) {
        return new user(data);
    },

    findAll : function(data, callback) {
        return findAll(data, callback);
    },

    findByUser : function(data, callback) {
        return findByUser(data, callback);
    },

    deleteByUsername : function(data, callback) {
        return deleteByUsername(data, callback);
    }
};