var Map = require("collections/map");
var constants = require('./../../constants');

var tasklet = new Map();

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

function getTasklet(taskletid){
	var infos = tasklet.get(taskletid);
	return infos;
}


module.exports = {

    insertTasklet: function (taskletid, broker_id, deviceID, isRemote, requestedNumber, requestedInstances, speed, requestingIP, cost, privacy) {
        return insertTasklet(taskletid, broker_id, deviceID, isRemote, requestedNumber, requestedInstances, speed, requestingIP, cost, privacy);
    },

    deleteTasklet: function (taskletid) {
        return deleteTasklet(taskletid);
    },
	
	getTasklet: function(taskletid){
		return getTasklet(taskletid);
	}

};