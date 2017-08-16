var express, app, server, io, conf, constants;
express = require('express');
app = express();
server = require('http').createServer(app);
io = require('socket.io').listen(server);
conf = require('./config.json');
constants = require('./constants');

// Webserver
server.listen(conf.broker.port);

// static files
app.use(express.static(__dirname + '/public'));

// if path / is called
app.get('/', function (req, res) {
	// index.html showing
	res.sendfile(__dirname + '/public/index.html');
});

// Prepare DB
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.connect('127.0.0.1:27018/Broker');
var mongodbAddress = 'mongodb://' + conf.broker.mongoDB.address + ':' + conf.broker.mongoDB.port  + '/' + conf.broker.mongoDB.database;
console.log(mongodbAddress);
mongoose.connect(mongodbAddress);

var db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function(callback){
    console.log("DB Connection Succeeded."); /* Once the database connection has succeeded, the code in db.once is executed. */
});

var tasklets = require('./service/tasklet_interface.js');
var websockets = require('./service/websockets');

websockets.initialize(server);

console.log('Broker runs on http://' + conf.broker.ip  + ':' + conf.broker.port + '/');