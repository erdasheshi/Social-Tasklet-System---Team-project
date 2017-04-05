var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

var mongoose = require('mongoose');
var Friendships = require("../models/Friendships");

var Friendship = mongoose.model("Friendship", Friendships.friendshipSchema);

module.exports = friendshipTransaction

function friendshipTransaction(data) {
    this.user_1 = data.user_1;
    this.user_2 = data.user_2;
    this.status = data.status;
}

friendshipTransaction.prototype.save =  function(callback) {
    var transaction = new Friendship({ //You're entering a new transaction here
        user_1: this.user_1,
        user_2: this.user_2,
        status: this.status
    });

    transaction.save({}, function (error, data) {
        if(error){
            callback(error, false);
        }
        callback(null, true);
    });
}