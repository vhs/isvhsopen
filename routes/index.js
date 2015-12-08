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

hbs.registerHelper('since', function(dt) {
    var date = moment(dt);

    var today = moment().set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    });
    if (date>today){
        return date.format("h:mm a");
    }
    var yesterday = today.add(-1,'day');
    if (date>yesterday) {
        return date.format("[yesterday at] h:mm a");
    }
    var thisweek = today.add(-7,'day');
    if (date>thisweek){
        return date.format("dddd, h:mm a");
    }
    return date.format("MMMM Do, h:mm a");
});

hbs.registerHelper('time', function(dt) {
    return moment(dt).format("h:mma");
});

function statusContext(req, res, next) {
    stateController.currentState()
        .then(function(state){
            res.locals.last = state.last;
            res.locals.title = "Is VHS Open?";
            if (state.status === "open") {
                res.locals.textClass = "text-success";
                res.locals.status = "Open";
            } else {
                res.locals.status = "Closed";
            }

            if (state.openUntil && state.openUntil > moment()) {
                res.locals.openUntil = state.openUntil;
            }
            next();
        })
        .catch(next);
}

/* GET home page. */
router.get('/', statusContext, function(req, res) {
    res.render('index');
});

router.get('/plain', statusContext, function(req, res) {
    res.header('Content-Type', 'text/plain');
    res.render('index', { layout: 'plain' });
});

statsController.setup();
module.exports = router;
