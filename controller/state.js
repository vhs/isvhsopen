'use strict';

var _current = null;

function State() {
    this.status = "closed";
    this.last = new Date();
}

State.prototype.setOpen = function(until) {
    if (until) {
        this.openUntil = until;
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
        this.status = newStatus;
        this.last = new Date();
        return Promise.resolve(true);
    } else {
        return Promise.resolve(false);
    }
};

module.exports.currentState = function () {
    if (!_current) {
        _current = new State();
    }
    return Promise.resolve(_current);
};