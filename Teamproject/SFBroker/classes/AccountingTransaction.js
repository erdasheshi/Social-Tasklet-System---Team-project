var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var mongoose = require('mongoose');

var Accountings = require("../models/Accountings");
var Accounting = mongoose.model("Accounting", Accountings.accountingSchema); //This creates the Accounting model.

function AccountingTransaction(data) {
    this.consumer = data.consumer;
    this.provider = data.provider;
    this.coins = data.coins;
    this.status = data.status;
    this.taskletid = data.taskletid;
    this.time = data.time;
}

AccountingTransaction.prototype.save = function (callback) {
    var tempAcc = this;
   Accounting.findOne({ 'taskletid' : tempAcc.taskletid }, function (err, udata) {
        if (udata == null) {
            var transaction = new Accounting(tempAcc);
            transaction.save({}, function (error, data) {
                if (error) {
                    console.error(error);
                }
                if (callback) {
                    callback(null, true);
                }
            });
        }
        else {
            Accounting.update({  'taskletid' : tempAcc.taskletid  },{
            consumer : tempAcc.consumer,
            provider : tempAcc.provider,
            coins : tempAcc.computation,
            status : tempAcc.status,
            time : tempAcc.time
                },
                function (error, data) {
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
    Accounting.find({}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

function findByUser(data, callback) {
    Accounting.find().or([ { 'consumer': data.username }, { 'provider': data.username } ]).exec( function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

function findByID(data, callback) {
    Accounting.find({ 'taskletid': data.taskletid }, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

module.exports = {
    AccountingTransaction : AccountingTransaction,

    get : function(data){
        return new AccountingTransaction(data);
    },

    findAll : function(data, callback) {
        return findAll(data, callback);
    },

    findByUser : function(data, callback) {
        return findByUser(data, callback);
    },

    findByID : function(data, callback) {
        return findByID(data, callback);
    }
};
