const request = require('superagent')
const stateController = require('./state')
const debug = require('debug')('isvhsopen:controller:slack')
const config = require('./config')

const postNotification = function (payload) {
  return new Promise(function (resolve, reject) {
    const url = config.get('slackHookUrl')
    if (url && url.length > 0) {
      return request('POST', url)
        .send(payload)
        .end(function (err) {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
    } else {
      reject(new Error('No slack hook has been defined'))
    }
  })
}

module.exports.setup = function () {
  return stateController.currentState().then(function (state) {
    state.on('change', function (event) {
      const payload = {
        username: 'IsVHSOpenBot',
        text: 'VHS is now <http://isvhsopen.com|' + event.newStatus + '>' + (state.openUntil ? ' until ' + state.openUntil.format('HH:mm') : '')
      }
      postNotification(payload).then(function () {
        debug('payload sent to slack:')
        debug(payload)
      })
        .catch(function (err) {
          debug(err)
        })
    })
  })
}
