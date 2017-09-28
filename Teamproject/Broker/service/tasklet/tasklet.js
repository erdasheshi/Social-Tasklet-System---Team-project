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

var Map = require("collections/map");

var taskletSockets = new Map();

// Socket Request
var server_request = net.createServer(function (socket) {

    taskletSocket = socket;
    var socketIdentifier = socket.remoteAddress + ":" + socket.remotePort;

    socket.on('error', function (exc) {
        console.log("Ignoring exception: " + exc);
    });

    socket.on('data', function (data) {
        console.log(data);

        var taskletRequest = Buffer.alloc(0);
        var socketIdentifier = socket.remoteAddress + ":" + socket.remotePort;

        // Check for sufficient length of data
        if (data.length == 40) {
            taskletRequest = data;
            if (taskletSockets.has(socketIdentifier)) tasklet.delete(socketIdentifier);
        }
        // Glue data to existing data and check, if it is now long enough.
        else {
            if (taskletSockets.has(socketIdentifier)) {
                var tmpData = taskletSockets.get(socketIdentifier)
                var taskletLength = tmpData.data.length + data.length;
                taskletRequest = Buffer.concat([tmpData.data, data], taskletLength);
            }
            else {
                taskletSockets.add({
                    data: data
                }, socketIdentifier);
            }
        }

        // interpret tasklet Request
        if (taskletRequest.length == 40) {

            pH.readProtocolHeader(taskletRequest, function (err, data) {

                var messageType = data;

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
                    var speed = taskletRequest.readFloatLE(24);
                    var requestingIP = taskletRequest.readInt32LE(28);
                    var cost = taskletRequest.readInt32LE(32);
                    var privacy = taskletRequest.readInt32LE(36);

                    requestingIP = socket.remoteAddress;
                    var deviceID = providerList.getDeviceID(requestingIP);

                    taskletList.insertTasklet(taskletid, broker_id, deviceID, isRemote, requestedNumber, requestedInstances, speed, requestingIP, cost, privacy);
                    //Step 2: Sending information request to SFBroker
                    web.sendSFInformation(deviceID, taskletid, broker_id);

                    console.log('Remote: ' + isRemote + ' Number: ' + requestedNumber + ' Instances: ' + requestedInstances + ' Speed: ' + speed + ' Requesting IP: ' + requestingIP + ' Cost: ' + cost + ' Privacy: ' + privacy);

                }

                else if (messageType != constants.bRequestMessage) {
                    console.log('Received a wrong message type in tasklet data');
                }
                taskletRequest = Buffer.alloc(0);
            });
        }
        // received too much data --> something went wrong.
        else if (taskletRequest.length > 40) {
        }

    });

    socket.on('close', function (data) {

    });
});

server_request.listen(conf.tasklet.port, conf.tasklet.ip);
// collect data for scheduling, call scheduling and return result to SFBroker & Tasklet Middleware.
function preScheduling(data, callback) {
    var username = data.username;
    var taskletid = data.taskletid;
    providerList.getRangeBenchmark(function (err, data) {
        if (err) console.error(err);
        var maxBenchmark = data.maxBenchmark;
        var minBenchmark = data.minBenchmark;

        devices.findPriceRange(function (err, data) {
            if (err) console.error(err);
            var minPrice = data.min;
            var maxPrice = data.max;

            taskletList.getTasklet(taskletid, function (err, data) {
                //Step 4: Finding most suitable provider
                var information = data;
                var taskletManager = require('./../taskletManager');
                taskletManager.scheduling({
                    information: information,
                    username: username,
                    minBenchmark: minBenchmark,
                    maxBenchmark: maxBenchmark,
                    minPrice: minPrice,
                    maxPrice: maxPrice
                }, function (error, data) {
                    if (error) console.error(error);
                    var schedulingResult = data;
                    var buf;
                    // Step 5: Informing the consumer
                    pH.writeProtocolHeader(constants.bResponseMessage, function (e, data) {

                        var buf1 = data;
                        var buf2 = Buffer.alloc(4);
                        buf2.writeInt32LE(schedulingResult.length, 0);

                        var providers = [];
                        // If at least one provider was found
                        if (schedulingResult.length > 0) {

                            var length = schedulingResult.length * 8;
                            var buf3 = Buffer.alloc(length);

                            for (var i = 0; i < schedulingResult.length; i++) {

                                var str = schedulingResult[i].ip.split(".");
                                console.log("Requested IPs: " + schedulingResult[i].ip);

                                buf3.writeInt32LE(str[0], 0);
                                buf3.writeInt32LE(str[1], 1);
                                buf3.writeInt32LE(str[2], 2);
                                buf3.writeInt32LE(str[3], 3);

                                buf3.writeInt32LE(schedulingResult[i].vms, 4);
                            }

                            var totalLength = buf1.length + buf2.length + buf3.length;
                            buf = Buffer.concat([buf1, buf2, buf3], totalLength);

                            for (var i = 0; i < schedulingResult.length; i++) {

                                var device = providerList.getDeviceID(schedulingResult[i].ip);
                                var price = schedulingResult[i].price;
                                // default because there is no responds from the provider!
                                var computation = 1;
                                //calculate the computation cost
                                var cost = computation * price;
                                providers = providers.concat({device: device, cost: cost});
                            }

                        }
                        // In case none provider was found
                        else {

                            var totalLength = buf1.length + buf2.length;
                            buf = Buffer.concat([buf1, buf2], totalLength);
                        }

                        taskletSocket.write(buf, function (err) {
                            taskletSocket.end();

                        });
                        console.log('TaskletID: ' + taskletid);
                        web.returnTaskletCycles(taskletid, providers);

                        taskletList.deleteTasklet(taskletid);
                    });
                });
            });
        });
    });

};

function abortScheduling(data, callback) {

    var taskletid = data.taskletid;

    // Step 5: Informing the consumer of the unsuccessful request (reason: not enough coins)

    pH.writeProtocolHeader(constants.bResponseMessage, function (e, data) {

        var buf1 = data;
        var buf2 = Buffer.alloc(4);
        buf2.writeInt32LE(0, 0);

        var totalLength = buf1.length + buf2.length;
        var buf = Buffer.concat([buf1, buf2], totalLength);

        taskletSocket.write(buf, function (err) {
            taskletSocket.end();
        });

        taskletList.deleteTasklet(taskletid);

        console.error('The requesting user does not have enough money!');
    });
}


module.exports = {
    preScheduling: function (data, callback) {
        return preScheduling(data, callback);
    },
    abortScheduling: function (data, callback) {
        return abortScheduling(data, callback);
    }
}