'use strict';
var express = require('express'),
    router = express.Router(),
    stateController = require('../controller/state'),
    moment = require('moment'),
    request = require('superagent'),
    hbs = require('hbs');

hbs.registerHelper('toLower', function(str) {
    return str.toLowerCase();
});

hbs.registerHelper('fromNow', function(dt) {
    return moment().from(dt, true);
});

/* GET home page. */
router.get('/', function(req, res, next) {
    //Temporary until we switch the door over.
    request.get('http://api.hackspace.ca/s/vhs/data/door.json')
        .end(function(err, api) {
            if (err) {
                return next(err);
            }
            var context = {
                last: new Date(api.body.last_updated * 1000)
            };
            if (api.body.value === "open") {
                context.status = "Open";
            } else {
                context.status = "Closed";
            }
            res.render('index', context);
        });
});

module.exports = router;
