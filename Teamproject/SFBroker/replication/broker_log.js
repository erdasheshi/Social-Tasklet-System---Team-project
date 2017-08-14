//keeps track of every broker update version
var express = require('express');
var router = express.Router();

let sync = [];

module.exports = {
//collect the broker information into a single array
//add information about broker's update & update the version of already existing ones
  add:  function (data) {
           //find the position of the broker, if it has already an entry in the array
           var i = 0;
             console.log(data.broker + "iuiiiia");
           while( i<sync.length && sync[i].broker != data.broker) {
                   i++;
               }

               console.log(i + "ija");
               console.log(sync.length + "length");
           if (i == sync.length )                            // does the broker already have an entry in the array ?
           {
            sync = sync.concat(data);                      //Broker doesn't exist in the array then add a new entry
           }
           else{
                 console.log(sync[i].version + "para");
                 sync[i].version = data.version;    //broker exists, therefor update the existing entry with the updated version
                 console.log(sync[i].version + "mbrapa");
           }
                        console.log(sync[i].broker + "brok");
           },

//will return the current version of a broker or 0 if the broker doesn't have an entry
  read_one: function (broker) {
            var i=0;
            while(i<sync.length && sync[i].broker != broker) {
                    i++;
                }
            if (i == sync.length)
            {
             return 0;
            }
            else{
             return sync[i].version ;
            }
            },
//will return the array
  read: () => sync,

//Set array to empty
  restart: () => sync = [],
}
