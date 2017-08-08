var constants = require('../constants');
//var Models = require("../server"); //Instantiate a Models object so you can access the models.js module. ???????????????????????????????
var mongoose = require('mongoose');

// device schema/model
var Devices = require('../models/Devices.js');
var Device = mongoose.model("Device", Devices.deviceSchema); //This creates a Device model.

//Initializing a transaction
function DeviceAssignments(data) {
    this.device    = data.device;
    this.username  = data.username;
    this.ID        = data.ID;
    this.price     = data.price;
    //***** this.status = data.status;
}

DeviceAssignments.prototype.save =  function(callback){
    var transaction = new Device({ //Entering a new assignment
    	device      : this.device,
        username    : this.username,
        price       : this.price,
        ID          : this.ID,
       //***** status: this.status,
        });
    transaction.save({}, function (error, data) {
        if(error){
            callback(error, false);
        }
        if(callback) callback(null, true);
    });
};

//Updating the data for an existing transaction
DeviceAssignments.prototype.update =  function(){
    var transaction = this;
    Device.findOne({'ID' : this.ID }, function (err, doc) {
		if (transaction == null)
		{}
	else{
        doc.device    = transaction.device;
        doc.username  = transaction.username;
        doc.price     = transaction.price;
      //*****  doc.status = transaction.status;

        doc.save({}, function (error, data) {
            if (error) {
                console.error(error.stack || error.message);
            }
	});
	}
    });
};
module.exports = DeviceAssignments;
