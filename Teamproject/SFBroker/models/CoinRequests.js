
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var coinRequestSchema = new Schema({ //This is where coinRequestSchema is defined.
    requestid: String,
    userid: String,
    requestedCoins: Number,
    approval: String
});

module.exports.coinRequestSchema = coinRequestSchema; //Export Schema so that models.js can access it.
