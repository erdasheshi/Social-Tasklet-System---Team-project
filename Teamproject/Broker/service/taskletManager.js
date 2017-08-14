var dbAccess = require('./dbAccess');
var constants = require('../constants');

//do this for all the classes
var friendships = require('../classes/FriendshipTransaction');
var devices = require('../classes/DeviceAssignments');

var providerList = require('./tasklet/providerList');


function findPotentialProvider(consumer, callback) {
    var consumer = consumer.username;
    var privacy = consumer.privacy;

    if (privacy == "high") {
        friendships.findFriends({username: consumer}, function (e, res) {
            if (e) callback(e, null);
            var result = JSON.parse({});
            res.forEach(function (data, index, array) {
                if (data.user_1 == consumer) {
                    provider = data.user_2;
                } else if (data.user_2 == consumer) {
                    provider = data.user_1;
                }
                devices.deleteByUser({username: provider}, function (e, data) {
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

function onlinePotentialProvider(data, callback) {
    var providerList = providerList.getProviderList();
    /*

    CONSOLIDATE Provider List from Database with online devices.

     */
}

// Step 4: Scheduler chooses based on QoC the most suitable provider
// Assuming price range is 1-10 and for reliability and speed 1 is best, 10 is worst

function scheduling(data, callback) {
    var cost            = data.cost;
    var reliability     = data.reliability;
    var speed           = data.speed;
    var privacy         = data.privacy;
    var username        = data.username;

    findPotentialProvider({ username: username, privacy: privacy}, function (error, data) {
        if(error) callback(error, null);

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
        callback(null, { provider: provider, potentialProvider : data});
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