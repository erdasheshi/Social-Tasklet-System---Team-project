var mongoose = require("mongoose");
var Schema = mongoose.Schema;
 
var accountingSchema = new Schema({ //This is where accountingSchema is defined.
     consumer: String,
     provider: String,
     coins: Number,
     status: String,
     taskletid: String,
     time: Date,
 });
 
module.exports.accountingSchema = accountingSchema; //Export accountingSchema so that models.js can access it.