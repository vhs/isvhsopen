var express = require('express'),
    router = express.Router(),
    stateController = require('../controller/state');

var state = null;

router.get('/status', function(req, res, next) {
    stateController.currentState()
        .then(function(state) {
            res.json(state);
        })
        .catch(next);
});

function changeStatus(status) {
    return function(req, res, next) {
        var promise;
        if (status === "open") {
            promise = state.setOpen(req.body.until);
        } else {
            promise = state.setClosed();
        }
        promise.then(function(changed){
            var result = {
                result: "ok",
                status: state.status,
                last: state.last
            };
            if (!changed) {
                result.noChanges = true;
            }
            res.json(result);
        }).catch(next);
    }
}

router.post('/status/open', changeStatus("open"));
router.post('/status/closed', changeStatus("closed"));

module.exports.setup = function(){
    return stateController.currentState()
        .then(function(s){
            state = s;
            return router;
        });
};
