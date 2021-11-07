const debug = require('debug')('isvhsopen:test:utils')
const http = require('http')
const nock = require('nock')

let originalRequest

const httpLogAllRequests = function () {
  originalRequest = http

  http.request = function wrapMethodRequest (req) {
    debug('wrapMethodRequest:')
    debug(req)
    return originalRequest.apply(this, arguments)
  }
}

const mockInfluxQuery = function () {
  debug('mockInfluxQuery', 'got set up')
  return new Promise(function (resolve, reject) {
    nock('http://mockinflux:8086')
      .persist()
      .get('/query')
      .query(true)
      .reply(200, function (uri, requestBody) {
        debug('mockInfluxQuery', 'got invoked')
        return [{ time: '2019-01-01T00:00:00.000Z', duration: 7105, name: 'door', space: 'vhs', value: 'closed' }]
      })
    resolve()
  })
}

const mockInfluxWrite = function () {
  debug('mockInfluxWrite', 'got set up')
  return new Promise(function (resolve, reject) {
    nock('http://mockinflux:8086')
      .post('/write')
      .query(true)
      .reply(200, function (uri, requestBody) {
        debug('mockInfluxWrite', 'got invoked')
        resolve(requestBody)
      })
  })
}

const mockSlack = function () {
  debug('mockSlack', 'got set up')
  return new Promise(function (resolve, reject) {
    nock('http://mockslack')
      .post('/mock/webhook')
      .reply(200, function (uri, requestBody) {
        debug('mockSlack', 'got invoked')
        let payload = requestBody
        if (typeof payload !== 'object') payload = JSON.parse(requestBody)
        resolve(payload)
      })
  })
}

module.exports.httpLogAllRequests = httpLogAllRequests
module.exports.mockInfluxQuery = mockInfluxQuery
module.exports.mockInfluxWrite = mockInfluxWrite
module.exports.mockSlack = mockSlack
