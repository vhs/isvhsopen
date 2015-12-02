'use strict';

var request = require("supertest-as-promised"),
    appPromise = require("../app");

require('chai').should();

describe('isvhsopen api test', function () {

    var app = null;

    before(function(){
        return appPromise.setup().then(function(a){
            app = a;
        });
    });

    it("should return the current status of closed", function(){
        return request(app)
            .get("/api/status")
            .expect(200)
            .then(function(res) {
                res.body.should.have.property("status", "closed");
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
});