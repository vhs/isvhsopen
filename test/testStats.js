'use strict';

var slack = require("../controller/stats"),
    config = require("../controller/config"),
    stateController = require("../controller/state.js"),
    nock = require('nock'),
    sinon = require("sinon"),
    querystring = require('querystring');

var should = require('chai').should();

describe('isvhsopen stats test', function () {

    var state;

    before(function(){
        this.clock = sinon.useFakeTimers();
        config.set("influxHost", "mockinflux");
        return stateController.resetState().then(function(s){
            state = s;
            return slack.setup();
        });
    });

    after(function(){
        this.clock.restore();
    });

    var mockInflux = function(cb) {
        nock('http://mockinflux:8086')
            .post('/write')
            .query(true)
            .reply(function(uri, requestBody) {
                cb(requestBody);
                return [200];
            });
    };

    it("should write stats when vhs is open", function(done){
        this.timeout(5000);
        mockInflux(function(payload){
            //payload.should.equal('api,space=vhs,name=door value="open",duration=2');
            payload.should.equal('api,name=door,space=vhs value="open",duration=2');
            done();
        });
        this.clock.tick(2000);
        state.setOpen();
    });

    it("should alert slack when the space is closed", function(done){
        this.timeout(5000);
        mockInflux(function(payload){
            //payload.should.equal('api,space=vhs,name=door value="closed",duration=1');
            payload.should.equal('api,name=door,space=vhs value="closed",duration=1');
            done();
        });
        this.clock.tick(1000);
        state.setClosed();
    });
});
