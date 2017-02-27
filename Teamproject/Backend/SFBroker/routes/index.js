var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Accountings = require("../models/Accountings");
var Models = require("../app"); //Instantiate a Models object so you can access the models.js module.

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SFBroker' });
});

module.exports = router;
