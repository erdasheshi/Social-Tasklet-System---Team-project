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
    if(infos) infos.benchmark = benchmark;
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
    if (infos) infos.availableVMs = infos.availableVMs + 1;

    // Demonstrating purposes
    console.log(provider.toObject());
}

function decreaseAvailableVMs(address, usedVMS) {
    var infos = provider.get(address);
    if (infos)infos.availableVMs = infos.availableVMs - usedVMS;
    // Demonstrating purposes
    console.log(provider.toObject());
}

function getDeviceID(address) {
    var infos = provider.get(address);
    var deviceID;
    if (infos) deviceID = infos.deviceID;

    return deviceID;
}

function getAvailableVMs(address){
	var infos = provider.get(address);
    var availableVMs;
	if (infos) availableVMs = infos.availableVMs;

	return availableVMs;
}

function getProviderList(){
    return provider;
}

function getRangeBenchmark(callback){
	
	var minimum = 999999;
	var maximum = 0;
    var processed = 0;
	
	provider.forEach(function (current, index, array) {

        if (minimum > current.benchmark) {
            minimum = current.benchmark;
        }

        if (maximum < current.benchmark) {
            maximum = current.benchmark;
        }

        processed += 1;

        if(processed == array.length){
            if(callback) callback(null,{maxBenchmark: maximum, minBenchmark: minimum});
        }


    });
}


function addDummyData(){
    insertProvider('111.111.111.111', 1);
    insertProvider('111.111.111.112', 2);
    insertProvider('111.111.111.113', 3);
    insertProvider('111.111.111.114', 4);

    increaseAvailableVMs('111.111.111.111');
    increaseAvailableVMs('111.111.111.111');
    increaseAvailableVMs('111.111.111.111');
    increaseAvailableVMs('111.111.111.111');
    increaseAvailableVMs('111.111.111.111');

    increaseAvailableVMs('111.111.111.112');
    increaseAvailableVMs('111.111.111.112');
    increaseAvailableVMs('111.111.111.112');
    increaseAvailableVMs('111.111.111.112');
    increaseAvailableVMs('111.111.111.112');

    increaseAvailableVMs('111.111.111.113');
    increaseAvailableVMs('111.111.111.113');
    increaseAvailableVMs('111.111.111.113');
    increaseAvailableVMs('111.111.111.113');
    increaseAvailableVMs('111.111.111.113');

    increaseAvailableVMs('111.111.111.114');
    increaseAvailableVMs('111.111.111.114');
    increaseAvailableVMs('111.111.111.114');
    increaseAvailableVMs('111.111.111.114');
    increaseAvailableVMs('111.111.111.114');

    updateBenchmark('111.111.111.111', 1);
    updateBenchmark('111.111.111.112', 2);
    updateBenchmark('111.111.111.113', 3);
    updateBenchmark('111.111.111.114', 4);

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

    decreaseAvailableVMs: function (address, usedVMS) {
        return decreaseAvailableVMs(address, usedVMS)
    },

    getDeviceID: function (address) {
        return getDeviceID(address)
    },
	
	getAvailableVMs: function (address) {
        return getAvailableVMs(address)
    },

    getProviderList: function() {
        return getProviderList();
    },

    getRangeBenchmark: function(callback){
        return getRangeBenchmark(callback);
    },

    addDummyData: function(){
	    return addDummyData();
    }
};