var Map = require("collections/map");
var device = require('./../../classes/DeviceAssignments');
var constants = require('./../../constants');
var websockets = require('./../websockets');

var provider = new Map();

function insertProvider(address, deviceID) {
    var lastHeartbeat = Math.round(new Date().getTime() / 1000);

    //IP was found in the collection
    if (provider.has(address)) {
        var infos = provider.get(address);
        infos.lastHeartbeat = lastHeartbeat;
        // Demonstrating purposes
        console.log(provider.toObject());
    }

    //IP was not found in the collection
    else {
        var availableVMs = 0;
        var benchmark = 999;

        var deviceID = deviceID;
        device.findByID({}, function (err, data) {
            if (err) console.error(err);
            if (data == null || data.status == constants.DeviceStatusInactive) {
                websockets.activateDevice({ device: deviceID });
            }
        });

        provider.add({
            deviceID: deviceID,
            lastHeartbeat: lastHeartbeat,
            availableVMs: availableVMs,
            benchmark: benchmark
        }, address);
        // Demonstrating purposes
        console.log(provider.toObject());
    }
}
function updateBenchmark(address, benchmark) {
    var infos = provider.get(address);
    infos.benchmark = benchmark;
    // Demonstrating purposes
    console.log(provider.toObject());
}

function updateProviderList() {
    var time = Math.round(new Date().getTime() / 1000);

    provider.forEach(function (current, address) {

        if ((time - current.lastHeartbeat) > 10) {
            provider.delete(address);
        }
    });

    setTimeout(updateProviderList, 2000);
}


function increaseAvailableVMs(address) {
    var infos = provider.get(address);
    infos.availableVMs = infos.availableVMs + 1;
    // Demonstrating purposes
    console.log(provider.toObject());
}

function decreaseAvailableVMs(address) {
    var infos = provider.get(address);
    infos.availableVMs = infos.availableVMs - 1;
    // Demonstrating purposes
    console.log(provider.toObject());
}

function getDeviceID(address) {
    var infos = provider.get(address);
    var deviceID = infos.deviceID;

    return deviceID;
}

module.exports = {

    insertProvider: function (address, deviceID) {
        return insertProvider(address, deviceID);
    },

    updateBenchmark: function (address, benchmark) {
        return updateBenchmark(address, benchmark);
    },

    updateProviderList: function () {
        return updateProviderList();
    },

    increaseAvailableVMs: function (address) {
        return increaseAvailableVMs(address)
    },

    decreaseAvailableVMs: function (address) {
        return decreaseAvailableVMs(address)
    },

    getDeviceID: function (address) {
        return getDeviceID(address)
    }
};