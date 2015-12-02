'use strict';
var express = require('express'),
    router = express.Router(),
    stateController = require('../controller/state'),
    moment = require('moment'),
    hbs = require('hbs');

hbs.registerHelper('toLower', function(str) {
    return str.toLowerCase();
});

hbs.registerHelper('fromNow', function(dt) {
    return moment().from(dt, true);
});

/* GET home page. */
router.get('/', function(req, res, next) {
    stateController.currentState().then(function(state) {
        var context = {
            last: state.last
        };
        if (state.status === "open") {
            context.status = "Open";
        } else {
            context.status = "Closed";
        };
        res.render('index', context);
    })
        .catch(next);
});

module.exports = router;
