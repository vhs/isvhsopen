'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var babelify = require('babelify');
var sass = require('gulp-sass')(require('node-sass'));

gulp.task('test', function () {
    return gulp.src('test/*.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

var opts = Object.assign({}, watchify.args, {
    entries: './app/main.jsx',
    extensions: ['.jsx'],
    debug: true
});

var b = browserify(opts);
b.on('update', bundle(false)); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal
b.transform("babelify", {presets: [ require('babel-preset-es2015'), require('babel-preset-react')]});

function bundle(watch) {
    return function(){
        var target;
        if (watch){
            target = watchify(b);
        } else {
            target = b;
        }
        return target.bundle()
            // log errors if they happen
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('bundle.js'))
            // optional, remove if you don't need to buffer file contents
            .pipe(buffer())
            // optional, remove if you dont want sourcemaps
            .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
            // Add transformation tasks to the pipeline here.
            .pipe(sourcemaps.write('./')) // writes .map file
            .pipe(gulp.dest('./dist'));
    }
}

gulp.task('copy-fonts', function () {
    return gulp.src('./node_modules/bootstrap-sass/assets/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('sass', function () {
    return gulp.src('./public/stylesheets/**.sass')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('sass-watch', function () {
    gulp.watch('./public/stylesheets/**.sass', ['sass']);
});

gulp.task('js', bundle(false));
gulp.task('js-watch', bundle(true));
gulp.task('watch', gulp.series('copy-fonts', 'sass', 'sass-watch', 'js-watch'));
gulp.task('build', gulp.series('copy-fonts', 'sass', 'js'));
