'use strict'

const gulp = require('gulp')
const mocha = require('gulp-mocha')
const watchify = require('watchify')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const logger = require('fancy-log')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')(require('node-sass'))

gulp.task('test', function () {
  return gulp.src('test/*.js', { read: false })
    .pipe(mocha({ reporter: 'nyan' }))
})

const opts = Object.assign({}, watchify.args, {
  entries: './app/main.jsx',
  extensions: ['.jsx'],
  debug: true
})

const b = browserify(opts)

b.on('update', bundle(false)) // on any dep update, runs the bundler
b.on('log', logger) // output build logs to terminal
b.transform('babelify', { presets: ['@babel/preset-env', '@babel/preset-react'] })

function bundle (watch) {
  return function () {
    let target

    if (watch) {
      target = watchify(b)
    } else {
      target = b
    }

    return target.bundle()
    // log errors if they happen
      .on('error', (err) => logger.error('Browserify Error:', err))
      .pipe(source('bundle.js'))
    // optional, remove if you don't need to buffer file contents
      .pipe(buffer())
    // optional, remove if you dont want sourcemaps
      .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
    // Add transformation tasks to the pipeline here.
      .pipe(sourcemaps.write('./')) // writes .map file
      .pipe(gulp.dest('./dist'))
  }
}

gulp.task('copy-fonts', function () {
  return gulp.src('./node_modules/bootstrap-sass/assets/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})

gulp.task('sass', function () {
  return gulp.src('./public/stylesheets/**.sass')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/css'))
})

gulp.task('sass-watch', function () {
  gulp.watch('./public/stylesheets/**.sass', ['sass'])
})

gulp.task('js', bundle(false))
gulp.task('js-watch', bundle(true))
gulp.task('watch', gulp.series('copy-fonts', 'sass', 'sass-watch', 'js-watch'))
gulp.task('build', gulp.series('copy-fonts', 'sass', 'js'))
