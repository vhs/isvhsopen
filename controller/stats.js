'use strict'

const Influx = require('influx')
const stateController = require('./state')
const debug = require('debug')('isvhsopen:controller:stats')
const config = require('./config')

let _instance

function writeEvent (event) {
  debug('writeEvent:', event)
  const points = [{
    measurement: 'api',
    tags: {
      name: 'door',
      space: 'vhs'
    },
    fields: {
      duration: event.duration,
      value: event.newStatus
    }
  }]

  debug('writing points:', points)

  return _instance.writePoints(points)
}

function getLastStatus () {
  const resultSet = {
    status: 'unknown',
    last: new Date()
  }

  debug('getLastStatus', 'Getting last status')
  const query = "select * from api where space='vhs' and \"name\"='door' order by time desc limit 1;"

  debug('getLastStatus', 'Doing query')

  return _instance.query(query)
    .then(function (results) {
      debug('Getting last status query result:')
      debug(results)

      if (results[0] && results[0].value !== undefined) {
        debug('getLastStatus', 'Got result')

        const item = results[0]

        resultSet.status = item.value
        resultSet.last = new Date(item.time)

        return resultSet
      }

      debug('getLastStatus', 'Got unknown result')
      debug('getLastStatus', 'results:', JSON.stringify(results))

      return resultSet
    })
    .catch(function (err) {
      debug('getLastStatus', 'Got error:', err)

      return resultSet
    })
}

module.exports.setup = function () {
  const options = {
    host: config.get('influxHost'),
    port: config.get('influxPort'),
    username: config.get('influxUser'),
    password: config.get('influxPw'),
    protocol: 'http',
    database: config.get('influxDb')
  }

  debug('setup', options)

  _instance = new Influx.InfluxDB(options)

  let state

  return stateController.currentState().then(function (s) {
    debug('Getting currentState')
    state = s

    debug('Registering change listener')
    state.on('change', function (event) {
      writeEvent(event)
        .then(function (data) {
          debug('Wrote changes to influx')
          debug('event:', event)
          debug('data:', data)

          return data
        })
        .catch(function (err) {
          debug(err)
        })
    })

    debug('Returning getLastStatus')

    return getLastStatus()
  })
    .then(function (last) {
      state.init(last)
    })
    .catch(function (err) {
      debug(err)
    })
}

module.exports.getLastStatus = getLastStatus
