var constants = require('../constants');

//do this for all the classes
var friendships = require('../classes/FriendshipTransaction');
var devices = require('../classes/DeviceAssignments');

//stores the updates in the database
function setUpdates(updates, callback) {

    console.log("Number of received updates :  " + updates.length);
    for (var i = 0; i < updates.length; i++) {
        var data = JSON.parse(updates[i]);

        switch (data.type) {         //the data structure for friendships is different from the one for devices, therefore its tested the type before proceeding
            case constants.Friendship:
                if (data.key == "New") {        //create a new friendship transaction
                    var friendship = friendships.get({
                     ID: data.ID,
                     user_1: data.user_1,        //*** check that is sent only information related to the friend an not the user itself (its defined in the useername section)
                     user_2: data.user_2,
                    });
                    friendship.save(function (err, post) {
                        if (err) return next(err);
                    });
                }
                else if (data.key == "Deleted") {    //delete the existing transaction
                    friendships.deleteByID({ device: data.id }, function (err, data) {
                        if (err) return next(err);
                    });
                }
                break;
            case constants.Device:
                var username = data.username;
                if (data.key == "New") {       //create new transaction
                    var device = devices.get({
                                 username: username,
                                 device: data.device,
                                 price: data.price ,
                                 status: data.status
                    });
                    device.save(function (err, post) {
                        if (err) return next(err);
                    });
                }
                else if (data.key == "Deleted") {  //delete the transaction
                    devices.deleteByID({ device: data.device }, function (err, data) {
                        if (err) return next(err);
                    });
                }
                break;
        }
    }
}

module.exports = {
    setUpdates: function (updates, callback) {
        return setUpdates(updates, callback);
    }
};