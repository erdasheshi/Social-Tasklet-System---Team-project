//the functions that are used in the APIs with the Broker

var dbAccess = require('./dbAccess');
var constants = require('../constants');
var user = require('../classes/User');
var log = require('./log');
var broker_log = require('./broker_log');

//********************** tested ***************//
function findAllTransactions(user, callback) {
    var user = user.username;
    var transactionsProcessed = 0;
    var transactionList = '[';
    dbAccess.find({type: constants.Accounting, username: user}).exec(function (e, res) {
        if (e) callback(e, null);
        res.forEach(function (data, index, array) {
            transactionList = transactionList.concat('{ "consumer": "' + data.consumer +
                '", "provider": "' + data.provider +
                '", "computation": ' + data.computation +
                ', "coins": ' + data.coins +
                ', "status": "' + data.status +
                '", "taskletid": "' + data.taskletid + '" }');
            transactionsProcessed += 1;
            if (transactionsProcessed == array.length) {
                transactionList = transactionList.concat(']');
                transactionList = transactionList.replace('}{', '},{');
                callback(null, transactionList);
            }
            else {
                transactionList = transactionList.replace('}{', '},{');
            }
        });
    });
}

function findFriends(user, callback) {
    var F_List = '[';
    var user = user.username;
    var friend;
    var key = 'Network';
    var status;
    var userProcessed = 0;
    dbAccess.find({type: constants.Friendship, username: user, key: key}).exec(function (e, res) {
        if (e) callback(e, null);
        res.forEach(function (data, index, array) {
            if (data.status == constants.FriendshipStatusRequested) {
                if (data.user_1 == user) {
                    friend = data.user_2;
                    status = constants.FriendshipStatusRequested;
                } else if (data.user_2 == user) {
                    friend = data.user_1;
                    status = constants.FriendshipStatusPending;
                    console.log('HIER' + status);
                    console.log('HIER' + status);
                }
            }
            else if (data.status == constants.FriendshipStatusConfirmed) {
                if (data.user_1 == user) {
                    friend = data.user_2;
                } else if (data.user_2 == user) {
                    friend = data.user_1;
                }
                status = data.status;
        }
            F_List = F_List.concat('{ "name": "' + friend + '", "status": "' + status + '"}');
            userProcessed += 1;
            if (userProcessed == array.length) {
                F_List = F_List.concat(']');
                F_List = F_List.replace('}{', '},{');
                callback(null, F_List);
            }
            else{
                F_List = F_List.replace('}{', '},{');
            }
        });
    });
}

//********************** tested ***************//
//collect the deleted/updated/created friendship and device transactions into an update log
function CollectUpdates(data, id, key){
  var username = data.user.username;
  var id = id;
  var update;
     switch(key) {
           case 'device':    //keeping track of added device transactions
                var name =  data.body.name;
                var price = data.body.price;

                dbAccess.find({type: constants.Broker, username: username}).exec(function (e, data) {
                if(e) return next(e);
                var broker = data.broker;
                update = '{ "broker": "' + broker + '", "type": "Device", "username": "' + username + '", "device": "' + id + '", "key": "New", "status": "Inactive", "price": ' + price + '}';
                log.add(JSON.parse(JSON.stringify(update)));
                })
           break;
           case 'u_device':    //keeping track of updated device transactions
                var name =  data.body.name;
                var price = data.body.price;

                dbAccess.find({type: constants.Broker, username: username}).exec(function (e, data) {
                if(e) return next(e);
                var broker = data.broker;
                update = '{ "broker": "' + broker + '", "type": "Device", "username": "' + username + '", "device": "' + id + + '", "key": "Update",  "status": "' + data.body.status + '", "price": ' + price + '}';
                log.add(JSON.parse(JSON.stringify(update) ));
                })
           break;
           case 'd_device':   //keeping track of deleted device transactions
                dbAccess.find({type: constants.Broker, username: username}).exec(function (e, data) {
                if(e) return next(e);
                var broker = data.broker;
                update = '{ "broker": "' + broker + '", "type": "Device", "Device": "' + id + '", "key": "Deleted" }';
                log.add(JSON.parse(JSON.stringify(update)));
                })
           break;
           case 'friendship': //keeping track of added/updated friendship transactions
                var user_2 = data.body.name;
                var status = data.body.status;
                var broker_1 ;
                var broker_2 ;

                dbAccess.find({type: constants.Broker, username: username}).exec(function (e, data) { if(e) return next(e); broker_1 = data.broker;
                dbAccess.find({type: constants.Broker, username: user_2}).exec(function (e, data) { if(e) return next(e); broker_2 = data.broker;
                update = '{ "broker_1": "' + broker_1 + '", "broker_2": "' + broker_2  + '", "type": "Friendship", "ID": "' + id + '", "user_1": "' + username + '", "user_2": "' + user_2 + '", "status": "' + status +'" }';
                log.add(JSON.parse(JSON.stringify(update)));
                })
                })
           break;
           case 'd_friendship':   //keeping track of deleted friendship transactions
                var broker_1 ;
                var broker_2 ;
                var user_2 = data.body.name;

                dbAccess.find({type: constants.Broker, username: username}).exec(function (e, data) { if(e) return next(e); broker_1 = data.broker;
                dbAccess.find({type: constants.Broker, username: user_2}).exec(function (e, data) { if(e) return next(e); broker_2 = data.broker;
                update = '{ "broker_1": "' + broker_1 + '", "broker_2": "' + broker_2  + '", "type": "Friendship", "ID": "' + id + '", "key": "Deleted" }';
                log.add(JSON.stringify(update) );
                console.log(JSON.parse( JSON.stringify(update)));
                })
                })
           break;
           default: ;
           }
}

