var Map = require("collections/map");
var constants = require('./../../constants');

var tasklet = new Map(); // holds a list of all requested tasklets for which no response was sent yet.

function insertTasklet(taskletid, broker_id, deviceID, isRemote, requestedNumber, requestedInstances, speed, requestingIP, cost, privacy){
  
        tasklet.add({
			broker_id: broker_id,
            deviceID: deviceID,
            isRemote: isRemote,
			requestedNumber: requestedNumber,
			requestedInstances: requestedInstances,
			speed: speed,
			requestingIP: requestingIP,
			cost: cost,
			privacy: privacy
        }, taskletid);
}

function deleteTasklet(taskletid){
    tasklet.delete(taskletid);
}

function getTasklet(taskletid, callback){
	var infos = tasklet.get(taskletid);
	if(callback) callback(null, infos);
}


module.exports = {

    insertTasklet: function (taskletid, broker_id, deviceID, isRemote, requestedNumber, requestedInstances, speed, requestingIP, cost, privacy) {
        return insertTasklet(taskletid, broker_id, deviceID, isRemote, requestedNumber, requestedInstances, speed, requestingIP, cost, privacy);
    },

    deleteTasklet: function (taskletid) {
        return deleteTasklet(taskletid);
    },
	
	getTasklet: function(taskletid, callback){
		return getTasklet(taskletid, callback);
	}

};