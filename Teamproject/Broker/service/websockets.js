express = require('express');
app = express();

var taskletManager = require('./taskletManager');
var repClient = require('./replicationClient');
var uuidV1 = require('uuid/v1');
var constants = require('./../constants');


var devices = require('../classes/DeviceAssignments');

//websocket
server = require('http').createServer(app);

module.exports = function (server) {
    var io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {
        var taskletid, username;
        var broker_id = 3;    //important in case of distributed - multiple brokers
        var address = socket.request.connection;
        console.log('New connection from ' + address.remoteAddress + ':' + address.remotePort);

        //Connecting new Consumer/Provider with Broker
        socket.on('event', function (data) {
            console.log('New Entity online');
        });

        // Step 1: Handle Tasklet request
        socket.on('TaskletSendBroker', function (data) {
            // Creating Tasklet ID
            var taskletid = uuidV1();
            console.log(data.name + "  username  " + taskletid + " id " + data.cost + " tasklet request info");

            // Step 1: Illustrating the Tasklet request
            io.sockets.emit('ShowTaskletRequest', {
                zeit: new Date(),
                username: data.username,
                taskletid: taskletid,
                cost: data.cost,
                privacy: data.privacy,
                speed: data.speed,
                reliability: data.reliability
            });

            // Step 2: Information request to SFBroker
            io.sockets.emit('SFInformation', {
                zeit: new Date(),
                username: data.username,
                taskletid: taskletid,
                cost: data.cost,
                privacy: data.privacy,
                speed: data.speed,
                reliability: data.reliability,
                broker: broker_id
            });

        });

        socket.on('SFInformation', function (data) {
            var username = data.username;
            var taskletid = data.taskletid;

            //store the updates before proceeding
            repClient.setUpdates(data.updates);

            if (data.further == 'yes') { // Check if the user has enough money

                //Step 4: Finding most suitable provider                           //***update if needed (based on the whole scheduling idea)
                taskletManager.scheduling({
                    username: username,
                    cost: tasklet_data.cost,
                    reliability: tasklet_data.reliability,
                    speed: tasklet_data.speed,
                    privacy: data.privacy
                }, function (error, data) {
                    if(error) console.error(error);
                    io.sockets.emit('ShowProviderInformation', {
                        zeit: new Date(),
                        username: username,
                        taskletid: taskletid,
                        provider: data.provider,
                        potentialProvider: data.potentialProvider
                    });
                });
            }
            else {
                // If balance not sufficient, inform the Consumer about the cancellation
                io.sockets.emit('CancelTasklet', {
                    consumer: data.username, taskletid: data.taskletid
                });
            }
        });

        // Steps 9 & 10: Receiving notification including the consumed time from Provider's device and sending this to the SFBroker
        socket.on('TaskletCyclesReturn', function (data) {   // it will capture the information
            io.sockets.emit('SendTaskletResultToConsumer', data);   //****needs to be removed...consumer send data directly to provider
            var computation = data.computation;
            var device = data.device;
            var taskletid = data.taskletid;
            //get the price of the provider's device and calculate the computation cost
            devices.findByID({device: device}, function (err, data) {
                var price = data.price;
                var cost = computation * price;
                io.sockets.emit('TaskletCyclesReturn', {cost: cost, taskletid: taskletid, device: device});
            });
        });
        // Step 6: Provider gets Tasklets
        socket.on('SendingTaskletToProvider', function (data) {
            io.sockets.emit('SendingTaskletToProvider', data);
        });



      /*        device.findByStatus({status: 'inactive'}, function (err, data) {


        data.forEach(function (data, index, array) {
           //****relate to the heartbeat--- check device
           if(){
           io.sockets.emit('ActivateDevice', {
                device: device,
                status: 'active'
           });
           }
        });
        });
    });*/
});
}