var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var Users = require("../models/Users");
var mongoose = require('mongoose');

// user schema/model
var User = require('../models/Users.js');


module.exports = user

function user(data) {
        this.username = data.username,
        this.password = data.password,
        this.price = data.price,
        this.email = data.email,
        this.firstname = data.firstname,
        this.lastname = data.lastname,
        this.balance = data.balance
}

user.prototype.save =  function(callback) {
    var transaction = new User({ //You're entering a new transaction here
            username: this.username,
            password: this.password,
            price: this.price,
            email: this.email,
            firstname: this.firstname,
            lastname: this.lastname,
            balance: this.balance

    });
    transaction.save(function (error) { //This saves the information you see within that Acounting declaration (lines 4-6).
        if(error){
            callback(error, false);
        }
        callback(null, true);
    });
}

user.prototype.update =  function(){
    var transaction = this;
    console.log(transaction);
    var user = mongoose.model("User", Users.userSchema);

    user.findOne({ 'userid' : this.userid }, function (err, doc) {
        doc.balance = transaction.balance;

        doc.save({}, function (error, data) {
            if (error) {
                console.error(error.stack || error.message);
                return;
            }
        });
    });
}