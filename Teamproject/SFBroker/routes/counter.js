//keeps track of the index number every time a change happens in SF_Broker's side
var express = require('express');
var router = express.Router();

let index = 0

module.exports = {
  increment: () => index++,
  get: () => index,
  restart: () => index = 0,   //Set to 0 after the global update is finished
}