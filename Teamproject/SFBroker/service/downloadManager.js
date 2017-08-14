const fse = require('fs-extra');
var conf = require('../config.json');

var fs = require('fs');
var archiver = require('archiver');

const source = conf.sfbroker.download.source + "config.txt";
const destination = conf.sfbroker.download.destination + "config.txt";


function provideDownload(data, callback) {
    var deviceID = data.id;
    copyFile(source, destination, function (err, data) {
        var line = '\nDevice_ID: ' + deviceID;
        fse.appendFileSync(destination, line);
        zipTasklet({}, function (err, data) {
            if (err) callback(err, null);
            callback(null, {destination: conf.sfbroker.download.source + "/TaskletMiddleware.zip" });
        });
    });
}


function copyFile(src, dest, callback) {
    fse.copy(src, dest, function (err, data) {
        if (err) {
            console.error(err);
        }
        if (callback) callback(null, destination);
    })
}

function zipTasklet(data, callback) {
    var output = fs.createWriteStream(conf.sfbroker.download.source + '/TaskletMiddleware.zip');
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