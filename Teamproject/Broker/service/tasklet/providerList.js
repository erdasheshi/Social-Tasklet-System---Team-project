var Map = require("collections/map");

var provider = new Map();

function insertProvider(address){
	var lastHeartbeat = Math.round(new Date().getTime() / 1000);

	//IP was found in the collection
	if(provider.has(address)){
		var infos = provider.get(address);
		infos.lastHeartbeat = lastHeartbeat;
		// Demonstrating purposes
		console.log(provider.toObject());
	}
	
	//IP was not found in the collection
	else{
		var availableVMs = 0;
		var benchmark = 999;
		
		provider.add({lastHeartbeat: lastHeartbeat, availableVMs: availableVMs, benchmark: benchmark},address);
		// Demonstrating purposes
		console.log(provider.toObject());
	}
};

function updateBenchmark(address, benchmark){
	var infos = provider.get(address);
	infos.benchmark = benchmark;
	// Demonstrating purposes
	console.log(provider.toObject());
}

function updateProviderList(){
	var time = Math.round(new Date().getTime() / 1000);

	provider.forEach(function(current, address){
		
		if((time - current.lastHeartbeat) > 10){
			provider.delete(address);
		}
	});
	
	setTimeout(updateProviderList, 2000);
}



function increaseAvailableVMs(address){
	var infos = provider.get(address);
	infos.availableVMs = infos.availableVMs + 1;
	// Demonstrating purposes
	console.log(provider.toObject());
}

function decreaseAvailableVMs(address){
	var infos = provider.get(address);
	infos.availableVMs = infos.availableVMs - 1;
	// Demonstrating purposes
	console.log(provider.toObject());
}

function getProviderList(data) {
	return provider;
}

module.exports = {
	
	insertProvider: function(address){
		return insertProvider(address);
	},
	
	updateBenchmark: function(address, benchmark){
		return updateBenchmark(address, benchmark);
	},
	
	updateProviderList: function(){
		return updateProviderList();
	},
	
	increaseAvailableVMs: function(address){
		return increaseAvailableVMs(address)
	},
	
	decreaseAvailableVMs: function(address){
		return decreaseAvailableVMs(address)
	},

	getProviderList: function(data) {
        return getProviderList(data);
    }
	
};