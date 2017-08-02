//No longer needed because of the new replication idea

//*** var mongoose = require("mongoose");
//*** var Schema = mongoose.Schema;
//***
//*** /*This versionSchema stores the update version for each user
//*** If the broker_version = f_version then the broker is up to date regarding the friendships and we dont need to search in the friendship table.
//*** If the broker_version = p_version then the broker is up to date regarding the price and we dont need to search in the device table.
//*** If the broker_version = d_version then the broker is up to date regarding the devices and we dont need to search in the device table.
//*** */
//***
//*** var versionSchema = new Schema({ //This is where accountingSchema is defined.
//***     username: String,
//*** 	version: Number,          //stores the version of user's last update
//*** 	f_version: Number,        //the last update of user's friendship transactions
//*** 	p_version: Number,        //the last update of user's price
//*** //***	d_version: Number     //the last update of user's devices
//***
//*** });
//***
//*** module.exports = mongoose.model('users', versionSchema);