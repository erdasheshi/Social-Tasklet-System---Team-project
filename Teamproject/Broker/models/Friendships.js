var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var friendshipSchema = new Schema({
    ID:      Number,
    user_1:  String,
    user_2:  String,
});

module.exports.friendshipSchema = friendshipSchema;