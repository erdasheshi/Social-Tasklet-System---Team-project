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
    this.taskletID = data.tasklet_id;
}

AccountingTransaction.prototype.save =  function(){
    var transaction = new Models.Accounting({ //You're entering a new transaction here
        Buyer: this.buyer,
        Seller: this.seller,
        Computation: this.computation,
        Coins: this.coins,
        Status: this.status,
        Tasklet_ID: this.taskletID
        });

    transaction.save(function(error) { //This saves the information you see within that Acounting declaration (lines 4-6).
        if (error) {
            return next(error);
           }
        });
    }