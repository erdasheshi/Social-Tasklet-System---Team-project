var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var friendshipSchema = new Schema({ //This is where accountingSchema is defined.
    User_1: String,
    User_2: String,
    Status: String
});

module.exports.friendshipSchema = friendshipSchema; //Export accountingSchema so that models.js can access it.