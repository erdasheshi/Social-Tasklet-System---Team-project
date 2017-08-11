const fs = require('fs-extra');
var conf = require('../config.json');
const source = conf.sfbroker.download.source;
const destination = conf.sfbroker.download.destination;


function provideDownload(data, callback) {
    copyFile(source, destination);
    var line = '\nDevice: ' + data.id;
    fs.appendFileSync(destination, line);
    callback(null, { destination : destination } );
}


function copyFile(src, dest, callback) {
    console.log(src);
    console.log(dest);
    fs.copy(src, dest, function (err, data) {
        if (err) {
            callback(err, false);
        }
        if (callback) callback(null, destination);
    })
}

module.exports = {
    provideDownload: function (data, callback) {
        return provideDownload(data, callback);
    }
}