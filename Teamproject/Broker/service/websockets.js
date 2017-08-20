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
            var username = data.username;
            var taskletid = data.taskletid;
            var tasklet = require('./tasklet/tasklet');
			repClient.setUpdates(data.updates);

            //store the updates before proceeding
            if (data.further == true) { // Check if the user has enough money
			
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