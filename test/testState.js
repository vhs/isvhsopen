'use strict';

var debug = require('debug')('isvhsopen:test:state'),
    stateController = require("../controller/state.js"),
    sinon = require("sinon");

var should = require('chai').should();

describe('isvhsopen state test', function () {
    this.timeout(5000);
    var state = null;

    before(function(){
        this.clock = sinon.useFakeTimers();
        return stateController.resetState().then(function(s){
            state = s;
        });
    });

    after(function(){
       this.clock.restore();
    });

    it("should trigger an event when opened", function(done){
        state.once("change", function(data){
            should.exist(data);
            data.should.have.property("duration",2);
            data.should.have.property("newStatus","open");
            done();
        });
        this.clock.tick(2000);
        state.setOpen("20:00");
    });

    it("should trigger an event when closed", function(done){
        state.once("change", function(data){
            should.exist(data);
            data.should.have.property("duration",1);
            data.should.have.property("newStatus","closed");
            done();
        });
        this.clock.tick(1000);
        state.setClosed();
    });

});
