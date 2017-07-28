var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var mongoose = require('mongoose');

// device schema/model
var Devices = require('../models/Devices.js');
var Device = mongoose.model("Device", Devices.deviceSchema); //This creates a Device model.

//Initializing a transaction
function DeviceAssignments(data) {
    this.device   = data.device,
    this.username = data.username,
    this.price    = data.price,
    this.status   = data.status
}

DeviceAssignments.prototype.save =  function(callback){
    var transaction = new Device({ //Entering a new assignment
    	device      : this.device,
    	name        : this.name,
        username    : this.username,
        price       : this.price,
        status      : this.status
        });
   transaction.save(function (error) { //This saves the information you see within that Acounting declaration (lines 4-6).
         if(error){
             callback(error, false);
         }
         if(callback) callback(null, true);
     });
}

//Updating the data for an existing transaction
DeviceAssignments.prototype.update =  function(){
    var transaction = this;
    Device.findOne({ 'Device' : this.device }, function (err, doc) {
        doc.name       = transaction.name;
        doc.username   = transaction.username;
        doc.status     = transaction.status;
        doc.price      = transaction.price;

        doc.save({}, function (error, data) {
            if (error) {
                console.error(error.stack || error.message);
                return;
            }
	});
    });
};
module.exports = DeviceAssignments;
