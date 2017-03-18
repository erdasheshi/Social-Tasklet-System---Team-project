var mongoose = require("mongoose");
var Schema = mongoose.Schema;
 
var accountingSchema = new Schema({ //This is where accountingSchema is defined.
     consumer: String,
     provider: String,
     computation: Number,
     coins: Number,
     status: String,
     taskletid: String
 });
 
module.exports.accountingSchema = accountingSchema; //Export accountingSchema so that models.js can access it.