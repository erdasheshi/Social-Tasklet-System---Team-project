//keeps track of the index number every time a change happens in SF_Broker's side
let index = 0

module.exports = {
  increment: () => index++,
  get: () => index,
  restart: () => index = 0,   //Set to 0 after the global update is finished
}