ExtensionCore.updateDisplayLocale();

function UserConfig() {
    Object.defineProperty(this, "fromLang", {
        get: function() {
            return ExtensionCore.getSetting("fromLang");
        },
        set: function(value) {
            return ExtensionCore.setSetting("fromLang", value);
        }
    });

    Object.defineProperty(this, "toLang", {
        get: function() {
            return ExtensionCore.getSetting("toLang");
        },
        set: function(value) {
            return ExtensionCore.setSetting("toLang", value);
        }
    });

    Object.defineProperty(this, "lastSearchTerm", {
        get: function() {
            return ExtensionCore.getSetting("lastSearched");
        },
        set: function(value) {
            return ExtensionCore.setSetting("lastSearched", value);
        }
    });

    Object.defineProperty(this, "doubleClicked", {
        get: function() {
            return (ExtensionCore.getSetting("dblclicked") == "true");
        },
        set: function(value) {
            return ExtensionCore.setSetting("dblclicked", value);
        }
    });

    Object.defineProperty(this, "mouseSelected", {
        get: function() {
            return (ExtensionCore.getSetting("mouseSelected") == "true");
        },
        set: function(value) {
            return ExtensionCore.setSetting("mouseSelected", value);
        }
    });

    Object.defineProperty(this, "autoPlayAudio", {
        get: function() {
            return (ExtensionCore.getSetting("autoPlayAudio") == "true");
        },
        set: function(value) {
            return ExtensionCore.setSetting("autoPlayAudio", value);
        }
    });

    Object.defineProperty(this, "autoDisplayImage", {
        get: function() {
            return (ExtensionCore.getSetting("autoDisplayImage") == "true");
        },
        set: function(value) {
            return ExtensionCore.setSetting("autoDisplayImage", value);
        }
    });

    Object.defineProperty(this, "lastImageSearchTerm", {
        get: function() {
            return ExtensionCore.getSetting("lastImageSearched");
        },
        set: function(value) {
            return ExtensionCore.setSetting("lastImageSearched", value);
        }
    });

    Object.defineProperty(this, "websites", {
        get: function() {
            return ExtensionCore.getSetting("websites");
        },
        set: function(value) {
            return ExtensionCore.setSetting("websites", JSON.stringify(value));
        }
    });
};

var userConfig = new UserConfig();
var AvailableLangs = {
    English: "en",
    Turkish: "tr",
    Russian: "ru",
    German: "de",
    Spanish: "es",
    French: "fr",
    Chinese: "cn"
};
var BaseDictionary = {
    name: "",
    baseUrl: "",
    tabId: "",
    loadFunc: null,
    divContainer: "",
    defaultAudioUrl: "",
    getUrl: function () {
        return this.baseUrl + this.langs[userConfig.fromLang][userConfig.toLang];
    },
    isSupported: function(fromLang, toLang) {
        return this.langs.hasOwnProperty(fromLang) && this.langs[fromLang].hasOwnProperty(toLang);
    }
};

// restore default settings.
if (!userConfig.fromLang) {
    userConfig.fromLang = AvailableLangs.English;
    userConfig.toLang = AvailableLangs.Turkish;
    userConfig.lastSearchTerm = userConfig.lastSearchTerm || "gezi parkı";
    userConfig.doubleClicked = false;
    userConfig.mouseSelected = false;
}
if (!userConfig.autoPlayAudio) {
    userConfig.autoPlayAudio = false;
}
if (!userConfig.autoDisplayImage) {
    userConfig.autoDisplayImage = false;
    userConfig.lastImageSearchTerm = userConfig.lastImageSearchTerm || "gezi parkı";
}
if (!userConfig.websites) {
    jQuery.getJSON('https://api.github.com/repos/abdllhbyrktr/TurkishDictionary/git/trees/master?recursive=1', function(data) {
        var websites = [];
        var sites = _.filter(data.tree, function (item) {
            return item.path.indexOf('src/sites/') > -1;
        });

        for (var i = 0; i < sites.length; i++) {
            setTimeout(function(url) {
                jQuery.getJSON(url, function(obj) {
                    websites.push(obj);
                    userConfig.websites = websites;
                });
            }, 10 * i, 'https://raw.githubusercontent.com/abdllhbyrktr/TurkishDictionary/master/' + sites[i].path);
        }
    });
}

