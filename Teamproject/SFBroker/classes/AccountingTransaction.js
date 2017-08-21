var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var mongoose = require('mongoose');
var uuidV1 = require('uuid/v1');

var Accountings = require("../models/Accountings");
var Accounting = mongoose.model("Accounting", Accountings.accountingSchema); //This creates the Accounting model.

function AccountingTransaction(data) {
 this.transaction_id = data.transaction_id;
    if (!this.transaction_id) {
        this.transaction_id = uuidV1();
    }
    this.consumer = data.consumer;
    this.provider = data.provider;
    this.coins = data.coins;
    this.status = data.status;
    this.taskletid = data.taskletid;
    this.time = data.time;
}
//creates a new database entry or updates the existing ones
AccountingTransaction.prototype.save = function (callback) {
    var tempAcc = this;

   Accounting.findOne({ 'transaction_id' : tempAcc.transaction_id }, function (err, udata) {
        //if no entry was not found, then create it
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
        //an entry was found, therefore update it with the new values
        else {
            Accounting.update({  'transaction_id' : tempAcc.transaction_id  },{
            taskletid : tempAcc.taskletid,
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

//find all the entries in the database
function findAll(callback) {
    Accounting.find({}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

//find the entries that belong to a certain user
function findByUser(data, callback) {
    Accounting.find().or([ { 'consumer': data.username }, { 'provider': data.username } ]).exec( function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

//find the single entry that matches the  given taskletid
function findByID(data, callback) {
    Accounting.find({ 'taskletid': data.taskletid }, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

//find the single entry that matches the  given transaction_id
function findByTransactionID(data, callback) {
    Accounting.findOne({ 'transaction_id': data.transaction_id }, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

//delete the single entry that matches the given transaction_id
function deleteByTransactionID(data, callback) {
    var transaction_id = data.transaction_id;

    Accounting.remove({'transaction_id': transaction_id}, function (err, obj) {
        if (err) console.error(err, null);
        if (callback) callback(null, true);
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
    },

    findByTransactionID : function(data, callback) {
        return findByTransactionID(data, callback);
    },

    deleteByTransactionID : function(data, callback) {
        return deleteByTransactionID(data, callback);
    }
};
