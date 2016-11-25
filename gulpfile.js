const debug = require('gulp-debug');
const del = require('del');
const gulp = require('gulp');
const jsonFormat = require('gulp-json-format');
const rename = require("gulp-rename");
const yaml = require('gulp-yaml');

gulp.task('clean', function () {
  del(['chrome/_locales/*', '!chrome/_locales/.gitkeep']);
  del(['edge/_locales/*', '!edge/_locales/.gitkeep']);
});

gulp.task('i18n-chrome', function () {
  gulp.src('./src/locale/*.yml')
  .pipe(yaml({ schema: 'DEFAULT_FULL_SCHEMA' }))
  .pipe(jsonFormat(4))
  .pipe(rename(function (path) {
    path.dirname = path.basename;
    path.basename = 'messages';
  }))
  .pipe(gulp.dest('./chrome/_locales/'));
});

gulp.task('i18n-edge', function () {
  gulp.src('./src/locale/*.yml')
  .pipe(yaml({ schema: 'DEFAULT_FULL_SCHEMA' }))
  .pipe(jsonFormat(4))
  .pipe(rename(function (path) {
    path.dirname = path.basename;
    path.basename = 'messages';
  }))
  .pipe(gulp.dest('./edge/_locales/'));
});

gulp.task('i18n', [
  'i18n-chrome',
  'i18n-edge',
]);

gulp.task('build', [
  'i18n',
]);

gulp.task('default', ['build']);
