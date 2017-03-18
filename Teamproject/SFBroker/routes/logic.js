/**
 * Created by alexb on 3/18/2017.
 */
var dbAccess = require('./dbAccess');
var constants = require('../constants');

function findPotentialProvider(consumer, callback) {
    var potentialprovider = '[';
    var consumer = consumer.name;
    var provider;
    var userProcessed = 0;
    dbAccess.find({type: constants.Friendship, userid: consumer}).exec(function (e, res) {
        res.forEach(function (data, index, array) {
            if (data.user_1 == consumer) {
                provider = data.user_2;
            } else if (data.user_2 == consumer) {
                provider = data.user_1;
            }
            dbAccess.find({type: constants.User, userid: provider}).exec(function (e, res) {
                potentialprovider = potentialprovider.concat('{ \"userid\": \"' + res.userid + '\", \"price\": ' + res.price + '}');
                userProcessed += 1;
                if (userProcessed == array.length) {
                    potentialprovider = potentialprovider.concat(']');
                    potentialprovider = potentialprovider.replace('}{', '},{');
                    callback (potentialprovider);
                }
            });
        })
    });
}

module.exports = {
    findPotentialProvider: function (data, callback) {
        return findPotentialProvider(data, callback);
    }

};