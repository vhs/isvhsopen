'use strict'

const convict = require('convict')

// define a schema

const conf = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  influxHost: {
    doc: 'Influx Host',
    format: String,
    default: 'localhost',
    env: 'INFLUX_HOST'
  },
  influxPort: {
    doc: 'Influx Port',
    format: 'port',
    default: 8086,
    env: 'INFLUX_PORT'
  },
  influxUser: {
    doc: 'Influx User',
    format: String,
    default: '',
    env: 'INFLUX_USER'
  },
  influxPw: {
    doc: 'Influx Password',
    format: String,
    default: '',
    env: 'INFLUX_PASSWORD'
  },
  influxDb: {
    doc: 'Influx Database',
    format: String,
    default: 'api',
    env: 'INFLUX_DB'
  },
  slackHookUrl: {
    doc: 'Slack WebHook Url ',
    format: String,
    default: '',
    env: 'SLACK_WEB_HOOK_URL'
  }
})

conf.validate()

module.exports = conf
