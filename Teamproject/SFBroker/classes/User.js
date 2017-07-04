var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var Users = require("../models/Users");
var mongoose = require('mongoose');

// user schema/model
var User = require('../models/Users.js');


function user(data) {
        this.username = data.username,
        this.password = data.password,
        this.price = data.price,
        this.email = data.email,
        this.firstname = data.firstname,
        this.lastname = data.lastname,
        this.balance = data.balance,
		this.version = data.version
}

user.prototype.save =  function(callback) {
    var transaction = new User({ //You're entering a new transaction here
            username: this.username,
            password: this.password,
            price: this.price,
            email: this.email,
            firstname: this.firstname,
            lastname: this.lastname,
            balance: this.balance,
			version: this.version
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
    //var user = mongoose.model("User", Users.userSchema);

    User.findOne({ 'username' : this.username }, function (err, doc) {
		//avoiding the assignment null values
		//**maybe it requires the check for each single attribute so it does not assign the missing ones to null
		//**this might be done also in the call of the update function where u assign the unchanged values to the existing ones
		if (transaction == null)
		{;}
		else{
        doc.balance = transaction.balance;
		doc.version = transaction.version;
		doc.name    = transaction.name;
		doc.price   = transaction.price;

        doc.save({}, function (error, data) {
            if (error) {
                console.error(error.stack || error.message);
                return;
            }
        });} //not sure about the else...it needs to be tested
    });
}

module.exports = user;