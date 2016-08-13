
var AvailableLangs = {
    English: "en",
    Turkish: "tr",
    Russian: "ru",
    German: "de",
    Spanish: "es",
    French: "fr"
};

var UserConfig = (function() {
    function UserConfig() {
        this._fromLang = AvailableLangs.English;
        this._toLang = AvailableLangs.Turkish;
        this._lastSearchTerm = "gezi parkı";
        this._doubleClicked = false;
        this._mouseSelected = false;
        this._currentTab = "turengTab";

        // initialize.
        if (ExtensionCore.allStorage.hasOwnProperty("fromLang")) {
            this._fromLang = ExtensionCore.allStorage["fromLang"];
            this._toLang = ExtensionCore.allStorage["toLang"];
            this._lastSearchTerm = ExtensionCore.allStorage["lastSearchTerm"];
            this._doubleClicked = ExtensionCore.allStorage["doubleClicked"];
            this._mouseSelected = ExtensionCore.allStorage["mouseSelected"];
            this._currentTab = ExtensionCore.allStorage["currentTab"];
        } else {
            ExtensionCore.setSetting("fromLang", this._fromLang);
            ExtensionCore.setSetting("toLang", this._toLang);
            ExtensionCore.setSetting("lastSearchTerm", this._lastSearchTerm);
            ExtensionCore.setSetting("doubleClicked", this._doubleClicked);
            ExtensionCore.setSetting("mouseSelected", this._mouseSelected);
            ExtensionCore.setSetting("currentTab", this._currentTab);
        }
    }
    
    Object.defineProperty(UserConfig.prototype, "fromLang", {
        get: function() {
            return this._fromLang;
        },
        set: function(value) {
            this._fromLang = value;
            ExtensionCore.setSetting("fromLang", value);
        }
    });

    Object.defineProperty(UserConfig.prototype, "toLang", {
        get: function() {
            return this._toLang;
        },
        set: function(value) {
            this._toLang = value;
            ExtensionCore.setSetting("toLang", value);
        }
    });

    Object.defineProperty(UserConfig.prototype, "lastSearchTerm", {
        get: function() {
            return this._lastSearchTerm;
        },
        set: function(value) {
            this._lastSearchTerm = value;
            ExtensionCore.setSetting("lastSearchTerm", value);
        }
    });

    Object.defineProperty(UserConfig.prototype, "doubleClicked", {
        get: function() {
            return this._doubleClicked;
        },
        set: function(value) {
            this._doubleClicked = value;
            ExtensionCore.setSetting("doubleClicked", value);
        }
    });

    Object.defineProperty(UserConfig.prototype, "mouseSelected", {
        get: function() {
            return this._mouseSelected;
        },
        set: function(value) {
            this._mouseSelected = value;
            ExtensionCore.setSetting("mouseSelected", value);
        }
    });

    Object.defineProperty(UserConfig.prototype, "currentTab", {
        get: function() {
            return this._currentTab;
        },
        set: function(value) {
            this._currentTab = value;
            ExtensionCore.setSetting("currentTab", value);
        }
    });

    return UserConfig;
})();

var userConfig = new UserConfig();

