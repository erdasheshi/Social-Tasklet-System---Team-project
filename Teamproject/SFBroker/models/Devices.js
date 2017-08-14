var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var deviceSchema = new Schema({
     username : String,
     name     : String,
     device   : { type: Number, required: true},
     status   : String,
     price    : Number
});

module.exports.deviceSchema = deviceSchema; //Export deviceSchema
