var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var friendshipSchema = new Schema({ 
    id:      Number,
    user_1:  String,
    user_2:  String,
    status:  String
});

module.exports.friendshipSchema = friendshipSchema; //Export accountingSchema so that models.js can access it.