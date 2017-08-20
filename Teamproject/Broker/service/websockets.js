var taskletManager = require('./taskletManager');
var repClient = require('./replicationClient');
var constants = require('./../constants');
var devices = require('../classes/DeviceAssignments');

var io;

function initialize(server) {
    io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {
        var broker_id = 5;    //important in case of distributed - multiple brokers

        socket.on('SFInformation', function (data) {
            var updates = data.updates;
            var username = data.username;
            var taskletid = data.taskletid;
            var tasklet = require('./tasklet/tasklet');
            var further = data.further;

	repClient.setUpdates({updates: updates}, function(e, res){
	console.log("it comes in the websocket");
          if (e) ; console.error(e);
          //store the updates before proceeding
          if (further == true) { // Check if the user has enough money

              tasklet.preScheduling({taskletid: taskletid, username: username}, function (e, data) {
                  if (e) console.error(e);
              });
          }
          else{
              // Abort!!!
              tasklet.abortScheduling({taskletid: taskletid}, function (e, data) {
                  if (e) console.error(e);
       	});
       }
	});
        });

       //get daily updates
        socket.on('GlobalUpdate', function (data){
        var broker_id = data.broker;
        var updates = data.updates;
            //store the updates in the database
        	repClient.setUpdates({updates: updates}, function(e, res){
        	if (e) console.error(e);
        	callback(null, true);
        	});
        });
    });
}

function returnTaskletCycles(taskletid, providers){

io.sockets.emit('TaskletCyclesReturn', {taskletid: taskletid, providers: providers});

}

function activateDevice(data) {
    var device = data.device;
    io.sockets.emit('ActivateDevice', {
        device: device,
        status: constants.DeviceStatusActive
    });
}

function sendSFInformation(deviceID, taskletid, broker_id) {

    io.sockets.emit('SFInformation', {
        device: deviceID,
        taskletid: taskletid,
        broker: broker_id
    });
}

module.exports = {
    initialize: function (server) {
        return initialize(server);
    },

    activateDevice: function (data) {
        return activateDevice(data);
    },

    sendSFInformation: function (deviceID, taskletid, broker_id) {
        return sendSFInformation(deviceID, taskletid, broker_id)
    },
	
	returnTaskletCycles: function(taskletid, deviceID, computation){
		return returnTaskletCycles(taskletid, deviceID, computation)
	}
}