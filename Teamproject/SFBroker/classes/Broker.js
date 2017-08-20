var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var mongoose = require('mongoose');

// broker schema/model
var Broker = require('../models/Brokers.js');

function broker(data) {
    this.username = data.username,
    this.broker = data.broker
}
//creates a new database entry or updates the existing ones
broker.prototype.save = function (callback) {
    var transaction = new Broker({
        username: this.username,
        broker: this.broker,

    });
    Broker.findOne({'username': this.username}, function (err, doc) {
    //if no entry was not found, then create it
        if (doc) {
            doc.broker = transaction.broker
            doc.save({}, function (error, data) {
                if (error) {
                    console.error(error.stack || error.message);
                    return;
                }

            });
        }
        //an entry was found, therefore update it with the new values
        else {
            transaction.save(function (error) {
                if (error) {
                    callback(error, false);
                }
                if (callback) callback(null, true);
            });
        }
    });

}

//find all the entries in the database
function findAll(callback) {
    Broker.find({}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

//find the entries that belong to a certain user
 function findByUser(data, callback) {
   Broker.findOne({'username': data.username}).exec(function (e, data) {
         if (e) callback(e, null);
         callback(null, data);
     });
}

//find all brokers registered in the database
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