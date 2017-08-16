var dbAccess = require('./dbAccess');
var constants = require('../constants');

//do this for all the classes
var friendships = require('../classes/FriendshipTransaction');
var devices = require('../classes/DeviceAssignments');

// Will be replaced by ERDA
/*
 function findPotentialProvider(consumer, callback) {
 var username = consumer.username;
 var privacy = consumer.privacy;

 if (privacy == "high") {
 friendships.findFriends({ username: username }, function (e, res) {
 if (e) callback(e, null);
 var result = JSON.parse({});
 res.forEach(function (data, index, array) {
 if (data.user_1 == consumer) {
 provider = data.user_2;
 } else if (data.user_2 == consumer) {
 provider = data.user_1;
 }
 devices.findByUser({ username: provider }, function (e, data) {
 if (e) return callback(e, data);
 result.push(data);
 if (index = array.length) callback(null, result);
 });
 });
 });
 } else {
 devices.findAll(function (e, data) {
 if (e) return callback(e, data);
 callback(null, data);
 });
 }
 }
 */


function onlinePotentialProvider(data, callback) {
    var providerList = require('./tasklet/providerList');

    var provider = providerList.getProviderList();
    var result = '[';
    var processed = 0;

    provider.forEach(function (entry, index, array) {

        // ERDA: methode has to be plugged in here!!! --> Determine Ownership + throw entries away, which do not fit the privacy purpose

        result = result.concat('{ "address": "' + index + '", "deviceID":' + entry.deviceID + ', "availableVMs":' + entry.availableVMs + ', "benchmark": ' + entry.benchmark + ', "ownership": "own"}');
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

}

// Step 4: Scheduler chooses based on QoC the most suitable provider
// Assuming price range is 1-10 and for reliability and speed 1 is best, 10 is worst

function scheduling(data, callback) {
    var cost = data.cost;
    var reliability = data.reliability;
    var speed = data.speed;
    var privacy = data.privacy;
    var username = data.username;

    onlinePotentialProvider({username: username, privacy: privacy}, function (error, data) {
        if (error) callback(error, null);

        if(data.length == 0){
            callback(null, null); // Case not handled yet!
        }

        else if (data.length == 1) {
            callback(null, data[0]);
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

module.exports = {
    find: function (data, callback) {
        if (data.type == constants.PotentialProvider) {
            return findPotentialProvider(data, callback);
        } else if (data.type == constants.Friends) {
            return findFriends(data, callback);
        }
    },
    scheduling: function (providers, cost, reliability, speed) {
        return scheduling(providers, cost, reliability, speed)
    }
};