const bom = require('gulp-bom');
const debug = require('gulp-debug');
const del = require('del');
const gulp = require('gulp');
const jsonFormat = require('gulp-json-format');
const rename = require('gulp-rename');
const yaml = require('gulp-yaml');

const maxthon = require('./scripts/maxthon');

gulp.task('clean', function () {
  del(['chrome/_locales/*', '!chrome/_locales/.gitkeep']);
  del(['edge/_locales/*', '!edge/_locales/.gitkeep']);
  del(['maxthon/locale/*', '!maxthon/locale/.gitkeep']);
});

gulp.task('i18n-chrome', function () {
  gulp.src('./src/locale/*.yml')
    .pipe(yaml({
      schema: 'DEFAULT_FULL_SCHEMA'
    }))
    .pipe(jsonFormat(4))
    .pipe(rename(function (path) {
      path.dirname = path.basename;
      path.basename = 'messages';
    }))
    .pipe(gulp.dest('./chrome/_locales/'));
});

gulp.task('i18n-edge', function () {
  gulp.src('./src/locale/*.yml')
    .pipe(yaml({
      schema: 'DEFAULT_FULL_SCHEMA'
    }))
    .pipe(jsonFormat(4))
    .pipe(rename(function (path) {
      path.dirname = path.basename;
      path.basename = 'messages';
    }))
    .pipe(gulp.dest('./edge/_locales/'));
});

gulp.task('i18n-maxthon', function () {
  gulp.src('./src/locale/*.yml')
    .pipe(yaml({
      schema: 'DEFAULT_FULL_SCHEMA'
    }))
    .pipe(rename(function (path) {
      path.basename = maxthon.getLangCode(path.basename);
      path.extname = '.ini';
    }))
    .pipe(maxthon.createIni())
    .pipe(bom())
    .pipe(gulp.dest('./maxthon/locale/'));
});

gulp.task('i18n', [
  'i18n-chrome',
  'i18n-edge',
  'i18n-maxthon',
]);

gulp.task('build', [
  'i18n',
]);

gulp.task('default', ['build']);
