var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({ //This is where accountingSchema is defined.
    username: String,
    password: String,
    email: String,
    firstname: String,
    lastname: String,
    balance: Number
 //   broker: Number
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', userSchema);
