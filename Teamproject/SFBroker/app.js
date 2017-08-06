var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var localStrategy = require('passport-local' ).Strategy;
var conf = require('../config.json');
var cors = require('cors');
var session = require('express-session');

// Prepare DB
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// user schema/model
var User = require('./models/Users.js');

//mongoose.connect('127.0.0.1:27017/SFBroker');
var mongodbAddress = 'mongodb://' + conf.sfbroker.mongoDB.address + ':' + conf.sfbroker.mongoDB.port  + '/' + conf.sfbroker.mongoDB.database;
console.log(mongodbAddress);
mongoose.connect(mongodbAddress);

var db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", function(callback){
    console.log("DB Connection Succeeded."); /* Once the database connection has succeeded, the code in db.once is executed. */
});

var index = require('./routes/index');
var users = require('./routes/users');
var socket = require('./routes/sockets');

var app = express();

app.listen(conf.sfbroker.port);

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());



// configure passport
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// allow CORS
var origin = conf.frontend.protocol + '://' + conf.frontend.ip + ':' + conf.frontend.port;
var corsOptions = {
    credentials: true,
    headers: 'Content-Type, Authorization, Content-Length, X-Requested-With, X-HTTP-Method-Override',
    preflightContinue: true,
    origin: origin
};

// Enable CORS
app.use(cors(corsOptions));
// Enable CORS Pre-Flight
app.options('*', cors(corsOptions));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

console.log('SFBroker runs on http://' + conf.sfbroker.ip  + ':' + conf.sfbroker.port + '/');