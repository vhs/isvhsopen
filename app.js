const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const routes = require('./routes/index')
const api = require('./routes/api')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', routes)

const appPromise = api.setup()
  .then(function (apiRoutes) {
    app.use('/api', apiRoutes)
  })
  .then(function () {
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      const err = new Error('Not Found')

      err.status = 404
      next(err)
    })

    // Error handler that prints a stack trace
    app.use(function (err, req, res, next) {
      res.status(err.status || 500)
      res.render('error', {
        message: err.message,
        error: err
      })
      console.log(err)
    })

    return app
  })

module.exports.setup = function () {
  return appPromise
}
