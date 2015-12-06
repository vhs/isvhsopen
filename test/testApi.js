'use strict';

var request = require("supertest-as-promised"),
    stateController = require("../controller/state.js"),
    appPromise = require("../app");

require('chai').should();

describe('isvhsopen api test', function () {

    var app = null;
    var state = null;

    before(function(){
        return appPromise.setup().then(function(a){
            app = a;
            return stateController.currentState()
        })
            .then(function(s){
                state = s;
                state.init({
                    status: "closed",
                    last: new Date()
                })
            });
    });

    after(function(){
        state.removeAllListeners();
    });

    it("should return the current status of closed", function(){
        return request(app)
            .get("/api/status")
            .expect(200)
            .then(function(res) {
                res.body.should.have.property("status", "unknown");
            });
    });

    it("should update the status to open", function(){
        var lastDate;
        var r = request(app);
        return r
            .post("/api/status/open")
            .expect(200)
            .then(function(res){
                res.body.should.have.property("result", "ok");
                res.body.should.have.property("status", "open");
                res.body.should.have.property("last");
                res.body.should.not.have.property("noChanges");
                lastDate = res.body.last;
                return r.post("/api/status/open").expect(200);
            })
            .then(function(res){
                //Running again shouldn't change the date
                res.body.should.have.property("last", lastDate);
                res.body.should.have.property("noChanges", true);
            });
    });

    it("should return the current status of open", function(){
        return request(app)
            .get("/api/status")
            .expect(200)
            .then(function(res){
                res.body.should.have.property("status", "open");
                res.body.should.have.property("last");
            });
    });

    it("should update the status to closed", function(){
        var lastDate;
        var r = request(app);
        return r
            .post("/api/status/closed")
            .expect(200)
            .then(function(res){
                res.body.should.have.property("result", "ok");
                res.body.should.have.property("status", "closed");
                res.body.should.have.property("last");
                res.body.should.not.have.property("noChanges");
                res.body.should.not.have.property("openUntil");
                lastDate = res.body.last;
                return r.post("/api/status/closed").expect(200);
            })
            .then(function(res){
                //Running again shouldn't change the date
                res.body.should.have.property("last", lastDate);
                res.body.should.have.property("noChanges", true);
            });
    });

    it("should update the status to open until 2:30pm then 3:30 then clear", function(){
        var lastDate;
        var r = request(app);
        return r
            .post("/api/status/open")
            .send({
                until: "14:30"
            })
            .expect(200)
            .then(function(res){
                res.body.should.have.property("result", "ok");
                res.body.should.have.property("status", "open");
                res.body.should.have.property("openUntil", "14:30");
                res.body.should.have.property("last");
                res.body.should.not.have.property("noChanges");
                lastDate = res.body.last;
                return r
                    .post("/api/status/open")
                    .send({
                        until: "15:30"
                    }).expect(200);
            })
            .then(function(res){
                //Running again shouldn't change the date
                res.body.should.have.property("last", lastDate);
                res.body.should.have.property("openUntil", "15:30");
                res.body.should.have.property("noChanges", true);
                return r
                    .post("/api/status/open")
                    .send({
                        until: "15:30"
                    }).expect(200);
            });
    });

    it("should clear the flag when an empty time is sent", function(){
        var lastDate;
        var r = request(app);
        //Nothing should change here
        return r
            .post("/api/status/open")
            .expect(200)
            .then(function(res){
                res.body.should.have.property("result", "ok");
                res.body.should.have.property("status", "open");
                res.body.should.have.property("last");
                res.body.should.have.property("noChanges");
                res.body.should.have.property("openUntil", "15:30");
                lastDate = res.body.last;
                return r
                    .post("/api/status/open")
                    .send({ until: "" })
                    .expect(200);
            })
            .then(function(res){
                //Running again shouldn't change the date
                res.body.should.have.property("last", lastDate);
                res.body.should.not.have.property("openUntil");
                res.body.should.have.property("noChanges", true);
            });
    });
});