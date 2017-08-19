var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var mongoose = require('mongoose');

// broker schema/model
var Broker = require('../models/Brokers.js');

function broker(data) {
    this.username = data.username,
    this.broker = data.broker
}

broker.prototype.save = function (callback) {
    var transaction = new Broker({
        username: this.username,
        broker: this.broker,

    });
    Broker.findOne({'username': this.username}, function (err, doc) {
        if (doc) {
            doc.broker = transaction.broker
            doc.save({}, function (error, data) {
                if (error) {
                    console.error(error.stack || error.message);
                    return;
                }

            });
        }
        else {
            transaction.save(function (error) { //This saves the information you see within that Acounting declaration (lines 4-6).
                if (error) {
                    callback(error, false);
                }
                if (callback) callback(null, true);
            });
        }
    });

}

function findAll(callback) {
    Broker.find({}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

 function findByUser(data, callback) {
   Broker.findOne({'username': data.username}).exec(function (e, data) {
         if (e) callback(e, null);
         callback(null, data);
     });
}

 function findBrokers(callback) {
   Broker.distinct( "broker" ).exec(function (e, data) {
         if (e) callback(e, null);
         callback(null, data);
     });
}
module.exports = {
    broker: broker,

    get: function (data) {
        return new broker(data);
    },

    findAll: function (data, callback) {
        return findAll(data, callback);
    },

    findByUser: function (data, callback) {
        return findByUser(data, callback);
    },

    findBrokers: function (callback) {
        return findBrokers(callback);
    }
};