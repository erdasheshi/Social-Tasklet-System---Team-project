//keeps track of every change that happens in SF_Broker's side
var express = require('express');
var router = express.Router();

let updates = [];

module.exports = {
//concatenate the changes into a single string
  add: function (data)
     {  updates = updates.concat(data);
        console.log(updates.length + " the length of the vector ---- log file");
        console.log(updates + " the vector in the log files --- log file");
     },
//will generate the array
  read: () => updates,

//Set array to empty
  restart: () => updates = [],
}
