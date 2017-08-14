var passport = require('passport');
var User = require('../models/Users.js');
var brokerTransaction = require('../classes/Broker');

function loggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.status(401).json({
            status: 'LogIn'
        });
    }
}

function login(req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: 'Wrong Combination!'
            });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.status(300).json({
                    err: 'Could not log in user'
                });
            }
            res.status(200).json({
                status: 'Login successful!'
            });
        });
    })(req, res, next);
}

function logout(req, res) {
    req.logout();
    if (req.method != 'DELETE'){
        res.status(200).json({
           status: 'Action successful! Bye!'
        });
    }
}

function register(req, res, next) {
    User.register(new User({
            username: req.body.username,
            email: req.body.email,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            password: req.body.password,
            balance: 100
        }),
        req.body.password, function (err, account) {
            if (err) {
                return res.status(500).json({
                err: 'Registration failed!You are either using an existing username, or not providing information for mandatory input fields.'
                });
            }
            var broker = brokerTransaction.get({
                username: req.body.username,
                broker: 5
            });
            broker.save(function (err, post) {
                if (err) {
                    return res.status(500).json({
                        err: err
                    });
                }
                passport.authenticate('local')(req, res, function () {
                    return res.status(200).json({
                        status: 'Registration successful!'
                    });
                });
            });

        });
}

module.exports = {
    loggedIn: function (req, res, next) {
        return loggedIn(req, res, next);
    },
    login: function (req, res, next) {
        return login(req, res, next);
    },
    logout: function (req, res) {
        return logout(req, res);
    },
    register: function (req, res) {
        return register(req, res);
    }
}