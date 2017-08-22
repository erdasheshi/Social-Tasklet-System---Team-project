var constants = require('../constants');
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
var mongoose = require('mongoose');
var uuidV1 = require('uuid/v1');

// device schema/model
var Devices = require('../models/Devices.js');
var Device = mongoose.model("Device", Devices.deviceSchema); //This creates a Device model.

var replicationManager = require('./../replication/replicationManager');

//Initializing a transaction
function DeviceAssignments(data) {
    this.device = data.device,
    this.name = data.name,
    this.username = data.username,
    this.price = data.price,
    this.status = data.status
}

//creates a new database entry or updates the existing ones
DeviceAssignments.prototype.save = function (callback) {
    var tmpDevice = this;

    Device.findOne({'device': tmpDevice.device}, function (e, udata) {
        //if there was no entry found then create it
        if (udata == null) {
            if (tmpDevice.device) {
                var device = new Device(tmpDevice);
                device.save({}, function (error, data) {
                    if (error) {
                        console.error(error);
                    }
                    if (callback) {
                        replicationManager.CollectUpdates({
                            username: tmpDevice.username,
                            device: tmpDevice.device,
                            status: tmpDevice.status,
                            price: tmpDevice.price,
                            key: constants.Device
                        }, function (err, res) {
                                      if (callback) callback(null, true);
                                     });
                    }
                });
            }
            else {
                generateDeviceID({}, function (e, data) {
                    tmpDevice.device = data;
                    var device = new Device(tmpDevice);
                    device.save({}, function (error, data) {
                        if (error) {
                            console.error(error);
                        }
                        if (callback) {
                            replicationManager.CollectUpdates({
                                username: tmpDevice.username,
                                device: tmpDevice.device,
                                status: tmpDevice.status,
                                price: tmpDevice.price,
                                key: constants.Device
                            }, function (err, res) {
                                          if (callback) callback(null, true);
                                         });
                        }
                    });
                });
            }
        }
        //an entry was found, therefore update it with the new values
        else {
            Device.update({'device': tmpDevice.device},
                {name: tmpDevice.name, username: tmpDevice.username, price: tmpDevice.price, status: tmpDevice.status},
                function (error, data) {
                    if (error) {
                        callback(error, false);
                    }
                    else if (callback) {
                        replicationManager.CollectUpdates({
                            username: tmpDevice.username,
                            device: tmpDevice.device,
                            status: tmpDevice.status,
                            price: tmpDevice.price,
                            key: constants.Device
                        }, function (err, res) {
                                      if (callback) callback(null, true);
                                     });
                    }
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
        if (callback) callback(null, obj);
    });
}

//delete the single entry that matches the given ID
function deleteByID(data, callback) {
    var device = data.device;
    var username = data.username;

    Device.remove({'device': device}, function (err, obj) {
        if (err) console.error(err, null);
        else {
            replicationManager.CollectUpdates({
                device: device,
                key: 'd_device',
                username: username
            }, function (err, res) {
             if (callback) callback(null, true);
            });
        }
    });
}

//delete the entries that belong to a certain user
function deleteByUser(data, callback) {
    var username = data.username;

    Device.find({'username': username}, function (e, res) {
    if (e) callback(e, null);

    if(res.length > 0){
        res.forEach(function (data, index, array) {
            var device = data.device;
            deleteByID({device: device, username: username}, function (e, data) {
                if (e) callback(e, null);
            });
        });
        }
        callback(null, true);
    });
}

//generate an ID for newly registered devices
function generateDeviceID(data, callback) {
    Device.findOne()
        .sort('-device')
        .exec(function (err, doc) {
            if (doc) {
                var result = doc.device + 1;
                callback(null, result);
            }
            else {
                callback(null, 1);
            }
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

    findAll: function (callback) {
        return findAll(callback);
    },

    findByID: function (data, callback) {
        return findByID(data, callback);
    },

    deleteByID: function (data, callback) {
        return deleteByID(data, callback);
    },

    deleteByUser: function (data, callback) {
        return deleteByUser(data, callback);
    },

    generateDeviceID: function (data, callback) {
        return generateDeviceID(data, callback);
    }
}