var BaseDictionary = {
    name: "",
    baseUrl: "",
    tabId: "",
    loadFunc: null,
    divContainer: "",
    getUrl: function () {
        return this.baseUrl + this.langs[userConfig.fromLang][userConfig.toLang];
    },
    isSupported: function(fromLang, toLang) {
        return this.langs.hasOwnProperty(fromLang) && this.langs[fromLang].hasOwnProperty(toLang);
    }
};
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
    containsTerm: function() {
        if (userConfig.fromLang == AvailableLangs.Turkish || userConfig.toLang == AvailableLangs.Turkish) {
            return "rk";
        }
        
        if (userConfig.fromLang == AvailableLangs.Spanish || userConfig.toLang == AvailableLangs.Spanish) {
            return "pa";
        }
        
        if (userConfig.fromLang == AvailableLangs.French || userConfig.toLang == AvailableLangs.French) {
            return "nc";
        }
        
        if (userConfig.fromLang == AvailableLangs.English || userConfig.toLang == AvailableLangs.German) {
            return "rm";
        } else if (userConfig.fromLang == AvailableLangs.German || userConfig.toLang == AvailableLangs.English) {
            return "tsc";
        }
        
        return "ng";
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
            ru: "enru/"
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
            ru: "&lang=en-ru&text="
        },
        tr: {
            en: "&lang=tr-en&text=",
            de: "&lang=tr-de&text=",
            es: "&lang=tr-es&text=",
            fr: "&lang=tr-fr&text=",
            ru: "&lang=tr-ru&text="
        },
        de: {
            tr: "&lang=de-tr&text=",
            en: "&lang=de-en&text=",
            es: "&lang=de-es&text=",
            fr: "&lang=de-fr&text=",
            ru: "&lang=de-ru&text="
        },
        es: {
            tr: "&lang=es-tr&text=",
            en: "&lang=es-en&text=",
            de: "&lang=es-de&text=",
            fr: "&lang=es-fr&text=",
            ru: "&lang=es-ru&text="
        },
        fr: {
            tr: "&lang=fr-tr&text=",
            en: "&lang=fr-en&text=",
            de: "&lang=fr-de&text=",
            es: "&lang=fr-es&text=",
            ru: "&lang=fr-ru&text="
        },
        ru: {
            tr: "&lang=ru-tr&text=",
            en: "&lang=ru-en&text=",
            de: "&lang=ru-de&text=",
            es: "&lang=ru-es&text=",
            fr: "&lang=ru-fr&text="
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
            ru: "en/Translate/en-ru/"
        },
        ru: {
            en: "ru/Translate/ru-en/",
            ru: "ru/Translate/ru-ru/",
            de: "ru/Translate/ru-de/",
            es: "ru/Translate/ru-es/",
            fr: "ru/Translate/ru-fr/"
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
Abbyy.baseUrl = "http://www.lingvo-online.ru/";
Abbyy.tabId = "abbyyTab";
Abbyy.divContainer = ".js-search-results";
SozlukNet.name = "Sozluk.net";
SozlukNet.baseUrl = "http://sozluk.net/index.php";
SozlukNet.tabId = "sozlukNetTab";
SozlukNet.divContainer = "#sozlukNetContainer";
NotSupported.name = "Not Supported";
NotSupported.baseUrl = "#";
NotSupported.tabId = "notSupportedTab";
NotSupported.divContainer = "#notSupportedContainer";

var AllWebsites = [Tureng, Wordreference, DictionaryReference, YandexTranslate, TdkSozluk, Abbyy, SozlukNet, NotSupported];

function getUrl(tabName) {
    return _.findWhere(AllWebsites, {tabId: tabName}).getUrl();
}

function getDivContainer(tabName) {
    return _.findWhere(AllWebsites, {tabId: tabName}).divContainer;
}

function getLoadFunc(tabName) {
    return _.findWhere(AllWebsites, {tabId: tabName}).loadFunc;
}

function clearSelection() {
    if (document.selection) {
        document.selection.empty();
    } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}

function localizeHtml() {
    //$("head title").text(ExtensionCore.i18n("app.settings"));
    $("[data-lang]").each(function () {
        var text = "";
        var keys = $(this).attr("data-lang");
        keys.split(/\|/g).forEach(function (element, index, array) {
            if (text == "") {
                text = ExtensionCore.i18n(element);
            } else {
                text += ExtensionCore.i18n(element) + " ";
            }
        });

        $(this).text(text);
    });
    $("[data-lang-value]").each(function () {
        var key = $(this).attr("data-lang-value");
        $(this).attr("value", ExtensionCore.i18n(key));
    });
    $("[data-lang-placeholder]").each(function () {
        var key = $(this).attr("data-lang-placeholder");
        $(this).attr("placeholder", ExtensionCore.i18n(key));
    });
    $("[data-lang-alt]").each(function () {
        var alt = $(this).attr("alt");
        var key = $(this).attr("data-lang-alt");
        $(this).attr("alt", alt + ExtensionCore.i18n(key));
    });
    $("[data-lang-title]").each(function () {
        var key = $(this).attr("data-lang-title");
        $(this).attr("title", ExtensionCore.i18n(key));
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