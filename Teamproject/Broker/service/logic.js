var dbAccess = require('./dbAccess');
var constants = require('../constants');

//do this for all the classes
var friendships   = require('../classes/FriendshipTransaction');
var devices       = require('../classes/DeviceAssignments');

//finds the potential providers for the user
//***
//*** Have to change this so it operates based on device, not on users... it should take under consideration the heartbeat
//***
function findPotentialProvider(consumer, callback) {
    var potentialprovider = '[';
    var consumer = consumer.username;
    var provider;
    var privacy = consumer.privacy;
    var userProcessed = 0;
    if (privacy == "high") {
        dbAccess.find({type: constants.Friendship, username: consumer}).exec(function (e, res) {
            if (e) callback(e, null);
            res.forEach(function (data, index, array) {
                if (data.user_1 == consumer) {
                    provider = data.user_2;
                } else if (data.user_2 == consumer) {
                    provider = data.user_1;
                }
             //   dbAccess.find({type: constants.User, username: provider}).exec(function (e, res) {
             //       if( res.username !== consumer){
             //           potentialprovider = potentialprovider.concat('{ \"username\": \"' + res.username + '\", \"price\": ' + res.price + '}');
             //       }
             //       userProcessed += 1;
             //       if (userProcessed == array.length) {
             //           potentialprovider = potentialprovider.concat(']');
             //           potentialprovider = potentialprovider.replace('}{', '},{');
             //           if(callback) callback(null, potentialprovider);
             //       }
             //   });
            })
        });
    }
    else {
       // dbAccess.find({type: constants.User}).exec(function (e, res) {
       //     if (e) callback(e, null);
       //     res.forEach(function (data, index, array) {
       //         if( data.username !== consumer) {
       //             potentialprovider = potentialprovider.concat('{ \"username\": \"' + data.username + '\", \"price\": ' + data.price + '}');
       //         }
       //         userProcessed += 1;
       //         if (userProcessed == array.length) {
       //             potentialprovider = potentialprovider.concat(']');
       //             potentialprovider = potentialprovider.replace('}{', '},{');
       //             callback(null, potentialprovider);
       //         }else {
       //             potentialprovider = potentialprovider.replace('}{', '},{');
       //         }
       //     });
       // });
    }
}

// Step 4: Scheduler chooses based on QoC the most suitable provider
// Assuming price range is 1-10 and for reliability and speed 1 is best, 10 is worst

function scheduling(providers, cost, reliability, speed) {

    //Converting QoC high and low to 9 and 1
    cost = cost === 'low' ? 9 : 1;
    reliability = reliability === 'high' ? 9 : 1;
    speed = speed === 'high' ? 9 : 1;

    // Calculating the weights based on QoC high and low
    var total = cost + reliability + speed;

    var weightcost = cost / total;
    var weightreliability = reliability / total;
    var weightspeed = speed / total;

    var provider = '';
    var score = 11;

    // Calculating the score (1-10) for every potential provider
    for (var i = 0; i < providers.length; i++) {

        if (potentialprovider[i].price > 10) {
            console.log('Price is more than 10 ! Please revise');
        }
        var newscore = (weightcost * providers[i].price) + (weightreliability * providers[i].actualreliability) + (weightspeed * providers[i].actualspeed);
        if (newscore < score) {
            score = newscore;
            provider = providers[i].username;
        }
    }
    return provider;
}

//stores the updates in the database
function setUpdates( updates, callback)
{ console.log( "the function is called");
  console.log( "the function is called " + updates.length);
for (var i = 0; i < updates.length; i++) {
  var data =  JSON.parse(updates[i]);

console.log( "the function is called");
console.log( "the updates" + JSON.stringify(data));
       switch(data.type) {         //the data structure for friendships is different from the one for devices, therefore its tested the type before proceeding
             case 'Friendship':
                   if (data.status == "Confirmed"){        //create a new friendship transaction
                   console.log("adding an new frindship");
                   console.log("adding an new frindship u1" + data.user_1);
                   console.log("adding an new frindship u2" + data.user_2);

                             var friendship = new friendships({
                                  ID: data.ID,
                                  user_1: data.user_1,        //*** check that is sent only information related to the friend an not the user itself (its defined in the useername section)
                                  user_2: data.user_2,
                                  });
                            friendship.save(function (err, post) {
                                  if (err) return next(err);
                                  });
                            }
                            else if (data.status == "Delete"){    //delete the existing transaction
                            console.log("deleting friendship");
                            friendship.remove({ 'ID': data.ID }, function(err, obj) { if (err) throw err; })
                            }
             break;
             case 'Device':
                   var username = data.username;
                   if (data.key == "New"){       //create new transaction
                             var device = new devices({
                                  username: username,
                                  device: data.device,
                                  price: data.price ,
                                  status: data.status
                                  });
                             device.save(function (err, post) {
                                  if (err) return next(err);
                                  });
                                                              console.log("add device");

                             }
                             else if (data.key == "Update"){   //update an existing transaction
                                  var device = new devices({
                                           username: username,
                                           device: data.device,
                                           price: data.price,
                                           status: data.status
                                           });
                                  device.update(function (err, post) {
                                     if (err) return next(err);
                                     });
                            }
                            else if (data.key == "Deleted") {  //delete the transaction
                                                        console.log("deleting device");
                            device.remove({ 'device': data.device }, function(err, obj) { if (err) throw err; })
                            }
             break;
           }
   }
}

module.exports = {
    find: function (data, callback) {
        if (data.type == constants.PotentialProvider) {
            return findPotentialProvider(data, callback);
        }else if (data.type == constants.Friends) {
           return findFriends(data, callback);
        }
    },
    scheduling: function(providers, cost, reliability, speed) {
       return scheduling(providers, cost, reliability, speed)
   },
    setUpdates: function(updates, callback) {
       return setUpdates(updates, callback);
   },
};