var constants = require('../constants');

//do this for all the classes
var friendships = require('../classes/FriendshipTransaction');
var devices = require('../classes/DeviceAssignments');

//stores the updates in the database
function setUpdates(updates, callback) {

    console.log("the function is called " + updates.length);
    for (var i = 0; i < updates.length; i++) {
        var data = JSON.parse(updates[i]);

        switch (data.type) {         //the data structure for friendships is different from the one for devices, therefore its tested the type before proceeding
            case constants.Friendship:
                if (data.status == "Confirmed") {        //create a new friendship transaction

                    var friendship = friendships.get({
                        user_1: req.user.username,
                        user_2: req.body.user,
                        status: req.body.status
                    });

                    friendship.save(function (err, post) {
                        if (err) return next(err);
                        res.json(post);
                    });
                }
                else if (data.status == "Delete") {    //delete the existing transaction

                    friendshipTransaction.deleteByUsers({ id: data.id }, function (err, data) {
                        if (err) return next(err);
                        res.json('true');
                    });

                }
                break;
            case constants.Device:
                var username = data.username;
                if (data.key == "New") {       //create new transaction
                    var device = devices.get({
                        name: req.body.name,
                        device: req.body.device,
                        username: req.user.username,
                        status: constants.DeviceStatusInactive,
                        price: req.body.price
                    });
                    device.save(function (err, post) {
                        if (err) return next(err);
                        res.json(post);
                    });
                }
                else if (data.key == "Deleted") {  //delete the transaction

                    devices.deleteByID({ id: data.id }, function (err, data) {
                        if (err) return next(err);
                        res.json('true');
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