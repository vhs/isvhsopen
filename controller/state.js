const EventEmitter = require('events').EventEmitter
const moment = require('moment')
const debug = require('debug')('isvhsopen:controller:state')

let _current = null

const untilFormat = /[0-2]?\d:\d{2}/

function State () {
  this.debug = debug.extend('State')
  this.debug('new instance')
  this.status = 'closed'
  this.last = new Date()
}

// eslint-disable-next-line no-proto
State.prototype.__proto__ = EventEmitter.prototype

State.prototype.setOpen = function (until) {
  this.debug('setOpen', 'until:', until)

  if (until && until !== '') {
    if (untilFormat.test(until)) {
      const hourMin = until.split(':')
      const hour = parseInt(hourMin)

      this.openUntil = moment().set({
        hour: hour,
        minute: parseInt(hourMin[1]),
        second: 0,
        millisecond: 0
      })

      if (moment() > this.openUntil) {
        this.openUntil.add(1, 'day')
      }
    }
  } else {
    delete this.openUntil
  }

  return this.setStatus('open')
}

State.prototype.setClosed = function () {
  this.debug('setClosed')

  if (this.openUntil) {
    delete this.openUntil
  }

  return this.setStatus('closed')
}

State.prototype.setStatus = function (newStatus) {
  this.debug('setStatus', 'newStatus:', newStatus)

  if (newStatus !== this.status) {
    const duration = Math.round((new Date().getTime() - this.last.getTime()) / 1000)

    this.status = newStatus
    this.last = new Date()

    const changeEvent = {
      newStatus: newStatus,
      lastStatus: this.last,
      duration: duration
    }

    // If this is an "open" event and a time is specified, include it in the update
    if (newStatus === 'open' && moment.isMoment(this.openUntil)) {
      changeEvent.openUntil = this.openUntil
    }

    this.emit('change', changeEvent)

    return Promise.resolve(true)
  } else {
    return Promise.resolve(false)
  }
}

// Set the initial state, don't trigger events.
State.prototype.init = function (initial) {
  this.status = initial.status
  this.last = initial.last
}

module.exports.currentState = function () {
  debug('currentState')

  if (!_current) {
    _current = new State()
  }
  return Promise.resolve(_current)
}

module.exports.resetState = function () {
  debug('resetState')

  if (_current) {
    _current.removeAllListeners()
  }

  _current = new State()

  return Promise.resolve(_current)
}
