const fs = require('fs-extra');

function downloadManager(data) {
    this.source = '../SFBroker/download/config.txt';
    this.destination = '../SFBroker/download/MiddlewareExecutable/config.txt';
}

downloadManager.prototype.provideDownload = function(data, callback){
    copyFile(this.source, this.destination);
    fs.appendFileSync(this.destination, data.append);
    return this.destination;
}


function copyFile(src, dest, callback) {

    fs.copy(src, dest, err => {
        if(err){
            callback(err, false);
        }
        if(callback) callback(null, true);
})
}

module.exports = downloadManager;