 express = require('express');
 app = express();

 var dbAccess = require('./dbAccess');
 var logic = require('./logic');
 var uuidV1 = require('uuid/v1');
 var constants = require('./../constants');

 //websocket
 server = require('http').createServer(app);

 module.exports = function (server) {
 var io = require('socket.io').listen(server);

 io.sockets.on('connection', function (socket) {
        var taskletid, username;
        var broker_id = 3;    //important in case of distributed - multiple brokers
        var address = socket.request.connection;
        console.log('New connection from ' + address.remoteAddress + ':' + address.remotePort);

        //Connecting new Consumer/Provider with Broker
        socket.on('event', function (data) {
            console.log('New Entity online');
        });

// Step 1: Handle Tasklet request
socket.on('TaskletSendBroker', function (tasklet_data) {
 // Creating Tasklet ID
   taskletid = uuidV1();

console.log(tasklet_data.username + "  username  " +  taskletid + " id " + tasklet_data.cost + " tasklet request info");

        // Step 1: Illustrating the Tasklet request
        io.sockets.emit('ShowTaskletRequest', {
            zeit: new Date(),
            username: tasklet_data.username,
            taskletid: taskletid,
            cost: tasklet_data.cost,
            privacy: tasklet_data.privacy,
            speed: tasklet_data.speed,
            reliability: tasklet_data.reliability
        });

         // Step 2: Information request to SFBroker
         io.sockets.emit('SFInformation', {
            username:  tasklet_data.username,
            broker:   broker_id,
            taskletid: taskletid
         });
});

  socket.on('SFInformation', function (data) {
  var username = data.username;
 console.log(data + " the SFInformation socket call reaches the broker");
console.log(data.updates.length + " the updates sent to the function");
console.log(data.updates.length + " the updates sent to the function " +  data.updates);

 //store the updates before proceeding
 logic.setUpdates(data.updates);

 /////********************* tested and working until here

   if (data.further == 'yes') {
      //*** find potential provider ---------------------- base the search on devices (restricted by users)
      providers = logic.find({ type: constants.PotentialProvider, username: data.username, privacy: tasklet_data.privacy});  //***needs to be  changed
      console.log(providers + "providers");

       // Illustrating the Provider informations
       io.sockets.emit('ShowProviderInformation', {
           zeit: new Date(),
           username: data.username,
           taskletid: data.taskletid,
           potentialprovider: providers
       });
       console.log(providers + "the potential providers");

       // Including the speed and reliability information
       addInformation(providers);                                           //***needs to be  changed

       //Step 4: Finding most suitable provider                           //***update if needed (based on the whole scheduling idea)
       var provider = logic.scheduling(providers, tasklet_data.cost, tasklet_data.reliability, tasklet_data.speed);
       var consumer = data.username;
   }
   else {
        // If balance not sufficient, inform the Consumer about the cancellation
        io.sockets.emit('CancelTasklet', { consumer: data.username,  taskletid: data.taskletid,
        });
        }
        });


        // Steps 9 & 10: Receiving notification including the consumed time from Provider's device and sending this to the SFBroker
        socket.on('TaskletCyclesReturn', function (data) {   // it will capture the information
            io.sockets.emit('SendTaskletResultToConsumer', data);   //****needs to be removed...consumer send data directly to provider
          var computation = data.computation;
          var device = data.device;
//get the price of the provider's device and calculate the computation cost
    dbAccess.find({type: constants.device, device: device, key: 'device'}).exec(function (e, d_data) {
     var price = d_data.price;

     var cost =  computation * price;
                 console.log('computation  ' + computation);
                 console.log('cost ' + cost);
            io.sockets.emit('TaskletCyclesReturn', { cost: cost, taskletid: data.taskletid, device: device});
        });
        });
        // Step 6: Provider gets Tasklets
        socket.on('SendingTaskletToProvider', function (data) {
            io.sockets.emit('SendingTaskletToProvider', data);
        });
    });

// Used for adding the speed and reliability information
function addInformation(potentialprovider) { ////**************** update this so it works on devices and not on users

    for (var i = 0; i < potentialprovider.length; i++) {
        potentialprovider.splice(i, 1, {
            username: potentialprovider[i].username,
            price: potentialprovider[i].price,
            actualreliability: 5,
            actualspeed: 5
        });
    }
    return potentialprovider;
}
}