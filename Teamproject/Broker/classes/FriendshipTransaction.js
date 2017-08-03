var constants   = require('../constants');
var Models      = require("../server"); //Instantiate a Models object so you can access the models.js module.
var mongoose    = require('mongoose');

var Friendships = require("../models/Friendships");
var Friendship  = mongoose.model("Friendship", Friendships.friendshipSchema);

function friendshipTransaction(data, callback) {
	this.ID     = data.ID;
    this.user_1 = data.user_1;
    this.user_2 = data.user_2;
}

/*The broker either creates friendship when they are set as updates from the SFBroker and they do not exist in the database
or it deletes them when they do exist and are set as updates from the SFBroker*/

friendshipTransaction.prototype.save =  function(callback) {
	var transaction = new Friendship({       //Entering a new transaction
            ID:        this.ID,
            user_1:    this.user_1,
		    user_2:    this.user_2
    });
    transaction.save(function (error, data) {
        if(error){
            callback(error, false);
        }
        if(callback) callback(null, true);
    });
};

module.exports  = friendshipTransaction;