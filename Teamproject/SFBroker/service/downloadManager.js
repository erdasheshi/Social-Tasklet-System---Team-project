var conf = require('../config.json');

var fs = require('fs');
var archiver = require('archiver');
var broker = require('./../classes/Broker');

const destination = conf.sfbroker.download.destination + "config.txt";


function provideDownload(data, callback) {
    var deviceID = data.id;

    var configStream = fs.createWriteStream(destination);
    broker.findByUser({username: data.username}, function (e, data) {
        // CONTINUE HERE WITH Broker distribution!

        configStream.write(new Buffer("IP_Responder: " + conf.broker.ip + "\n"));
        configStream.write(new Buffer("Tasklet_Monitor: " + conf.broker.ip + "\n"));
        configStream.write(new Buffer("Number_of_TVMs: -1\n"));
        configStream.write(new Buffer("Timeout: 4\n"));
        configStream.write(new Buffer("Device_ID: " + deviceID + "\n"));

        zipTasklet({device : deviceID }, function (err, data) {
            if (err) callback(err, null);
            callback(null, {destination: conf.sfbroker.download.source + '/TaskletMiddleware' + deviceID + '.zip'});
        });
    });
}

function zipTasklet(data, callback) {
    var output = fs.createWriteStream(conf.sfbroker.download.source + '/TaskletMiddleware' + data.device + '.zip');
    var archive = archiver('zip', {
        zlib: {level: 9} // Sets the compression level.
    });


// listen for all archive data to be written
    output.on('close', function () {
        if (callback) callback(null, null);
    });

// good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.error(err);
        } else {
            throw err;
        }
    });

// good practice to catch this error explicitly
    archive.on('error', function (err) {
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    archive.directory(conf.sfbroker.download.destination, false);

    archive.finalize();
}

module.exports = {
    provideDownload: function (data, callback) {
        return provideDownload(data, callback);
    }
}