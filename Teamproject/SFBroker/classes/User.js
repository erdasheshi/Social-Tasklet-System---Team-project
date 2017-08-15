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

user.prototype.save =  function(callback) {
    var transaction = new User({ //You're entering a new transaction here
            username: this.username,
            password: this.password,
            email: this.email,
            firstname: this.firstname,
            lastname: this.lastname,
            balance: this.balance
    });
    transaction.save(function (error) { //This saves the information you see within that Acounting declaration (lines 4-6).
        if (error){
            callback(error, false);
        }
        if (callback) callback(null, true);
    });
}

user.prototype.update =  function() {
    var transaction = this;

    User.findOne({ 'username' : this.username }, function (err, doc) {
        doc.balance   = transaction.balance;
		doc.firstname = transaction.firstname;
		doc.lastname  = transaction.lastname;
		doc.email     = transaction.email;
        doc.save({}, function (error, data) {
           if (error) {
                console.error(error.stack || error.message);
                return;
            }
        }); //not sure about the else...it needs to be tested
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
    var username = data.username;
    friendship.deleteByUser({ username : username }, function(e, data){
        if (e) callback(e, null);
        device.deleteByUser({ username : username }, function(e, data) {

            if (e) callback(e, null);
            coins.deleteByUser({ username : username }, function(e, data) {
                if (e) callback(e, null);
                User.remove({ 'username': username }, function (err, data) {

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