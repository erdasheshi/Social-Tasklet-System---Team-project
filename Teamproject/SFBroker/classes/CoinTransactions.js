var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

var mongoose = require('mongoose');
//var Users = require("../models/Users");

module.exports = coinRequest

function coinRequest(data) {
        this.requestid = data.requestid,
        this.userid = data.userid,
        this.requestedCoins = data.requestedCoins,
        this.approval = data.approval


}

coinRequest.prototype.save =  function() {
    var transaction = new Models.Coins({ //You're entering a new transaction here
        requestid: this.requestid,
        userid: this.userid,
        requestedCoins: this.requestedCoins,
        approval: this.approval

    });
    transaction.save(function (error) { //This saves the information you see within that Acounting declaration (lines 4-6).
        if(error){
            console.error(error.stack || error.message);
            return;
        }
    });
}

/*CoinTransactions.prototype.update =  function(){
    var transaction = this;
    var coins = mongoose.model("CoinRequests", CoinRequests.coinRequestSchema);
    coins.findOne({ 'taskletid' : this.taskletid }, function (err, doc) {
        doc.userid = transaction.userid;
        doc.requestedCoins = transaction.requestedCoins;

        doc.save({}, function (error, data) {
            if (error) {
                console.error(error.stack || error.message);
                return;
            }
        });
    });

}*/
