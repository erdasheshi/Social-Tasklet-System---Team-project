
var net = require('net');
var conf  = require('./../../config.json');
var pH 	= require('./protocolHeader');
var providerList 	= require('./providerList');
var taskletList 	= require('./taskletList');
var constants = require('./../../constants');
var uuidV1 = require('uuid/v1');

var devices = require('./../../classes/DeviceAssignments');
var web = require('./../websockets');
var taskletManager = require('./../taskletManager');

var taskletSocket;

// Socket Request
var server_request = net.createServer(function(socket) {

    taskletSocket = socket;

    socket.on('error', function (exc) {
        console.log("Ignoring exception: " + exc);
    });

    socket.on('data', function(data) {

        var messageType = pH.readProtocolHeader(data);

        if(messageType < 0){
            console.log('Invalid message');
        }

        // Step 1: Receiving Tasklet Request
        if(messageType == constants.bRequestMessage){

            var taskletid = uuidV1();
            var broker_id = 5; //important in case of distributed - multiple brokers

            var isRemote = data.readInt32LE(12);
            var requestedNumber = data.readInt32LE(16);
            var requestedInstances = data.readInt32LE(20);
            var minimumSpeed = data.readFloatLE(24);
            var requestingIP = data.readInt32LE(28);
            var cost = data.readInt32LE(32);
            var privacy = data.readInt32LE(36);

            requestingIP = socket.remoteAddress;
            var deviceID = providerList.getDeviceID(requestingIP);

            taskletList.insertTasklet(taskletid, broker_id, deviceID, isRemote, requestedNumber, requestedInstances, minimumSpeed, requestingIP, cost, privacy);

            //Step 2: Sending information request to SFBroker
            web.sendSFInformation(deviceID, taskletid, broker_id);

            console.log('Remote: ' + isRemote + ' Number: ' + requestedNumber + ' Instances: ' + requestedInstances + ' Minimum Speed: ' + minimumSpeed + ' Requesting IP: ' + requestingIP + ' Cost: ' + cost + ' Privacy: ' + privacy);



        }

        else if(messageType != constants.bRequestMessage){
            console.log('Received a wrong message type in tasklet data');
        }

    });

    socket.on('close', function(data) {

    });
});

server_request.listen(conf.tasklet.port, conf.tasklet.ip);

function preScheduling(data, callback){

    var information = taskletList.getTasklet(data.taskletid);

    //Step 4: Finding most suitable provider
    taskletManager.scheduling(information, function (error, data) {
        if (error) console.error(error);

        // Step 5: Informing the consumer
        var buf1 = pH.writeProtocolHeader(constants.bResponseMessage);
        var buf2 = Buffer.alloc(4);
        var buf3 = Buffer.alloc(8);


        buf3.writeInt32LE(data.address,0);
        buf3.writeInt32LE(1,4);

        buf2.writeInt32LE(buf3.length, 0);

        var totalLength = buf1.length + buf2.length + buf3.length;
        var buf = Buffer.concat([buf1,buf2, buf3],totalLength);


        taskletSocket.write(buf);
        taskletSocket.end();

    });

};

function abortScheduling(data, callback){
    console.error('The requesting user does not have enough money!');
}



module.exports = {
    preScheduling: function (data, callback) {
        return preScheduling(data, callback);
    },
    abortScheduling : function (data, callback) {
        return abortScheduling(data, callback);
    }
}