//send updates to all brokers
function globalUpdate()
{
}


//********************** tested ***************//
//retrieve updates related to a specific broker
function updateBroker(broker) {
   var log_updates = log.read();
   var log_version = log_updates.length -1 ;  //the array index of the last committed change
   var broker_updates = [];
   var broker_version = readBroker(broker);
   var i = log_version ;

while( i > broker_version ) {
    var temp_element = JSON.parse(log_updates[i]) ;
        console.log(temp_element.type + " the type of the update") ;
        console.log(JSON.stringify(temp_element) + " the update itself") ;

        if ( temp_element.type == 'Friendship' ){
        if (temp_element.broker_1 == broker || temp_element.broker_2 == broker)
           { broker_updates = broker_updates.concat(JSON.stringify(temp_element ));
           }
        }
        else {
          if (temp_element.broker == broker)
             {  broker_updates = broker_updates.concat(JSON.stringify(temp_element ));
        }
        }
        i--;
   }
   syncBroker(broker, log_version);
   return broker_updates;
}
//********************** tested ***************//
//update the sync version of the broker
function syncBroker(broker, version){
   console.log(version + " the sync version of the broker")
   var elem = '{"broker": "' + broker + '", "version": ' + version + '}';
   broker_log.add(JSON.parse( JSON.stringify(elem)));
}

//********************** tested ***************//
//get the last updated version of the broker
function readBroker(broker) {
   var current_version = broker_log.read_one(broker);
   console.log(current_version + " the broker version before updates are sent");
   return current_version;
}

//********************** tested ***************//
//update user's balance
function updateBalance(difference, username) {
    dbAccess.find({type: constants.User, username: username}).exec(function (e, data) {
        var balance = data.balance;

        if (isNaN(difference)){
            difference = 0; }
        balance = balance + difference;
        var userb = new user({
            username: username,
            balance: balance,
        });
        userb.update();
    });
};

module.exports = {
    find: function (data, callback) {
        if (data.type == constants.Friends) {
            return findFriends(data, callback);
        } else if (data.type == constants.AllTransactions) {
            return findAllTransactions(data, callback);    }
        },
    updateBalance: function(difference, username) {
            return updateBalance(difference, username) },
    CollectUpdates: function(data, id, key){
            return CollectUpdates(data, id, key) ; },
    updateBroker: function(broker) {
            return updateBroker(broker); },
    syncBroker: function(broker, version) {             //*********** its a local function, no need to export
             return syncBroker(broker, version); },
    readBroker: function(broker) {
            return readBroker(broker); }
};