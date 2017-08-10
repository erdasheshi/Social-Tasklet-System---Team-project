var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var mongoose = require('mongoose');
var uuidV1     = require('uuid/v1');

var CoinRequests = require("../models/CoinRequests");
var Coins = mongoose.model("Coins", CoinRequests.coinRequestSchema);

function coinTransaction(data) {
    this.requestid = data.id;
    if (!this.requestid) {
        this.requestid = uuidV1();
    }
    this.username = data.username,
    this.requestedCoins = data.requestedCoins,
    this.approval = data.approval
}

coinTransaction.prototype.save =  function(callback) {
    var transaction = new Coins({ //You're entering a new transaction here
        requestid: this.requestid,
        username: this.username,
        requestedCoins: this.requestedCoins,
        approval: this.approval
    });
    transaction.save(function (error) { //This saves the information you see within that Acounting declaration (lines 4-6).
        if(error){
            callback(error, false);
        }
        if(callback) callback(null, true);
    });
}

coinTransaction.prototype.update =  function(){
    var transaction = this;

    Coins.findOne({ 'requestid' : this.requestid }, function (err, doc) {
        doc.approval = transaction.approval;
        doc.username =  transaction.username;
        doc.requestedCoins =  transaction.requestedCoins;
        doc.save({}, function (error, data) {
            if (error) {
                console.error(error.stack || error.message);
                return;
            }
        });
    });
}

function findAll(callback) {
    Coins.find({}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

function findByUser(data, callback) {
    Coins.find({ 'username' : data.username }, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

function findByApproval(data, callback) {
    Coins.find({ 'approval' : data.approval }, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

function deleteByUser(data, callback) {
    var username = data.username;
    Coins.remove({ 'username': username }, function (err, data) {
        if (err) callback(err, null);
        if (callback) callback(null, true);
    });
}

module.exports = {
    coinTransaction: coinTransaction,

    get: function (data) {
        return new coinTransaction(data);
    },

    findAll: function (data, callback) {
        return findAll(data, callback);
    },

    findByUser: function (data, callback) {
        return findByUser(data, callback);
    },

    findByApproval: function (data, callback) {
        return findByApproval(data, callback);
    },

    deleteByUser: function (data, callback) {
        return deleteByUser(data, callback);
    }
}