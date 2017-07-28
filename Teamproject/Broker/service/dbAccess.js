//require the relevant files and the data models
var constants = require('../constants');
var mongoose = require('mongoose');


var Friendships = require("../models/Friendships");
var Devices = require("../models/Devices");


var friendship = mongoose.model("Friendship", Friendships.friendshipSchema);
var device = mongoose.model("Device", Devices.deviceSchema);

/***************************************************************************************************************************
                                                         Find
****************************************************************************************************************************/

function findUser(data){    //find the user when given the device
    var result;
    result = device.findOne({ 'device' : data.device });
    return result
    }

function findDevice(data){
  var username = data.username;
  var result;
  switch (data.key) {
    case 'All':          //get all the existing devices
      result = device.find({}, {});
    break;
    case 'Device':      //get a single device
      result = device.find({ 'device' : data.device });
    break;
    case 'User':        //get user's devices
      result = device.find({ 'username' : username });
    break;
    }
    return result;
}

//get the friendship transactions
function findFriendship(data)
{   var result;
    switch(data.key) {
        case 'ID':      //search based on friendship transaction ID
            result = friendship.find();
            break;
        case 'User':       //search all the friends of a user
            result = friendship.find().where('status', constants.FriendshipStatusConfirmed).or([{'user_1': data.username}, {'user_2': data.username}]);
        break;
    }
    return result
}

/***************************************************************************************************************************
                                                         Remove
****************************************************************************************************************************/
//*** tested ***//
function removeDevice(data){
   switch(data.key) {
      case 'User':    //Removes all the devices of a user
            if (data.username != 'undefined')
            { device.remove({ 'username': data.username }, function(err, obj) { if (err) throw err; }) }
            break;
      case 'Device':  //remove one single device, depending on the ID
            if (data.Device != 'undefined')
            { device.remove({ 'device': data.device }, function(err, obj) { if (err) throw err; }) }
            break;
      default: ;
   }
}

function removeFriendship(data){
 console.log("call arrives" + data.id + "the id" + data.key + "the key" );
 var ID = data.id;

   switch(data.key) {
      case 'ID':            //*** might not be needed
            if (ID != 'undefined')
            { friendship.remove({ 'ID': ID }, function(err, obj) { if (err) throw err; }) }
            break;
      case 'User':            //delete all friendships assigned to a user
                if (data.user != 'undefined')
                { friendship.remove({$or: [{ 'user_1': data.username}, { 'user_2': data.username}]}, function(err, obj) { if (err) throw err; }) }
                break;
      case 'Friendship':    //remove the friendship transaction between user_1 and user_2
           if (user_1 != 'undefined' && user_2 != 'undefined')
           {
           friendship.remove({$or: [{ 'user_1': user_1, 'user_2': user_2 }, { 'user_2': user_1, 'user_1': user_2 }]},
           function(err, obj) { if (err) throw err; })
           }
           break;
      default: ;
   }
}

function removeUser(data){
var username = data.username;

if(typeof username != 'undefined'){
   friendship.remove({ 'user_1': username }, function(err, obj) { if (err) throw err; })
   friendship.remove({ 'user_2': username }, function(err, obj) { if (err) throw err; })
   device.remove({ 'username': username }, function(err, obj) { if (err) throw err; })
  }
}

//export function result
module.exports = {
    find: function (data) {
       if (data.type == constants.Friendship) {
           return findFriendship(data);
       }else if (data.type == constants.Device) {
           return findDevice(data);
       }else if (data.type == constants.User) {
                 return findUser(data);
             }
    },
   remove: function (data){
       if (data.type == constants.Friendship) {
          return deleteFriendship(data);
      }else if (data.type == constants.Device) {
          return deleteDevice(data);
      }else if (data.type == constants.User) {
                  return deleteUser(data);
      }
    }
}
