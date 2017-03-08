var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

var mongoose = require('mongoose');
var Accountings = require("../models/Accountings");

module.exports = AccountingTransaction

function AccountingTransaction(data) {
    this.buyer = data.buyer;
    this.seller = data.seller;
    this.computation = data.computation;
    this.coins = data.coins;
    this.status = data.status;
    this.taskletid = data.taskletid;
}

AccountingTransaction.prototype.save =  function(){
    var transaction = new Models.Accounting({ //You're entering a new transaction here
        buyer: this.buyer,
        seller: this.seller,
        computation: this.computation,
        coins: this.coins,
        status: this.status,
        taskletid: this.taskletid
        });

    transaction.save({}, function (error, data) {
        if(error){
            console.error(error.stack || error.message);
            return;
        }
    });
}

AccountingTransaction.prototype.update =  function(){
    var transaction = this;
    var accounting = mongoose.model("Accounting", Accountings.accountingSchema);
    accounting.findOne({ 'taskletid' : this.taskletid }, function (err, doc) {
        doc.buyer = transaction.buyer;
        doc.seller = transaction.seller;
        doc.computation = transaction.computation;
        doc.coins = transaction.computation;
        doc.status = transaction.status;
        doc.save({}, function (error, data) {
            if (error) {
                console.error(error.stack || error.message);
                return;
            }
        });
    });

}