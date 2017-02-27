var mongoose = require("mongoose");
var Schema = mongoose.Schema;
 
var accountingSchema = new Schema({ //This is where accountingSchema is defined.
     Buyer: String,
     Seller: String,
     Computation: Number,
     Coins: Number,
     Status: String,
     Tasklet_ID: String
 });
 
module.exports.accountingSchema = accountingSchema; //Export accountingSchema so that models.js can access it.