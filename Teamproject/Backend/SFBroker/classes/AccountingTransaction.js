var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

var mongoose = require('mongoose');
//var Accountings = require("../models/Accountings");

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

    console.log(this.buyer);
    transaction.save({}, function (error, data) {
        if(error){
            console.error(error.stack || error.message);
            return;
        }
    });
}

AccountingTransaction.prototype.update =  function(){
    var transaction = new Models.Accounting();
    transaction.update({taskletid: this.taskletid}, { buyer: this.buyer, seller: this.seller, computation: this.computation, coins: this.coins, status: this.status}, function (error, data) {
        if(error){
            console.error(error.stack || error.message);
            return;
        }
    });
}