var Tureng = {
    abbrv: {
        "v.": "verb",
        "f.": "yüklem",
        "n.": "noun",
        "i.": "isim",
        "adv.": "adverb",
        "zf.": "belirteç",
        "adj.": "adjective",
        "s.": "sıfat",
        "prep.": "preposition",
        "ed.": "ilgeç",
        "interj.": "interjection",
        "ünl.": "ünlem",
        "conj.": "conjunction",
        "bağ.": "bağlaç",
        "": null,
        "undefined": null
    },
    langs: {
        en: {
            tr: "en/turkish-english/",
            de: "en/german-english/",
            es: "en/spanish-english/",
            fr: "en/french-english/"
        },
        tr: {
            en: "tr/turkce-ingilizce/"
        },
        de: {
            en: "de/deutsch-englisch/"
        },
        es: {
            en: "es/espanol-ingles/"
        },
        fr: {
            en: "fr/francais-anglais/"
        }
    }
};
var Wordreference = {
    langs: {
        en: {
            tr: "entr/",
            de: "ende/",
            es: "es/translation.asp?tranword=",
            fr: "enfr/",
            ru: "enru/",
            cn: "enzh/"
        },
        tr: {
            en: "tren/"
        },
        de: {
            en: "deen/"
        },
        es: {
            en: "es/en/translation.asp?spen=",
            fr: "esfr/"
        },
        fr: {
            en: "fren/",
            es: "fres/"
        },
        ru: {
            en: "ruen/"
        },
        cn: {
            en: "zhen/"
        }
    }
};
var DictionaryReference = {
    langs: {
        en: {
            en : "browse/"
        }
    }
};
var YandexTranslate = {
    langs: {
        en: {
            tr: "&lang=en-tr&text=",
            de: "&lang=en-de&text=",
            es: "&lang=en-es&text=",
            fr: "&lang=en-fr&text=",
            ru: "&lang=en-ru&text=",
            cn: "&lang=en-zh&text="
        },
        tr: {
            en: "&lang=tr-en&text=",
            de: "&lang=tr-de&text=",
            es: "&lang=tr-es&text=",
            fr: "&lang=tr-fr&text=",
            ru: "&lang=tr-ru&text=",
            cn: "&lang=tr-zh&text="
        },
        de: {
            tr: "&lang=de-tr&text=",
            en: "&lang=de-en&text=",
            es: "&lang=de-es&text=",
            fr: "&lang=de-fr&text=",
            ru: "&lang=de-ru&text=",
            cn: "&lang=de-zh&text="
        },
        es: {
            tr: "&lang=es-tr&text=",
            en: "&lang=es-en&text=",
            de: "&lang=es-de&text=",
            fr: "&lang=es-fr&text=",
            ru: "&lang=es-ru&text=",
            cn: "&lang=es-zh&text="
        },
        fr: {
            tr: "&lang=fr-tr&text=",
            en: "&lang=fr-en&text=",
            de: "&lang=fr-de&text=",
            es: "&lang=fr-es&text=",
            ru: "&lang=fr-ru&text=",
            cn: "&lang=fr-zh&text="
        },
        ru: {
            tr: "&lang=ru-tr&text=",
            en: "&lang=ru-en&text=",
            de: "&lang=ru-de&text=",
            es: "&lang=ru-es&text=",
            fr: "&lang=ru-fr&text=",
            cn: "&lang=ru-zh&text="
        },
        cn: {
            tr: "&lang=zh-tr&text=",
            en: "&lang=zh-en&text=",
            de: "&lang=zh-de&text=",
            es: "&lang=zh-es&text=",
            fr: "&lang=zh-fr&text=",
            ru: "&lang=zh-ru&text="
        }
    }
};
var TdkSozluk = {
    langs: {
        tr: {
            tr: "?option=com_gts&arama=gts&kelime="
        }
    }
};
var Abbyy = {
    langs: {
        en: {
            ru: "en-us/translate/en-ru/"
        },
        es: {
            en: "es-mx/translate/es-en/",
            ru: "es-mx/translate/es-ru/"
        },
        de: {
            ru: "en-us/translate/de-ru/"
        },
        fr: {
            ru: "en-us/translate/fr-ru/"
        },
        ru: {
            en: "ru-ru/translate/ru-en/",
            ru: "ru-ru/translate/ru-ru/",
            de: "ru-ru/translate/ru-de/",
            es: "ru-ru/translate/ru-es/",
            fr: "ru-ru/translate/ru-fr/"
        }
    }
};
var SozlukNet = {
    langs: {
        en: {
            en: "?sozluk=english&word=",
            tr: "?sozluk=ingilizce&word=",
            de: "?sozluk=german&word=",
            es: "?sozluk=spanish&word=",
            fr: "?sozluk=french&word=",
            ru: "?sozluk=russian&word="
        },
        tr: {
            en: "?sozluk=ingilizce&word=",
            tr: "?sozluk=turkce&word=",
            de: "?sozluk=almanca&word=",
            es: "?sozluk=ispanyolca&word=",
            fr: "?sozluk=fransizca&word=",
            ru: "?sozluk=rusca&word="
        },
        de: {
            tr: "?sozluk=almanca&word="
        },
        es: {
            tr: "?sozluk=ispanyolca&word="
        },
        fr: {
            tr: "?sozluk=fransizca&word="
        },
        ru: {
            tr: "?sozluk=rusca&word="
        }
    }
};
var DictCn = {
    langs: {
        en: {
            cn: ""
        },
        es: {
            cn: ""
        },
        de: {
            cn: ""
        },
        fr: {
            cn: ""
        },
        ru: {
            cn: ""
        }
    }
};
var NotSupported = {
    langs: {
        de: {
            de: ""
        },
        es: {
            es: ""
        },
        fr: {
            fr: ""
        },
        cn: {
            cn: ""
        }
    }
};

