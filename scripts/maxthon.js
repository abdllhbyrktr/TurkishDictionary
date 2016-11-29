const _ = require('underscore');
const through = require('through2');

const MAXTHON_LANG_CODES = [
  'de-de',
  'en',
  'es-es',
  'fr-fr',
  'ru-ru',
  'tr-tr',
  'uk-uk',
];

function getLangCode(lang) {
  return _.find(MAXTHON_LANG_CODES, function (langCode) {
    return langCode.indexOf(lang) > -1;
   });
}

function createIni() {
  return through.obj(function (file, enc, callback) {
      var contents = '[lang]';
      var fileObj = JSON.parse(String(file.contents));

      for (var prop in fileObj) {
        contents += '\n' + prop.replace('_', '.') + '=' + fileObj[prop].message;
      }

      file.contents = Buffer.from(contents);
      this.push(file);
      callback();
    });
}

module.exports = {
  createIni: createIni,
  getLangCode: getLangCode
}
