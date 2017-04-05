var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({ //This is where accountingSchema is defined.
    username: String,
    password: String,
    price: Number,
    email: String,
    firstname: String,
    lastname: String,
    balance: Number
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', userSchema);