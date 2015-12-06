'use strict';

var EventEmitter = require('events').EventEmitter,
    moment = require('moment');

var _current = null;

function State() {
    this.status = "closed";
    this.last = new Date();
}

var untilFormat = /[0-2]?\d:\d{2}/;

State.prototype.__proto__ = EventEmitter.prototype;

State.prototype.setOpen = function(until) {
    if (until) {
        if (untilFormat.test(until)) {
            var hourMin = until.split(":");
            var hour = parseInt(hourMin);
            this.openUntil = moment().set({
                hour:hour,
                minute:parseInt(hourMin[1]),
                second: 0,
                millisecond: 0
            });
            if (moment() > this.openUntil) {
                this.openUntil.add(1, 'day');
            }
        }
    }
    if (until === "") {
        delete this.openUntil;
    }
    return this.setStatus("open");
};

State.prototype.setClosed = function() {
    if (this.openUntil) {
        delete this.openUntil;
    }
    return this.setStatus("closed");
};

State.prototype.setStatus = function(newStatus) {
    if (newStatus != this.status) {
        var duration = Math.round((new Date().getTime()-this.last.getTime())/1000);
        this.emit("change", {
            newStatus: newStatus,
            lastStatus: this.last,
            duration: duration
        });
        this.status = newStatus;
        this.last = new Date();

        return Promise.resolve(true);
    } else {
        return Promise.resolve(false);
    }
};

//Set the initial state, don't trigger events.
State.prototype.init = function(initial){
    this.status = initial.status;
    this.last = initial.last;
};

module.exports.currentState = function () {
    if (!_current) {
        _current = new State();
    }
    return Promise.resolve(_current);
};

module.exports.resetState = function () {
    if (_current){
        _current.removeAllListeners();
    }
    _current = new State();
    return Promise.resolve(_current);
};