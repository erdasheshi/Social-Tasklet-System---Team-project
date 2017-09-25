var mongoose, Schema;

mongoose = require("mongoose");
Schema = mongoose.Schema;

var accountingSchema = new Schema({ //This is where accountingSchema is defined.
     transaction_id: String,             //is uniques for each transaction
     consumer: String,
     provider: String,
     coins: Number,               //cost of a tasklet
     status: String,             //status can be "Computed", "Blocked", "Not Computed"
     taskletid: String,                  //holds the id of the taskelet, More than one transaction can have the same taskletid
     time: Date,
 });

module.exports.accountingSchema = accountingSchema; //Export accountingSchema so that models.js can access it.