var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var mongoose = require('mongoose');

// broker schema/model
var Broker = require('../models/Brokers.js');

function broker(data) {
        this.username = data.username,
        this.broker = data.broker
}

broker.prototype.save =  function(callback) {
    var transaction = new Broker({
            username: this.username,
            broker: this.broker,

    });
    transaction.save(function (error) { //This saves the information you see within that Acounting declaration (lines 4-6).
        if(error){
            callback(error, false);
        }
        if(callback) callback(null, true);
    });
}

broker.prototype.update =  function(){
    var transaction = this;
    console.log(transaction);

    Broker.findOne({ 'username' : this.username }, function (err, doc) {
        doc.broker   = transaction.broker
        doc.save({}, function (error, data) {
           if (error) {
                console.error(error.stack || error.message);
                return;
            }
        });
    });
}
module.exports = broker;