_.extend(Tureng, BaseDictionary);
_.extend(Wordreference, BaseDictionary);
_.extend(DictionaryReference, BaseDictionary);
_.extend(YandexTranslate, BaseDictionary);
_.extend(TdkSozluk, BaseDictionary);
_.extend(Abbyy, BaseDictionary);
_.extend(SozlukNet, BaseDictionary);
_.extend(DictCn, BaseDictionary);
_.extend(NotSupported, BaseDictionary);

Tureng.name = "Tureng";
Tureng.baseUrl = "http://tureng.com/";
Tureng.tabId = "turengTab";
Tureng.divContainer = "#searchPage";
Wordreference.name = "Wordreference.com";
Wordreference.baseUrl = "http://www.wordreference.com/";
Wordreference.tabId = "wordReferenceTab";
Wordreference.divContainer = "#articleWRD";
DictionaryReference.name = "Dictionary.com";
DictionaryReference.baseUrl = "http://dictionary.reference.com/";
DictionaryReference.tabId = "dictionaryTab";
DictionaryReference.divContainer = ".source-data";
YandexTranslate.name = "Yandex.Translate";
YandexTranslate.baseUrl = "https://ceviri.yandex.com.tr/";
YandexTranslate.tabId = "yandexTab";
YandexTranslate.divContainer = "#DictionaryOutput";
TdkSozluk.name = "Tdk";
TdkSozluk.baseUrl = "http://tdk.gov.tr/index.php";
TdkSozluk.tabId = "tdkTab";
TdkSozluk.divContainer = "#tdkContainer";
Abbyy.name = "Abbyy";
Abbyy.baseUrl = "https://www.lingvolive.com/";
Abbyy.tabId = "abbyyTab";
Abbyy.divContainer = ".js-search-results";
SozlukNet.name = "Sozluk.net";
SozlukNet.baseUrl = "http://sozluk.net/index.php";
SozlukNet.tabId = "sozlukNetTab";
SozlukNet.divContainer = "#sozlukNetContainer";
DictCn.name = "Dict.cn";
DictCn.baseUrl = "http://dict.cn/";
DictCn.tabId = "dictCnTab";
DictCn.divContainer = "#dictCnContainer";
NotSupported.name = "Not Supported";
NotSupported.baseUrl = "#";
NotSupported.tabId = "notSupportedTab";
NotSupported.divContainer = "#notSupportedContainer";

