var constants   = require('../constants');
var Models      = require("../app"); //Instantiate a Models object so you can access the models.js module.

var mongoose    = require('mongoose');
var Friendships = require("../models/Friendships");
var dbAccess    = require("../routes/dbAccess");

var Friendship  = mongoose.model("Friendship", Friendships.friendshipSchema);


function friendshipTransaction(data, callback) {
    this.user_1  = data.user_1;
    this.user_2  = data.user_2;
    this.status  = data.status;
	this.version = data.version;

}

friendshipTransaction.prototype.save =  function(callback) {
    var user_1  = this.user_1;
    var user_2  = this.user_2;
    var status  = this.status;
	var version = this.version;

    Friendship.findOne({ 'user_1' : this.user_1 , 'user_2' : this.user_2 }).exec(function (e, udata) {
        if(udata == null){
            Friendship.findOne({ 'user_1' : user_2 , 'user_2' : user_1 }).exec(function (e, data) {
                if(data == null){
                    var transaction = new Friendship({ //You're entering a new transaction here
                        user_1: user_1,
                        user_2: user_2,
                        status: status,
						version: version
                    });
                    transaction.save({}, function (error, data) {
                        if(error){
                            callback(error, false);
                        }
                        if(callback) callback(null, true);
                    });
                }
                else {
                    Friendship.update({'user_1' : user_2 , 'user_2' : user_1}, {'status': status}, function(e, data){
                        if(e){
                            callback(e, false);
                        }
                        if(callback) callback(null, true);
                    });
                }
            });

        }
        else{
            Friendship.update({'user_1' : user_1 , 'user_2' : user_2}, {'status': status}, function(e, data){
                if(e){
                    callback(e, false);
                }
                if(callback) callback(null, true);
            });
        }

    });
}
module.exports  = friendshipTransaction;