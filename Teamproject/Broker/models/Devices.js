var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var deviceSchema = new Schema({
     ID        : String,
     username  : String,
     device    : String,
     price     : Number,
     //***** status: String  //??? Not sure if needed
});

module.exports.deviceSchema = deviceSchema; //Export deviceSchem
