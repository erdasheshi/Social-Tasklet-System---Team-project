var constants = require('../constants');

//do this for all the classes
var friendships = require('../classes/FriendshipTransaction');
var devices = require('../classes/DeviceAssignments');

//stores the updates in the database
function setUpdates(data, callback) {
  var updates = data.updates;
  //troubleshooting in case of empty updates
  if(updates != null && updates.length > 0){
    var processor = 0;

  for (var i = 0; i < updates.length; i++) {
      var data = JSON.parse(updates[i]);

  setUpdate({update : data}, function(err, data){
                if (err) return next(err);
       processor = processor + 1;

         if(processor == updates.length)
            {
            callback(null, true);
            }
            });
  }
}
//return callback, when there are no updates, so the process can proceed with the scheduling
   else {
   callback(null, true);
   }
}

//distributes the updates based on the update type
function setUpdate(data, callback){
var update = data.update;

       switch (update.type) {         //the data structure for friendships is different from the one for devices, therefore its tested the type before proceeding
            case constants.Friendship:
                setUpdate_Friendship({update : update}, function(err, data){
                if (err) return next(err);
                  else {  callback(null, true);}
                });
                break;
            case constants.Device:
                setUpdate_Device({update : update}, function(err, data){
                if (err) return next(err);
                  else {  callback(null, true);}
                });
                break;
        }
}

//stores all the friendship related updates
function setUpdate_Friendship(data, callback){
var update = data.update;
               if (update.key == "New") {        //create a new friendship transaction
                    var friendship = friendships.get({
                     ID: update.ID,
                     user_1: update.user_1,        //*** check that is sent only information related to the friend an not the user itself (its defined in the useername section)
                     user_2: update.user_2,
                    });
                    friendship.save(function (err, data) {
                        if (err) return next(err);
                           else {  callback(null, true);}
                    });
                }
                else if (update.key == "Deleted") {    //delete the existing transaction
                    friendships.deleteByID({ device: update.id }, function (err, data) {
                        if (err) return next(err);
                           else {  callback(null, true); }
                    });
                }
};

//stores all the device related updates
function setUpdate_Device(data, callback){
var update = data.update;
          var username = update.username;
                if (update.key == "New") {       //create new transaction
                    var device = devices.get({
                                 username: username,
                                 device: update.device,
                                 price: update.price ,
                                 status: update.status
                    });
                    device.save(function (err, data) {
                        if (err) return next(err);
                        else {  callback(null, true); }
                    });
                }
                else if (update.key == "Deleted") {  //delete the transaction
                    devices.deleteByID({ device: update.device }, function (err, data) {
                        if (err) return next(err);
                         else {  callback(null, true); }
                    });
                }
 };

module.exports = {
    setUpdates: function (updates, callback) {
        return setUpdates(updates, callback);
    }
};

