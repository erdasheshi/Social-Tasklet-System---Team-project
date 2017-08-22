var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var deviceSchema = new Schema({
     username  : String,
     device    : String,
     price     : Number,
     status   : String,

});

module.exports.deviceSchema = deviceSchema; //Export deviceSchem
