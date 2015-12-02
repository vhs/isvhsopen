var express = require('express');
var router = express.Router();
var stateController = require('../controller/state');
var hbs = require('hbs');

hbs.registerHelper('toLower', function(str) {
    return str.toLowerCase();
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