var AllWebsites = [Tureng, Wordreference, DictionaryReference, YandexTranslate, TdkSozluk, Abbyy, SozlukNet, DictCn, NotSupported];

function getUrl(tabName) {
    return _.findWhere(AllWebsites, {tabId: tabName}).getUrl();
}

function getDivContainer(tabName) {
    return _.findWhere(AllWebsites, {tabId: tabName}).divContainer;
}

function getLoadFunc(tabName) {
    return _.findWhere(AllWebsites, {tabId: tabName}).loadFunc;
}

function getAudioSourceUrl(tabName) {
    return _.findWhere(AllWebsites, {tabId: tabName}).defaultAudioUrl;
}

function clearSelection() {
    if (document.selection) {
        document.selection.empty();
    } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}

function localizeHtml() {
    //jQuery("head title").text(ExtensionCore.i18n("app.settings"));
    jQuery("[data-lang]").each(function () {
        var text = "";
        var keys = jQuery(this).attr("data-lang");
        keys.split(/\|/g).forEach(function (element, index, array) {
            if (text == "") {
                text = ExtensionCore.i18n(element);
            } else {
                text += ExtensionCore.i18n(element) + " ";
            }
        });

        jQuery(this).text(text);
    });
    jQuery("[data-lang-value]").each(function () {
        var key = jQuery(this).attr("data-lang-value");
        jQuery(this).attr("value", ExtensionCore.i18n(key));
    });
    jQuery("[data-lang-placeholder]").each(function () {
        var key = jQuery(this).attr("data-lang-placeholder");
        jQuery(this).attr("placeholder", ExtensionCore.i18n(key));
    });
    jQuery("[data-lang-alt]").each(function () {
        var alt = jQuery(this).attr("alt");
        var key = jQuery(this).attr("data-lang-alt");
        jQuery(this).attr("alt", alt + ExtensionCore.i18n(key));
    });
    jQuery("[data-lang-title]").each(function () {
        var key = jQuery(this).attr("data-lang-title");
        jQuery(this).attr("title", ExtensionCore.i18n(key));
    });
}

String.prototype.getLocalKey = function() {
    return "app." + this;
};

String.prototype.getLanguageIcon = function() {
    var prefix = "famfamfam-flag-";
    if (this == AvailableLangs.English) {
        return prefix + "us";
    }

    return prefix + this;
};

String.prototype.getOnlyWord = function() {
    var word = this;
    word = word.replace(/[0-9"`\/|&?!:;.,_-]/g, " ");
    word = word.replace(/^\s+|\s+$/g, "");
    word = word.replace(/\s{2,128}/g, " ");
    word = word.replace("'", "\\'");

    return word;
};

EventBus = (function () {

    var _callbacks = {};

    var on = function (eventName, callback) {
        if (!_callbacks[eventName]) {
            _callbacks[eventName] = [];
        }

        _callbacks[eventName].push(callback);
    };

    var off = function (eventName, callback) {
        var callbacks = _callbacks[eventName];
        if (!callbacks) {
            return;
        }

        var index = -1;
        for (var i = 0; i < callbacks.length; i++) {
            if (callbacks[i] === callback) {
                index = i;
                break;
            }
        }

        if (index < 0) {
            return;
        }

        _callbacks[eventName].splice(index, 1);
    };

    var trigger = function (eventName) {
        var callbacks = _callbacks[eventName];
        if (!callbacks || !callbacks.length) {
            return;
        }

        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i].apply(this, args);
        }
    };

    return {
        on: on,
        off: off,
        trigger: trigger
    };
})();
