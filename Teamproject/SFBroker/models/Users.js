var mongoose, passportLocalMongoose, Schema;

mongoose = require("mongoose");
passportLocalMongoose = require('passport-local-mongoose');
Schema = mongoose.Schema;

var userSchema = new Schema({ //This is where accountingSchema is defined.
    username: String,         //its unique for each entrys
    password: String,
    email: String,
    firstname: String,
    lastname: String,
    balance: Number
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', userSchema);
