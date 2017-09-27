var dbAccess = require('./dbAccess');
var constants = require('../constants');

var friendships = require('../classes/FriendshipTransaction');
var devices = require('../classes/DeviceAssignments');

//Find the relation between the consumer and the owner of the device
function findRelation(data, callback) {
    var username = data.username;
    var device = data.device
    var ownership;

//find the proprietary of the device
    devices.findByID({device: device}, function (err, res) {
        var proprietary = res.username;
        var price = res.price;
        if (username == proprietary) {
            ownership = "own";
            var result = '{ "device": "' + device + '", "ownership": "' + ownership + '" }';
            callback(null, {device: device, ownership: ownership, price: price});
        }
        else {

            friendships.findExistence({user_1: username, user_2: proprietary}, function (err, existence) {
                if (existence == "true") {
                    ownership = "friend";
                    callback(null, {device: device, ownership: ownership, price: price});
                }
                else {
                    friendships.findFriendsOfFriends({
                        user_1: username,
                        user_2: proprietary
                    }, function (err, existence) {
                        if (err) callback(err, null);
                        if (existence == "true") {
                            ownership = "network";
                            callback(null, {device: device, ownership: ownership, price: price});
                        }
                        else {
                            ownership = "others";
                            callback(null, {device: device, ownership: ownership, price: price});
                        }
                    });
                }
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
        findRelation({device: deviceID, username: username}, function (error, data) {

            result = result.concat('{ "address": "' + index + '", "price":' + data.price + ', "deviceID":' + deviceID + ', "availableVMs":' + availableVMs + ', "benchmark": ' + benchmark + ', "ownership": "' + data.ownership + '"}');

            processed += 1;

            if (processed == array.length) {
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
function scheduling(data, callback) {
    var providerList = require('./tasklet/providerList');
    var information = data.information;

    var isRemote = information.isRemote;
    var requestedInstances = information.requestedInstances;
    var requestedNumber = information.requestedNumber;
    var cost = information.cost;
    var speed = information.speed;
    var privacy = information.privacy;
    var requestingIP = information.requestingIP;

    var username = data.username;
    var minBenchmark = data.minBenchmark;
    var maxBenchmark = data.maxBenchmark;
    var minPrice = data.minPrice;
    var maxPrice = data.maxPrice;

    onlinePotentialProvider({username: username, privacy: privacy}, function (error, data) {
        if (error) callback(error, null);

        if (isRemote == 0 || privacy == 0) { //own device
            var ip = requestingIP;
            var availableVMs = providerList.getAvailableVMs(ip);

            if (availableVMs > 0) {
                var vms = Math.min(requestedNumber, availableVMs);
                providerList.decreaseAvailableVMs(ip, vms);
                callback(null, [{ip: ip, vms: vms, price: 0}]);
            }

            else {
                callback(null, {});
            }
        }

        else {
            var availableUsers = [];
            if (data.length == 0) {
                callback(null, {});
            }

            //friends
            if (privacy == 1) {
                data.forEach(function (current, index, array) {
                    if (current.ownership == 'friend' && current.availableVMs > 0) {
                        availableUsers.push(current);
                    }
                });
            }

            //friendsfriends
            if (privacy == 2) {
                data.forEach(function (current, index, array) {
                    if ((current.ownership == 'friend' || current.ownership == 'network') && current.availableVMs > 0) {
                        availableUsers.push(current);
                    }
                });
            }

            //all (except own)
            if (privacy == 3) {
                data.forEach(function (current, index, array) {
                    if (current.ownership != 'own' && current.availableVMs > 0) {
                        availableUsers.push(current);
                    }
                });
            }

            if (availableUsers.length == 0) {
                callback(null, {});
            }

            if (availableUsers.length == 1) {
                var availableVMs = availableUsers[0].availableVMs;

                var vms = Math.min(requestedNumber, availableVMs);
                var newprice;

                if (availableUsers[0].ownership == 'own') {
                    newprice = 0;
                }
                else if (availableUsers[0].ownership == 'friend') {
                    newprice = availableUsers[0].price * (1 - constants.FriendsDiscount);
                }
                else if (availableUsers[0].ownership == 'network') {
                    newprice = availableUsers[0].price * (1 - constants.FriendsFriendsDiscount);
                }
                else if (availableUsers[0].ownership == 'others') {
                    newprice = availableUsers[0].price;
                }
                providerList.decreaseAvailableVMs(availableUsers[0].address, vms);
                callback(null, [{ip: availableUsers[0].address, vms: vms, price: newprice}]);

            }

            else {


                //discount
                availableUsers.forEach(function (current, index) {
                    console.log('Ownership: ' + current.ownership);
                    if (current.ownership == 'friend') {
                        availableUsers[index].price = current.price * (1 - constants.FriendsDiscount);
						if(availableUsers[index].price < minPrice) minPrice = current.price;
						console.log('New Price friend: ' + availableUsers[index].price);
                    }
                    if (current.ownership == 'network') {
                        availableUsers[index].price = current.price * (1 - constants.FriendsFriendsDiscount);
						if(availableUsers[index].price < minPrice) minPrice = current.price;
                        console.log('New Network friend: ' + availableUsers[index].price);
                    }
                });

                var selectedVMs = 0;
                var totalVMs = 0;
                var selectedProviders = 0;
                var attempts = 0;
                var total = cost + speed;
                var weightCost = cost / total;
                var weightSpeed = speed / total;
                var result = [];

                do {
                    var score = 10;
                    var currentProvider;
                    var currentVMs;
                    var currentPrice;
                    var position;

                    // Calculating the score (0-1)
                    for (var i = 0; i < availableUsers.length; i++) {
                        
						var price = availableUsers[i].price;
                        var priceRange = maxPrice - minPrice;
                        var priceValue;
                        if(priceRange == 0){
                            priceValue = 0;
                        }
                        else{
                            priceValue = (weightCost * ((price - minPrice) / priceRange));
                        }

                        var benchmarkRange = maxBenchmark - minBenchmark;
                        var benchmarkValue;
                        if(benchmarkRange == 0){
                            benchmarkValue = 0;
                        }
                        else{
                            benchmarkValue = (weightSpeed * ((availableUsers[i].benchmark - minBenchmark) / benchmarkRange));
                        }


                        var newscore = priceValue + benchmarkValue;

                        console.log("User: " + availableUsers[i].ip + " Score: " + newscore);
                        console.log("Benchmark: " + availableUsers[i].benchmark + "Cost: " + price);
                        console.log("Cost: " + weightCost + "Benchmark: " + weightSpeed);


                        if (newscore < score) {
                            score = newscore;
                            currentProvider = availableUsers[i].address;
                            currentVMs = availableUsers[i].availableVMs;
                            currentPrice = price;
                            position = i;
                        }
                    }

                    if (score < 10) {
                        selectedVMs = Math.min(currentVMs, requestedNumber);
                        result.push({ip: currentProvider, vms: selectedVMs, price: currentPrice});
                        selectedProviders += 1;
                        availableUsers.splice(position, 1);
                        providerList.decreaseAvailableVMs(currentProvider, selectedVMs);
                        totalVMs += selectedVMs;
                    }

                    attempts = attempts + 1;
                    if( totalVMs == requestedNumber){
                        if(callback){
                            callback(null, result);
                        }
                    }
                } while (totalVMs < requestedNumber && attempts < 100 && availableUsers.length > 0);

                if(totalVMs < requestedNumber && attempts == 100 && availableUsers.length > 0){
                    callback(null, {});
                }
            }
        }
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

    scheduling: function (data, callback) {
        return scheduling(data, callback)
    },

    findRelation: function (data, callback) {
        return findRelation(data, callback);
    }
};