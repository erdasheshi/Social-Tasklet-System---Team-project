var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({ //This is where accountingSchema is defined.
    userid: String,
    password: String,
    price: Number,
    email: String,
    firstname: String,
    lastname: String
});

module.exports.userSchema = userSchema; //Export accountingSchema so that models.js can access it.