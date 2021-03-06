var log = require('./../replication/log');
var broker_log = require('./../replication/broker_log');
var Brokers = require('../classes/Broker');
var sockets = require('../routes/sockets')

var constants = require('../constants');

//collect the deleted/updated/created friendship and device transactions into an update log

function CollectUpdates(data, callback) {
var data = data;
    if ( data.key == constants.Device || data.key == 'd_device'){

    //call a function to check if the update is already in the log
    searchLog({ key: data.key, device: data.device }, function(e, res){
    if (e) return next(e)
    else{
        buildUpdate({ logData: data }, function (e, data) {
        if (e) return next(e)
           else{ callback(null, true); }
        })
        }
    })
    }
    else {
        searchLog({ key: data.key, id : data.id }, function(e, res){
        if (e) return next(e)
    else{
        buildUpdate({ logData: data}, function (e, data) {
        if (e) return next(e)
        callback(null, true);
        });
        };
    });
    }
}

function buildUpdate(data, callback) {
    var logData = data.logData ;
    var update;
    Brokers.findByUser({ username: logData.username }, function (e, data) {

        if (e) return next(e);
        switch (logData.key) {
            case constants.Device:    //keeping track of added device transactions
                update = '{ "broker": "' + data.broker +  '", "version": ' + 0 +', "type": "Device", "username": "' + logData.username + '", "device": "' + logData.device + '", "key": "New", "status": "' + logData.status + '", "price": ' + logData.price + '}';
                log.add(JSON.parse(JSON.stringify(update)));
                callback(null, true);
                break;

            case 'd_device':   //keeping track of deleted device transactions
                update = '{ "broker": "' + data.broker +  '", "version": ' + 0 +', "type": "Device", "device": "' + logData.device + '", "key": "Deleted" }';
                log.add(JSON.parse(JSON.stringify(update)));
                callback(null, true);
                break;

            case constants.Friendship: //keeping track of added/updated friendship transactions
                var broker_1 = data.broker;
                Brokers.findByUser({ username: logData.user_2}, function (e, data1) {
                    if (e) return next(e);
                        update = '{ "broker_1": "' + broker_1 + '", "broker_2": "' + data1.broker + '", "version": ' + 0 + ', "type": "Friendship", "ID": "' + logData.id + '", "user_1": "' + logData.username + '", "user_2": "' + logData.user_2 + '", "key": "New" }';
                        log.add(JSON.parse(JSON.stringify(update)));
                        callback(null, true);
                })
                break;
            case 'd_friendship':   //keeping track of deleted friendship transactions
                var broker_1 = data.broker;
                       Brokers.findByUser({ username: logData.user_2}, function (e, data1) {
                    if (e) return next(e);
                        update = '{ "broker_1": "' + broker_1 + '", "broker_2": "' + data1.broker  + '", "version": ' + 0 + ', "type": "Friendship", "ID": "' + logData.id + '", "key": "Deleted" }';
                        log.add(JSON.parse(JSON.stringify(update)));
                        callback(null, true);
                    })
                break;
            default:
                ;
        }
    });
}

//if the updated device/friendship has already an entry in the log then delete it, so it can be substituted with the latest one
function searchLog(data, callback){

 var change_log = log.read_updates();
 var log_length = change_log.length;  //the length after the last committed change
if (log_length != 0){
var i = 0;
var existence = false;
while (i < log_length && existence == false){
   //for ( var  i = 0 ; i < log_length; i++ ){
      var temp = JSON.parse(change_log[i]).changed_entry;

     switch (data.key) {
       case constants.Device:
       case 'd_device':
            if( temp.device == data.device) {
            change_log.splice(i, 1);
            existence = true ;
            callback(null, true);
            }
            else{ i = i + 1;
            }
        break;

       case constants.Friendship:
       case 'd_friendship':
             if( temp.ID == data.id ){
             change_log.splice(i, 1);
             existence = true ;
             callback(null, true);
             }
             else{ i = i + 1 ;
             }
       break;
     }
     //if no matching entry was found in the log
if(i == log_length)
{
    callback(null, true);
}
   }
   }
   else{
    callback(null, true);
 }
}

//triggering the global update every 24 hours
setTimeout(function () {
         globalUpdate( function (e, data) {
                         });
     }, 1000*60*60*24); // timeout in 24 hours  *60*60*24

   //Sending updates to all brokers. Triggered once per day
   function globalUpdate(callback) {

   //find all connected brokers
   Brokers.findBrokers( function (e, data) {
   if (e) callback(e, null);
   var broker_list = data;
   //collect updates for each broker
   broker_list.forEach(function (broker, index, array) {
   var updates = updateBroker(broker);

   //send updates to brokers via sockets
   sockets.send_global_updates(broker, updates);
   });
   //empty the log data when updates are sent to all brokers
   log.restart();
   //set the broker_log to empty so the brokers restart from version 0
   broker_log. restart();
   setTimeout(globalUpdate, 1000);   // timeout in 24 hours *60*60*24
   });
 }

//retrieve updates related to a specific broker
function updateBroker(broker) {
    var change_log = log.read_updates();
    var change_log_version = log.read_version() -1  ;

    var broker_updates = [];
    var broker_version = readBroker(broker);

//search through the log for updated entries that haven been sent yet to the broker
    for (var i = 0; i < change_log.length ; i++){

        var change_version = JSON.parse(change_log[i]).version;
        //consider the entry only if it was changed after the last update sent to the broker
        if ( change_version > broker_version){
              var log_entry = JSON.parse(change_log[i]).changed_entry;

              if (log_entry.type == 'Friendship') {
                  if (log_entry.broker_1 == broker || log_entry.broker_2 == broker) {
                      broker_updates = broker_updates.concat(JSON.stringify(log_entry));
                  }
              }
              else {
                  if (log_entry.broker == broker) {
                      broker_updates = broker_updates.concat(JSON.stringify(log_entry));
                  }
              }
              }
          }
    syncBroker(broker, change_log_version); //broker's version is equal to the version value of the last updated entry in the log
    return broker_updates;
}

//update the sync version of the broker
function syncBroker(broker, version) {
    console.log(" Broker's new version: " + version );
    var elem = { broker:  broker, version: version };
    broker_log.add(elem);
}

//get the last updated version of the broker
function readBroker(broker) {
    var current_version = broker_log.read_one(broker);
    console.log(" Broker's old version: " + current_version );
    return current_version;
}

module.exports = {

    CollectUpdates: function (data, callback) {
        return CollectUpdates(data, callback);
    },
    updateBroker: function (broker) {
        return updateBroker(broker);
    },
    syncBroker: function (broker, version) {
        return syncBroker(broker, version);
    },
    readBroker: function (broker) {
        return readBroker(broker);
    },
    globalUpdate: function (broker) {
            return globalUpdate(broker);
        }
};
