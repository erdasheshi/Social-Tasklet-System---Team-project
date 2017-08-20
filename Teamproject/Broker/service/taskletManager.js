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
    devices.findByID({ device: device }, function (err, res) {
        var proprietary = res.username;
        var price = res.price;
        if (username == proprietary) {
            ownership = "own";
            var result = '{ "device": "' + device + '", "ownership": "' + ownership + '" }';
            callback(null, { device: device, ownership: ownership, price: price });
        }
        else {

            friendships.findExistence({ user_1: username, user_2: proprietary }, function (err, existence) {
                if (existence == "true") {
                    ownership = "friend";
                    callback(null, { device: device, ownership: ownership , price: price});
                }
                else {
                    friendships.findFriendsOfFriends({
                        user_1: username,
                        user_2: proprietary
                    }, function (err, existence) {
                        if(err) callback(err, null);
                        if (existence == "true") {
                            ownership = "network";
                            callback(null, { device: device, ownership: ownership , price: price});
                        }
                        else {
                            ownership = "others";
                            callback(null, { device: device, ownership: ownership , price: price});
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
        findRelation({device: deviceID, username: username }, function (error, data) {
        console.log("Ownership: " + data.ownership);

        result = result.concat('{ "address": "' + index + '", "price":' + data.price + ', "deviceID":' + deviceID + ', "availableVMs":' + availableVMs + ', "benchmark": ' + benchmark + ', "ownership": "' + data.ownership + '"}');
        
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
		
		if (isRemote == 0){
			var ip = requestingIP;
			var availableVMs = providerList.getAvailableVMs(ip);
			
			if(availableVMs > 0){
			var vms = Math.min(requestedNumber, availableVMs); 
			callback(null, [{number: 1},{ip: ip,vms: vms, price: 0}]);
			}
			
			else{
			callback(null, [{number: 0}]);
			}
		}
		
		else{
			
			if(data.length == 0){
            callback(null, [{number: 0}]);
			}
			
			//own
			if(privacy == 0){
				var ip = requestingIP;
				var availableVMs = providerList.getAvailableVMs(ip);
				if(availableVMs > 0){
					var vms = Math.min(requestedNumber, availableVMs); 
					callback(null, [{number: 1},{ip: ip,vms: vms}]);
				}
				else{
				callback(null, [{number: 0}]);
				}
			}
				
			//friends
			if(privacy == 1){
				data.forEach(function(current, index, array){
					if(current.ownership == 'own' || current.ownership == 'network' || current.ownership == 'others' || current.availableVMs < 1 ){
						data.splice(index,1);
					}
					if(data.length == 0){
						callback(null, [{number: 0}]);
					}
				});
			}
				
			//friendsfriends
			if(privacy == 2){
				data.forEach(function(current, index, array){
					if(current.ownership == 'own' || current.ownership == 'others' || current.availableVMs < 1){
						data.splice(index,1);
					}
					if(data.length == 0){
						callback(null, [{number: 0}]);
					}
				});
			}
				
			//all (except own)
			if(privacy == 3){
				data.forEach(function(current, index, array){
					if(current.ownership == 'own' || current.availableVMs < 1){
						data.splice(index,1);
					}
					if(data.length == 0){
						callback(null, [{number: 0}]);
					}
				});
			}

			else if (data.length == 1) {
				var availableVMs = data[0].availableVMs;
				
				var vms = Math.min(requestedNumber, availableVMs);
				var newprice;
					
				if(data[0].ownership == 'own'){
					newprice = 0;
				}
				if(data[0].ownership == 'friend'){
					newprice = data[0].price * (1 - constants.FriendsDiscount);
				}	
				if(data[0].ownership == 'network'){
					newprice = data[0].price * (1 - constants.FriendsFriendsDiscount);
				}
				if(data[0].ownership == 'others'){
					newprice = data[0].price;
				}
				callback(null, [{number: 1},{ip: data[0].address,vms: vms, price: newprice}]);
				
			}
			
			else {

				
				//discount
				data.forEach(function(current){
					if(current.ownership == 'friend'){
						current.price = current.price * (1 - constants.FriendsDiscount);
					}
					if(current.ownership == 'network'){
						current.price = current.price * (1 - constants.FriendsFriendsDiscount);
					}
				});

				var selectedVMs = 0;
				var	selectedProviders = 0;
				var attempts = 0;
				var total = cost + speed;
				var weightCost = cost / total;
				var weightSpeed = speed / total;
				var result =[];
				
				do{
					var score = 10;
					var currentProvider;
					var currentVMs;
					var currentPrice;
					var position;
					
					// Calculating the score (0-1)
					for(var i = 0; i < data.length; i++) {
					
						var newscore = (weightCost*((data[i].price - minPrice)/(maxPrice - minPrice))) + (weightSpeed*((data[i].benchmark - minBenchmark)/(maxBenchmark - minBenchmark)))
						if (newscore < score) {
						score = newscore;
						currentProvider = data[i].address;
						currentVMs = data[i].availableVMs;
						currentPrice = data[i].price;
						position = i;
						}
					}
					
					if(score < 10){
						selectedVMs = Math.min(currentVMs,requestedNumber);
					
						result = result.concat({ip: currentProvider, vms: selectedVMs, price: currentPrice});
						selectedProviders = selectedProviders + 1;
						data.splice(position, 1);
					}
					
					attempts = attempts + 1; 
				}while(selectedVMs < requestedNumber && attempts < 100 && data.length > 0);

				callback(null, [{number: selectedProviders}, result]);
			}	
			
		}
    });
}


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
   });

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

    scheduling: function (data, callback) {
        return scheduling(data, callback)
    },

    findRelation: function( data, callback)  {
            return findRelation( data, callback) ; }
};