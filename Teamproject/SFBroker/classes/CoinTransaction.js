var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var CoinRequests = require("../models/CoinRequests");

var mongoose = require('mongoose');
var CoinRequests = require("../models/CoinRequests");

var Coins = mongoose.model("Coins", CoinRequests.coinRequestSchema);

module.exports = coinTransaction

function coinTransaction(data) {
        this.requestid = data.requestid,
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
    //var coins = mongoose.model("Coins", CoinRequests.coinRequestSchema);

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
