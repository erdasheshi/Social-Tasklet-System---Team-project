var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var deviceSchema = new Schema({
     username : String,
     name     : String,
     device   : { type: Number, required: true},   //its unique for each entry, holds the id of registered devices
     status   : String,   //status can be "inactive" or "active"
     price    : Number
});

module.exports.deviceSchema = deviceSchema; //Export deviceSchema
