var dbAccess = require('./dbAccess');
var constants = require('../constants');

//do this for all the classes
var friendships = require('../classes/FriendshipTransaction');
var devices = require('../classes/DeviceAssignments');

//Find the relation between the consumer and the owner of the device
function findRelation(data, callback){
var username = data.username;
var device = data.device
var ownership;

//find the proprietary of the device
devices.findByID({ device: device}, function(err, res){
var proprietary = res.username;
console.log(username + " username");
console.log(proprietary + " proprietary");

if (username == proprietary){
ownership = "own";
var result = '{ "device": "' + device + '", "ownership": "' + ownership + '" }'
callback(null, {device: device, ownership: ownership});
}
else{

friendships.findExistence({ user_1: username, user_2 : proprietary }, function(err, existence){
console.log(existence + "existence");
if( existence == "true" ){
ownership = "friend";
}
else {
var connection = find_friends_of_friends(username,  proprietary);
//find_friends_of_friends({ username: username, proprietary : proprietary }, function(err, existence){
console.log("return----" + connection);
var connection = connection;
if( connection == "true" ){
ownership = "network";
}
else {
ownership = "others";
}
//});
}
callback(null, {device: device, ownership: ownership});
});
}
});
}

function onlinePotentialProvider(data, callback) {
    var providerList = require('./tasklet/providerList');
    var username = data.username;

    var provider = providerList.getProviderList();
    var result = '[';
    var processed = 0;

    provider.forEach(function (entry, index, array) {
var index = index;
var deviceID = entry.deviceID;
var availableVMs = entry.availableVMs;
var benchmark = entry.benchmark;

        findRelation({device: entry.deviceID, username: username }, function (error, data) {
        console.log("Ownership: " + data.ownership);

        result = result.concat('{ "address": "' + index + '", "deviceID":' + deviceID + ', "availableVMs":' + availableVMs + ', "benchmark": ' + benchmark + ', "ownership": "' + data.ownership + '"}');
        processed += 1;

        if (processed == array.length){
            result = result.concat(']');
            result = result.replace('}{', '},{');
            result = JSON.parse(result);
            callback(null, result);
        }
        else {
            result = result.replace('}{', '},{');
        }
    });
});
}

// Step 4: Scheduler chooses based on QoC the most suitable provider
// Assuming price range is 1-10 and for reliability and speed 1 is best, 10 is worst
function scheduling(data, callback) {
var information = data.information;
    var cost = information.cost;
    var reliability = information.reliability;
    var speed = information.speed;
    var privacy = information.privacy;
    var username = data.username;

    onlinePotentialProvider({username: username, privacy: privacy}, function (error, data) {
        if (error) callback(error, null);

        if(data.length == 0){
            callback(null, null); // Case not handled yet!
        }

        else if (data.length == 1) {
            callback(null, [{number: 1},{ip: data[0].address,vms: 1}]);
        }
        else {
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

            callback(null, {provider: provider, potentialProvider: data});
        }
    })
}


// //check if a user is one of the friends of of the friends of a second user
// function find_friends_of_friends(data, callback){
//
// var username = data.username;
// var proprietary = data.proprietary;
//
// //get the list of friends for this user
// friendships.findFriends({username: username}, function(err, list_friends){
// var existence = "false";
// var counter = 0;
// list_friends.forEach(function (friend, index, array) {
//    var friend = friend.username;
//    friendships.findExistence({ user_1: friend, user_2 : proprietary }, function(err, existence){
//         if(err) console.error(err);
//         if(existence == "true") { callback( null, 'true') };
//         counter += 1;
//    });
//    if(counter == list_friends.length ){
//         callback( null, 'false')
//    }
// });
//
// });
// }


//check if a user is one of the friends of of the friends of a second user
function find_friends_of_friends(username, proprietary){
var username = username;
var proprietary = proprietary;
//get the list of friends for this user
friendships.findFriends({username: username}, function(err, list_friends){
var existence = "false";
var counter = 0;
list_friends.forEach(function (friend, index, array) {
   var friend = friend.username;
   friendships.findExistence({ user_1: friend, user_2 : proprietary }, function(err, existence){
        if(err) console.error(err);
        if(existence == "true") { return "true" };
        counter += 1;
        console.log("111111111111");
   });
        console.log("2222222222");
        console.log("33333333333");

   if(counter == list_friends.length ){
        return "false";
   }

});

});
}

module.exports = {
    find: function (data, callback) {
        if (data.type == constants.PotentialProvider) {
            return findPotentialProvider(data, callback);
        } else if (data.type == constants.Friends) {
            return findFriends(data, callback);
        }
        else if (data.type == constants.Friends) {
                    return findFriends(data, callback);
                }
    },

    scheduling: function (providers, cost, reliability, speed) {
        return scheduling(providers, cost, reliability, speed)
    },

    findRelation: function( data, callback)  {
            return findRelation( data, callback) ; }
};