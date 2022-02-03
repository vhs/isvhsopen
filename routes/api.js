const express = require('express')
const router = express.Router()
const debug = require('debug')('isvhsopen:routes:api')
const stateController = require('../controller/state')

let state = null

router.get('/status', function (req, res, next) {
  stateController.currentState()
    .then(function (state) {
      res.json(state)
    })
    .catch(next)
})

router.get('/googlehome', function (req, res, next) {
  stateController.currentState()
    .then(function (state) {
      res.json({ fulfillmentText: 'VHS is currently ' + state.status + '.' })
    })
    .catch(next)
})

function changeStatus (status) {
  debug('changeStatus', 'setting up for:', status)

  return function (req, res, next) {
    debug('changeStatus', 'called')

    let promise

    if (status === 'open') {
      promise = state.setOpen(req.body.until)
    } else {
      promise = state.setClosed()
    }

    promise.then(function (changed) {
      const result = {
        result: 'ok',
        status: state.status,
        last: state.last,
        openUntil: state.openUntil
      }

      if (!changed) {
        result.noChanges = true
      }

      res.json(result)
    }).catch(next)
  }
}

router.post('/status/open', changeStatus('open'))
router.post('/status/closed', changeStatus('closed'))

module.exports.setup = function () {
  debug('setup', 'setting up')

  return stateController.currentState()
    .then(function (s) {
      debug('setup', 'state:', s)
      state = s

      return router
    })
}
