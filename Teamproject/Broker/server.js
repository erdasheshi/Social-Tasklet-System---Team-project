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

var tasklets = require('./service/tasklet_interface.js');
var websockets = require('./service/websockets');

websockets(server);

console.log('Broker runs on http://' + conf.broker.ip  + ':' + conf.broker.port + '/');