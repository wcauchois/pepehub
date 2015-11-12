var gulp = require('gulp'),
    less = require('gulp-less'),
    browserify = require('browserify'),
    reactify = require('reactify'),
    source = require('vinyl-source-stream'),
    uglify = require('gulp-uglify'),
    streamify = require('gulp-streamify'),
    argv = require('yargs').argv,
    colors = require('colors'),
    hashDigest = require('./lib/hash-digest');

var devMode = (typeof argv.dev !== 'undefined');
if (devMode) {
  console.log("Dev mode: not minifying scripts".green);
}

gulp.task('scripts', function() {
  var basePipe = browserify('src/js/app.js')
    .transform(reactify)
    .bundle()
    .pipe(source('bundle.js'))
  var finalPipe;
  if (devMode) {
    finalPipe = basePipe;
  } else {
    finalPipe = basePipe.pipe(streamify(uglify()))
  }
  finalPipe
    .pipe(hashDigest())
    .pipe(gulp.dest('resources/public/build/scripts'));
});

gulp.task('styles', function() {
  gulp.src('src/less/*.less')
    .pipe(less())
    .pipe(gulp.dest('resources/public/build/styles'));
});

gulp.task('default', ['scripts', 'styles']);

gulp.task('watch', ['scripts', 'styles'], function() {
  gulp.watch('src/js/**', ['scripts']);
  gulp.watch('src/less/**', ['styles']);
});

gulp.task('heroku:production', ['default']);

