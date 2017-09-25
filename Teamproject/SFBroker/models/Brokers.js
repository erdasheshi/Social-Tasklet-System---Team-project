var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var brokerSchema = new Schema({
    username: String,
    broker: String
});

module.exports = mongoose.model('brokers', brokerSchema);
