var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var constants = require('../constants');

//Instantiate a Models object so you can access the models.js module.
//??? not sure if this is needed (test)
 var Models = require("../app");
 
 
// Create and define the database schema for friendships
var friendshipSchema = new Schema({ 
    ID:     Number,
	user_1: String,
    user_2: String,
});

var Friendship  = mongoose.model("Friendship", friendshipSchema);
var friendshipTransaction = new Friendship;

function friendshipTransaction(data) {
	this.ID = data.ID;
    this.user_1 = data.user_1;
    this.user_2 = data.user_2;
}

findFriendship.prototype.save =  function(callback) {
	var transaction = new friendshipTransaction({       //Entering a new transaction
            ID:        this.ID
            user_1:    this.user_1,
		    user_2:    this.user_2,                    
    });
    transaction.save(function (error) { //This saves the information you see within that Acounting declaration (lines 4-6).
        if(error){
            callback(error, false);
        }
        if(callback) callback(null, true);
    });
}

module.exports  = friendshipTransaction;