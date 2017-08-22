//keeps track of every change that happens in SF_Broker's side
let updates = [];

module.exports = {
//concatenate the changes into a single string
  add: function (data)
     {

     updates = updates.concat(data);
     console.log(updates + "the array");

     },
//will generate the array
  read: () => updates,

//Set array to empty
  restart: () => updates = [],
}
