var constants = require('../constants');
var mongoose = require('mongoose');
var uuidV1 = require('uuid/v1');

// device schema/model
var Devices = require('../models/Devices.js');
var Device = mongoose.model("Device", Devices.deviceSchema); //This creates a Device model.

//Initializing a transaction
function DeviceAssignments(data) {
    this.device = data.device;
    this.username = data.username,
        this.price = data.price,
        this.status = data.status
}

//creates a new database entry or updates the existing ones
DeviceAssignments.prototype.save = function (callback) {

    var tmpDevice = this;
    Device.findOne({'device': tmpDevice.device}, function (e, udata) {
        //if no entry was not found, then create it
        if (udata == null) {

            var device = new Device(tmpDevice);
            device.save({}, function (error, data) {
                if (error) console.error(error);
                    callback(null, true);
            });
        }
        //an entry was found, therefore update it with the new values
        else {
            Device.update({'device': tmpDevice.device}, {
                    name: tmpDevice.name,
                    username: tmpDevice.username,
                    price: tmpDevice.price,
                    status: tmpDevice.status
                },
                function (error, data) {
                    if (error)   callback(error, false);
                        callback(null, true);
                });
        }
    });
}

//find all the entries in the database
function findAll(callback) {
    Device.find({}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

//find the entries that belong to a certain user
function findByUser(data, callback) {
    Device.find({'username': data.username}, function (e, data) {
        if (e) callback(e, null);
        callback(null, data);
    });
}

//find the single entry that matches the given ID
function findByID(data, callback) {
    var device = data.device;
    Device.findOne({'device': device}, function (err, obj) {
        if (err) callback(err, null);
       callback(null, obj);
    });
}

//find the entry that have the field "satus" set to data.status
function findByStatus(data, callback) {
    var status = data.status;
    Device.find({'status': status}, function (err, obj) {
        if (err) callback(err, null);
         callback(null, obj);
    });
}

//Find the lowest and highest price of the devices. Information used for normalizing price while scheduling
function findPriceRange(callback) {
    var min = 10000000000000000000000000000000000000000000000;
    var max = 0;
    var price;
    findAll(function (e, data) {
        var processed = 0;
        if (data.length > 0) {
            data.forEach(function (element, index, array) {

                price = element.price;
                if (price < min) {
                    min = price;
                }

                if (price > max) {
                    max = price;
                }

                processed += 1;

                if(processed == array.length){
                    callback(null, {min: min, max: max});
                }
            });

        }
        else {
            max = 0;
            min = 0;
            callback(null, {min: min, max: max});
        }
    });
}

//delete the single entry that matches the given ID
function deleteByID(data, callback) {
    var device = data.device;
    Device.remove({'device': device}, function (err, obj) {
        if (err) callback(err, null);
        callback(null, true);
    });
}

//delete the entries that belong to a certain user
function deleteByUser(data, callback) {
    var username = data.username;
    Device.remove({'username': username}, function (err, obj) {
        if (err) callback(err, null);
        callback(null, true);
    });
}

module.exports = {
    DeviceAssignments: DeviceAssignments,

    get: function (data) {
        return new DeviceAssignments(data);
    },

    findByUser: function (data, callback) {
        return findByUser(data, callback);
    },

    findByStatus: function (data, callback) {
        return findByStatus(data, callback);
    },

    findByID: function (data, callback) {
        return findByID(data, callback);
    },

    findAll: function (callback) {
        return findAll(callback);
    },

    findPriceRange: function (callback) {
        return findPriceRange(callback);
    },

    deleteByID: function (data, callback) {
        return deleteByID(data, callback);
    },

    deleteByUser: function (data, callback) {
        return deleteByUser(data, callback);
    }

}
