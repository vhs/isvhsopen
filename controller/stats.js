'use strict';

var Influx = require('influx'),
    stateController = require('./state'),
    debug = require('debug')('isvhsopen:stats'),
    config = require('./config');

var _instance;

function writeEvent(event) {
    debug("writeEvent:", event);
    var points = [{
        measurement: 'api',
        tags: {
            name: "door",
            space: "vhs"
        },
        fields: {
            duration: event.duration,
            value: event.newStatus
        },
    }];
    debug("writing points:", points);
    return _instance.writePoints(points);
}

function getLastStatus() {
    var result_set = {
        status: "unknown",
        last: new Date()
    };

    debug("getLastStatus", "Getting last status");
    var query = "select * from api where space='vhs' and \"name\"='door' order by time desc limit 1;";
    debug("getLastStatus", "Doing query");
    return _instance.query(query)
        .then(function (results) {
            debug("Getting last status query result:");
            debug(results);
            if (results[0] && results[0][0]) {
                debug("getLastStatus", "Got result");
                let item = results[0][0];
                result_set.status = item.value;
                result_set.last = new Date(item.time);
                return result_set;
            }
            debug("getLastStatus", "Got unknown result");
            return result_set;
        })
        .catch(function (err) {
            debug("getLastStatus", "Got error");
            return result_set;
        });
}

module.exports.setup = function () {
    var options = {
        host: config.get("influxHost"),
        port: config.get("influxPort"),
        username: config.get("influxUser"),
        password: config.get("influxPw"),
        protocol: 'http',
        database: config.get("influxDb")
    };
    debug("setup", options);
    _instance = new Influx.InfluxDB(options);
    var state;
    return stateController.currentState().then(function (s) {
            debug("Getting currentState");
            state = s;
            debug("Registering change listener");
            state.on("change", function (event) {
                writeEvent(event)
                    .then(function (data) {
                        debug("Wrote changes to influx");
                        debug("event:", event);
                        debug("data:", data);
                        return data;
                    })
                    .catch(function (err) {
                        debug(err);
                    })
            });
            debug("Returning getLastStatus");
            return getLastStatus();
        })
        .then(function (last) {
            state.init(last);
        })
        .catch(function (err) {
            debug(err);
        });
};

module.exports.getLastStatus = getLastStatus;