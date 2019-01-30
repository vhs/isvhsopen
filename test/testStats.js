'use strict';

var debug = require('debug')('isvhsopen:test:stats'),
    stats = require("../controller/stats"),
    config = require("../controller/config"),
    stateController = require("../controller/state.js"),
    nock = require('nock'),
    sinon = require("sinon"),
    http = require('http'),
    querystring = require('querystring');

var should = require('chai').should();

describe('isvhsopen stats test', function () {

    var state;
    var queryMock;

    before(function () {
        debug("Calling before");
        this.clock = sinon.useFakeTimers();
        debug("Setting influxHost to mockinflux");
        config.set("influxHost", "mockinflux");
        debug("Setting persistent query nock");
        queryMock = mockInfluxQuery();
        debug("persist:", queryMock.pendingMocks());
        debug("Getting stateController");
        return stateController.resetState().then(function (s) {
            debug("persist:", queryMock.pendingMocks());
            state = s;
            debug("Getting initialized stats controller");
            return stats.setup();
        });
    });

    after(function () {
        this.clock.restore();
    });

    var mockInfluxQuery = function () {
        return nock('http://mockinflux:8086')
            .persist()
            .get('/query')
            .query(true)
            .reply(200, {
                "results": [{
                    "statement_id": 0,
                    "series": []
                }]
            });
    };

    var mockInfluxWrite = function (cb) {
        nock('http://mockinflux:8086')
            .post('/write')
            .query(true)
            .reply(200, function (uri, requestBody) {
                cb(requestBody);
            });
    };

    it("should write stats when vhs is open", function (done) {
        this.timeout(5000);
        debug("Calling mockInfluxWrite");
        mockInfluxWrite(function (payload) {
            payload.should.equal('api,name=door,space=vhs duration=2,value="open"');
            done();
        });
        debug("Making clock tick");
        this.clock.tick(2000);
        debug("should write stats when vhs is open");
        state.setOpen();
        debug("opened");
    });

    it("should write stats when the space is closed", function (done) {
        this.timeout(5000);
        mockInfluxWrite(function (payload) {
            payload.should.equal('api,name=door,space=vhs duration=1,value="closed"');
            done();
        });
        this.clock.tick(1000);
        state.setClosed();
    });
});