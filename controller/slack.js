var request = require('superagent'),
    stateController = require('./state'),
    debug = require('debug')('isvhsopen:slack'),
    config = require('./config');

var postNotification = function(payload){
    return new Promise(function(resolve, reject) {
        var url = config.get("slackHookUrl");
        if (url && url.length > 0) {
            return request('POST', url)
                .send(payload)
                .end(function(err) {
                    if (err){
                        reject(err);
                    } else {
                        resolve();
                    }
                });
        } else {
            reject("No slack hook has been defined");
        }
    });
};

module.exports.setup = function() {
    return stateController.currentState().then(function(state){
        state.on("change", function(event) {
            var payload = {
                "username": "IsVHSOpenBot",
                "text": "VHS is now <http://isvhsopen.com|" + event.newStatus + ">" + (state.openUntil ? " until " + state.openUntil.format("HH:mm") : "" )
            };
            postNotification(payload).then(function(){
                debug("payload sent to slack:");
                debug(payload);
            })
            .catch(function(err){
                debug(err);
            });
        });
    });
};
