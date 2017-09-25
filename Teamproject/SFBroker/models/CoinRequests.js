
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var coinRequestSchema = new Schema({
    requestid: String,   //its unique for each entry
    username: String,
    requestedCoins: Number,
    approval: String     //the approval can be "false" or "true" when request is approved by the Admin
});

module.exports.coinRequestSchema = coinRequestSchema; //Export Schema so that models.js can access it.
