var constants = require('../constants');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Instantiate a Models object so you can access the models.js module.
//??? not sure if this is needed (test)
 var Models = require("../app");

// Create and define the database schema
var deviceSchema = new Schema({
     ID    : String,
     user  : String,
     device: String,
     status: String,  //??? Not sure if needed
	 
 });
 
var DeviceAssignments = mongoose.model("DeviceAssignments", deviceSchema); //This creates the Accounting model.

//Initializing a transaction
function DeviceAssignments(data) {
    this.device = data.device;
    this.user = data.user;
    this.ID = data.ID;
    this.status = data.status;
}

DeviceAssignments.prototype.save =  function(callback){
    var assignment = new DeviceAssignments({ //Entering a new assignment
    	device: this.device,
        user: this.user,
        ID: this.ID,
        status: this.status,
        taskletid: this.taskletid
        });

    assignment.save({}, function (error, data) {
        if(error){
            callback(error, false);
        }
        if(callback) callback(null, true);
    });
}

//Updating the data for an existing transaction
DeviceAssignments.prototype.update =  function(){
    var transaction = this;
    var assignments = mongoose.model("assignments", deviceSchema);
    assignments.findOne({ 'ID' : this.ID }, function (err, doc) {
		
		if (transaction == null)
		{;}
	else{
        doc.device = transaction.device;
        doc.ID = transaction.ID;
        doc.user = transaction.user;
        doc.status = transaction.status;
		
        doc.save({}, function (error, data) {
            if (error) {
                console.error(error.stack || error.message);
                return;
            }
	});
	}
    });
}