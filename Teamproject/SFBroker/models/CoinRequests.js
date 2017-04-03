
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var coinRequestSchema = new Schema({ //This is where coinRequestSchema is defined.
    userid: String,
    requestedCoins: Number,
    approval: Boolean
});

module.exports.coinRequestSchema = coinRequestSchema; //Export Schema so that models.js can access it.
