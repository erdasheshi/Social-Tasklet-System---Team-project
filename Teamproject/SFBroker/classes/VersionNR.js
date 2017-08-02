//No longer needed because of the new replication schema

//***  var constants = require('../constants');
//***  var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.
//***  var mongoose = require('mongoose');
//***
//***  // version_nr schema/model
//***  var Versions = require("../models/VersionNRs");
//***  var Version = mongoose.model("User", Versions.versionSchema);
//***
//***  function version(data) {
//***          this.username    = data.username,
//***  		this.version     = data.version,
//***  		this.f_version   = data.f_version,
//***  		this.p_version   = data.p_version,
//***  //***	this.d_version   = data.d_version
//***  }
//***
//***  version.prototype.save =  function(callback) {
//***      var transaction = new User({ //You're entering a new transaction here
//***              username:    this.username,
//***  			version:     this.version,
//***  			f_version:   this.f_version,
//***  			p_version:   this.p_version,
//***  	//***	d_version:   this.d_version
//***       });
//***      transaction.save(function (error) { //This saves the information you see within that Acounting declaration (lines 4-6).
//***          if(error){
//***              callback(error, false);
//***          }
//***          if(callback) callback(null, true);
//***      });
//***  }
//***
//***  version.prototype.update =  function(){
//***      var transaction = this;
//***      console.log(transaction);
//***      //var user = mongoose.model("User", Users.userSchema);
//***
//***      Version.findOne({ 'username' : this.username }, function (err, doc) {
//***  		//avoiding the assignment null values
//***  		//**maybe it requires the check for each single attribute so it does not assign the missing ones to null
//***  		//**this might be done also in the call of the update function where u assign the unchanged values to the existing ones
//***  		if (transaction == null)
//***  		{;}
//***  		else{
//***  		doc.version     = transaction.version;
//***  		doc.f_version   = transaction.f_version;
//***  		doc.p_version   = transaction.p_version;
//***  //***   doc.d_version   = transaction.d_version;
//***
//***          doc.save({}, function (error, data) {
//***              if (error) {
//***                  console.error(error.stack || error.message);
//***                  return;
//***              }
//***          });} //not sure about the else...it needs to be tested
//***      });
//***  }
//***  module.exports = version;