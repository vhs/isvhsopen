'use strict';
var express = require('express'),
    router = express.Router(),
    stateController = require('../controller/state'),
    moment = require('moment'),
    statsController = require('../controller/stats'),
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
    statsController.getLastStatus()
        .then(function(status){
            var context = {
                last: status.last,
                title: "Is VHS Open?"
            };
            if (status.status === "open") {
                context.textClass = "text-success";
                context.status = "Open";
            } else {
                context.status = "Closed";
            }
            res.render('index', context);
        })
        .catch(next);
});

statsController.setup();
module.exports = router;
