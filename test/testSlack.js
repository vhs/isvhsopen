'use strict';

var debug = require('debug')('isvhsopen:test:slack'),
    slack = require("../controller/slack"),
    config = require("../controller/config"),
    stateController = require("../controller/state.js"),
    nock = require('nock'),
    querystring = require('querystring');

var should = require('chai').should();

describe('isvhsopen slack test', function () {

    var state;

    before(function () {
        config.set("slackHookUrl", "http://mockslack/mock/webhook");
        return stateController.resetState().then(function (s) {
            state = s;
            return slack.setup();
        });
    });

    var mockSlack = function (cb) {
        nock('http://mockslack')
            .post('/mock/webhook')
            .reply(200, function (uri, requestBody) {
                var payload = requestBody;
                if( typeof payload != 'object' )
                    payload = JSON.parse(requestBody);
                cb(payload);
            });
    };

    it("should alert slack when the space is open", function (done) {
        this.timeout(1000);
        mockSlack(function (payload) {
            payload.should.have.property("text", "VHS is now <http://isvhsopen.com|open> until 20:00");
            done();
        });
        state.setOpen("20:00");
    });

    it("should alert slack when the space is closed", function (done) {
        this.timeout(1000);
        mockSlack(function (payload) {
            payload.should.have.property("text", "VHS is now <http://isvhsopen.com|closed>");
            done();
        });
        state.setClosed();
    });

    it("should alert slack when the space is open, omitting time if not specified", function (done) {
        this.timeout(1000);
        mockSlack(function (payload) {
            payload.should.have.property("text", "VHS is now <http://isvhsopen.com|open>");
            done();
        });
        state.setOpen();
    });
});