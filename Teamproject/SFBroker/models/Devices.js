var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var deviceSchema = new Schema({
     username : String,
     name     : String,
     device   : String,
     status   : String,  //??? Not sure if needed
     price    : Number
});

module.exports.deviceSchema = deviceSchema; //Export deviceSchema
