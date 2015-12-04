'use strict';

var Influx = require('influx'),
    stateController = require('./state'),
    debug = require('debug')('isvhsopen:stats'),
    config = require('./config');

var _instance;

function writeEvent(event) {
    return new Promise(function(resolve, reject){
        var points = [
            [{ value: event.newStatus, duration: event.duration }, { space: "vhs", name: "door" }]
        ];
        _instance.writePoints("api", points, function(err){
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

function getLastStatus() {
    return new Promise(function(resolve, reject){
        var query = "select * from api where space='vhs' and name='door' order by time desc limit 1;";
        _instance.query(query, function(err, results) {
            var unknown = {
                status: "unknown",
                last: new Date()
            };
            if (err) {
                return resolve(unknown);
            }
            if (results[0] && results[0][0]) {
                var result = results[0][0];
                return resolve({
                    status: result.value,
                    last: result.time
                });
            }
            return resolve(unknown);
        });
    });
}

module.exports.setup = function() {
    var options = {
        host: config.get("influxHost"),
        port: config.get("influxPort"),
        username: config.get("influxUser"),
        password: config.get("influxPw"),
        protocol : 'http',
        database: config.get("influxDb")
    };
    _instance = Influx(options);
    var state;
    return stateController.currentState().then(function(s) {
        state = s
        state.on("change", function(event) {
            writeEvent(event).then(function(){
                debug("Wrote changes to influx");
                debug(event);
            })
            .catch(function(err){
                debug(err);
            })
        });
        return getLastStatus();
    })
    .then(function(last){
        state.init(last);
    })
    .catch(function(err){
        debug(err);
    });
};

module.exports.getLastStatus = getLastStatus;