var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var brokerSchema = new Schema({ //This is where accountingSchema is defined.
    username: String,
    broker: String
});

module.exports = mongoose.model('brokers', brokerSchema);
