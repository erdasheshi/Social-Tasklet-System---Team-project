var taskletManager = require('./taskletManager');
var repClient = require('./replicationClient');
var constants = require('./../constants');
var devices = require('../classes/DeviceAssignments');



var io;

function initialize(server) {
    io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {
        var broker_id = 3;    //important in case of distributed - multiple brokers

        socket.on('SFInformation', function (data) {
            var username = data.username;
            var taskletid = data.taskletid;
            var tasklet = require('./tasklet/tasklet');
            //store the updates before proceeding
            repClient.setUpdates(data.updates);

            if (data.further == true) { // Check if the user has enough money

                tasklet.preScheduling({taskletid: taskletid, username: username}, function (e, data) {
                    if (e) console.error(e);
                });

            }
            else{
                // Abort!!! --> Add error handling if user does not have enough coins
                tasklet.abortScheduling();
            }
        });

        // Steps 9 & 10: Receiving notification including the consumed time from Provider's device and sending this to the SFBroker
        socket.on('TaskletCyclesReturn', function (data) {   // it will capture the information
            io.sockets.emit('SendTaskletResultToConsumer', data);   //****needs to be removed...consumer send data directly to provider
            var computation = data.computation;
            var device = data.device;
            var taskletid = data.taskletid;
            //get the price of the provider's device and calculate the computation cost
            devices.findByID({ device: device }, function (err, data) {
                var price = data.price;
                var cost = computation * price;
                io.sockets.emit('TaskletCyclesReturn', { cost: cost, taskletid: taskletid, device: device });
            });
        });
        // Step 6: Provider gets Tasklets
        socket.on('SendingTaskletToProvider', function (data) {
            io.sockets.emit('SendingTaskletToProvider', data);
        });

    });
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
    }
}