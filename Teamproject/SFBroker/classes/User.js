var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var mongoose = require('mongoose');

// user schema/model
var User = require('../models/Users.js');

function user(data) {
        this.username = data.username,
        this.password = data.password,
        this.email = data.email,
        this.firstname = data.firstname,
        this.lastname = data.lastname,
        this.balance = data.balance
  //      this.broker = data.broker
}

user.prototype.save =  function(callback) {
    var transaction = new User({ //You're entering a new transaction here
            username: this.username,
            password: this.password,
            email: this.email,
            firstname: this.firstname,
            lastname: this.lastname,
            balance: this.balance
       //  broker: this.broker
    });
    transaction.save(function (error) { //This saves the information you see within that Acounting declaration (lines 4-6).
        if(error){
            callback(error, false);
        }
        if(callback) callback(null, true);
    });
}

user.prototype.update =  function(){
    var transaction = this;
    console.log(transaction);

    User.findOne({ 'username' : this.username }, function (err, doc) {
		//avoiding the assignment null values
		//**maybe it requires the check for each single attribute so it does not assign the missing ones to null
		//**this might be done also in the call of the update function where u assign the unchanged values to the existing ones

        doc.balance   = transaction.balance;

        // if we decide to let the user change his data
		 doc.firstname = transaction.firstname;
		 doc.lastname  = transaction.lastname;
		 doc.email     = transaction.email;

 //**** User.update ({}, function (error, data) {
        doc.save({}, function (error, data) {
           if (error) {
                console.error(error.stack || error.message);
                return;
            }
        }); //not sure about the else...it needs to be tested
    });
}
module.exports = user;