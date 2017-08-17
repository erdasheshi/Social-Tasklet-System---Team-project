var net = require('net');
var conf = require('./../../config.json');
var pH = require('./protocolHeader');
var providerList = require('./providerList');
var taskletList = require('./taskletList');
var constants = require('./../../constants');
var uuidV1 = require('uuid/v1');

var devices = require('./../../classes/DeviceAssignments');
var web = require('./../websockets');
var taskletManager = require('./../taskletManager');

var taskletSocket;
var taskletRequest = Buffer.alloc(0);

// Socket Request
var server_request = net.createServer(function (socket) {

    taskletSocket = socket;

    socket.on('error', function (exc) {
        console.log("Ignoring exception: " + exc);
    });

    socket.on('data', function (data) {
        console.log(data);

        if (data.length == 40) {
            taskletRequest = data;
        }
        else {
            var taskletLength = taskletRequest.length + data.length;
            taskletRequest = Buffer.concat([taskletRequest, data], taskletLength);
        }

        if (taskletRequest.length == 40) {

            var messageType = pH.readProtocolHeader(taskletRequest);

            if (messageType < 0) {
                console.log('Invalid message');
            }

            // Step 1: Receiving Tasklet Request
            if (messageType == constants.bRequestMessage) {

                var taskletid = uuidV1();
                var broker_id = 5; //important in case of distributed - multiple brokers

                var isRemote = taskletRequest.readInt32LE(12);
                var requestedNumber = taskletRequest.readInt32LE(16);
                var requestedInstances = taskletRequest.readInt32LE(20);
                var minimumSpeed = taskletRequest.readFloatLE(24);
                var requestingIP = taskletRequest.readInt32LE(28);
                var cost = taskletRequest.readInt32LE(32);
                var privacy = taskletRequest.readInt32LE(36);

                requestingIP = socket.remoteAddress;
                var deviceID = providerList.getDeviceID(requestingIP);

                taskletList.insertTasklet(taskletid, broker_id, deviceID, isRemote, requestedNumber, requestedInstances, minimumSpeed, requestingIP, cost, privacy);
                //Step 2: Sending information request to SFBroker
                web.sendSFInformation(deviceID, taskletid, broker_id);

                console.log('Remote: ' + isRemote + ' Number: ' + requestedNumber + ' Instances: ' + requestedInstances + ' Minimum Speed: ' + minimumSpeed + ' Requesting IP: ' + requestingIP + ' Cost: ' + cost + ' Privacy: ' + privacy);


            }

            else if (messageType != constants.bRequestMessage) {
                console.log('Received a wrong message type in tasklet data');
            }
            taskletRequest = Buffer.alloc(0);
        }
        else if (taskletRequest.length > 40) {
            taskletRequest = Buffer.alloc(0);
        }

    });

    socket.on('close', function (data) {

    });
});

server_request.listen(conf.tasklet.port, conf.tasklet.ip);

function preScheduling(data, callback) {

    var information = taskletList.getTasklet(data.taskletid);

    //Step 4: Finding most suitable provider
    taskletManager.scheduling(information, function (error, data) {
        if (error) console.error(error);

        var buf;
        // Step 5: Informing the consumer
        var buf1 = pH.writeProtocolHeader(constants.bResponseMessage);

        var buf2 = Buffer.alloc(4);
        buf2.writeInt32LE(data[0].number, 0);

        // If at least one provider was found
        if (data[0].number > 0) {

            var length = data[0].number * 8;
            var buf3 = Buffer.alloc(length);

            for (var i = 1; i < data[0].number + 1; i++) {

                var str = data[i].ip.split(".");

                buf3.writeInt32LE(str[0], 0);
                buf3.writeInt32LE(str[1], 1);
                buf3.writeInt32LE(str[2], 2);
                buf3.writeInt32LE(str[3], 3);

                buf3.writeInt32LE(data[i].vms, 4);
            }

            var totalLength = buf1.length + buf2.length + buf3.length;
            buf = Buffer.concat([buf1, buf2, buf3], totalLength);

        }
        // In case none provider was found
        else {

            var totalLength = buf1.length + buf2.length;
            buf = Buffer.concat([buf1, buf2], totalLength);
        }

        taskletSocket.write(buf);
        taskletSocket.end();

        taskletList.deleteTasklet(information.taskletid);

    });

};

function abortScheduling(data, callback) {

    // Step 5: Informing the consumer of the unsuccessful request (reason: not enough coins)
    var buf1 = pH.writeProtocolHeader(constants.bResponseMessage);

    var buf2 = Buffer.alloc(4);
    buf2.writeInt32LE(0, 0);

    var totalLength = buf1.length + buf2.length;
    var buf = Buffer.concat([buf1, buf2], totalLength);

    taskletSocket.write(buf);
    taskletSocket.end();

    taskletList.deleteTasklet(data.taskletid);

    console.error('The requesting user does not have enough money!');
}


module.exports = {
    preScheduling: function (data, callback) {
        return preScheduling(data, callback);
    },
    abortScheduling: function (data, callback) {
        return abortScheduling(data, callback);
    }
}