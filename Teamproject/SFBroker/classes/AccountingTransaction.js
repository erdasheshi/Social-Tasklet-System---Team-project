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

AccountingTransaction.prototype.save =  function(callback){
    var transaction = new Accounting({ //You're entering a new transaction here
        consumer: this.consumer,
        provider: this.provider,
        coins: this.coins,
        status: this.status,
        taskletid: this.taskletid,
        time: this.time
        });

    transaction.save({}, function (error, data) {
        if(error){
            callback(error, false);
        }
        if(callback) callback(null, true);
    });
}

AccountingTransaction.prototype.update =  function(){
    var transaction = this;
    accounting.findOne({ 'taskletid' : this.taskletid }, function (err, doc) {
        doc.consumer = transaction.consumer;
        doc.provider = transaction.provider;
        doc.coins = transaction.computation;
        doc.status = transaction.status;
        doc.time = transaction.time;
        doc.save({}, function (error, data) {
            if (error) {
                console.error(error.stack || error.message);
                return;
            }
        });
    });
}
module.exports = AccountingTransaction;
