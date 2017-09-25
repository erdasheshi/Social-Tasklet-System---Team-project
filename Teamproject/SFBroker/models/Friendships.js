var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var friendshipSchema = new Schema({ 
    id:      String,   //its unique for each entry
    user_1:  String,
    user_2:  String,
    status:  String      //status can be  "Confirmed" or "Requested"
});

module.exports.friendshipSchema = friendshipSchema; //Export accountingSchema so that models.js can access it.