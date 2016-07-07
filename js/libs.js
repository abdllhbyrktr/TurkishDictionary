ExtensionCore.updateDisplayLocale();

function UserConfig() {
    Object.defineProperty(this, "fromLang", {
        get: function() {
            return ExtensionCore.getSetting("fromLang1");
        },
        set: function(value) {
            return ExtensionCore.setSetting("fromLang1", value);
        }
    });

    Object.defineProperty(this, "toLang", {
        get: function() {
            return ExtensionCore.getSetting("toLang1");
        },
        set: function(value) {
            return ExtensionCore.setSetting("toLang1", value);
        }
    });

    Object.defineProperty(this, "languageGroup", {
        get: function() {
            return ExtensionCore.getSetting("languageGroup");
        },
        set: function(value) {
            return ExtensionCore.setSetting("languageGroup", value);
        }
    });

    Object.defineProperty(this, "culture", {
        get: function() {
            return ExtensionCore.getSetting("culture");
        },
        set: function(value) {
            return ExtensionCore.setSetting("culture", value);
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
};
var userConfig = new UserConfig();
var systemLanguageIsEnglish = (ExtensionCore.getBrowserLocale().indexOf("en") > -1);

var AvailableLangs = {
    English: "en",
    Turkish: "tr",
    Russian: "ru",
    German: "de",
    Spanish: "es",
    French: "fr",
    getCurrentLanguage: function () {
        return userConfig.languageGroup;
    }
};

// restore settings.
if (!userConfig.fromLang) {
    userConfig.fromLang = AvailableLangs.English;
    userConfig.toLang = AvailableLangs.Turkish;
    userConfig.languageGroup = AvailableLangs.Turkish;
    userConfig.lastSearchTerm = "gezi parkı";
    userConfig.doubleClicked = false;
    userConfig.mouseSelected = false;
}

var BaseDictionary = {
    name: "",
    baseUrl: "",
    tabId: "",
    inputSelector: "",
    divContainer: "",
    getUrl: function () {
        return this.baseUrl + this.lang[AvailableLangs.getCurrentLanguage()];
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
    lang: {
        "tr": (systemLanguageIsEnglish ? "en/turkish-english/" : "tr/turkce-ingilizce/"),
        "de": (systemLanguageIsEnglish ? "en/german-english/" : "de/deutsch-englisch/"),
        "es": (systemLanguageIsEnglish ? "en/spanish-english/" : "es/espanol-ingles/"),
        "fr": (systemLanguageIsEnglish ? "en/french-english/" : "fr/francais-anglais/")
    },
    containsTerm: function() {
        switch (AvailableLangs.getCurrentLanguage()) {
            case AvailableLangs.Turkish:
                return "rk";
            case AvailableLangs.German:
                return (systemLanguageIsEnglish ? "rm" : "tsc");
            case AvailableLangs.Spanish:
                return "pan";
            case AvailableLangs.French:
                return "nc";
            default:
                return "ng";
        }
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
    lang: {
        "tr": "entr/",
        "de": "ende/",
        "es": "es/translation.asp?tranword=",
        "fr": "enfr/"
    },
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
    lang: {
        "tr": "browse/",
        "de": "browse/",
        "es": "browse/",
        "fr": "browse/"
    },
    langs: {
        en: {
            en : "browse/"
        }
    }
};
var YandexTranslate = {
    lang: {
        "tr": "?text=",
        "de": "?text=",
        "es": "?text=",
        "fr": "?text="
    },
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
    lang: {
        "tr": "?option=com_gts&arama=gts&kelime="
    },
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

_.extend(Tureng, BaseDictionary);
_.extend(Wordreference, BaseDictionary);
_.extend(DictionaryReference, BaseDictionary);
_.extend(YandexTranslate, BaseDictionary);
_.extend(TdkSozluk, BaseDictionary);
_.extend(Abbyy, BaseDictionary);
_.extend(SozlukNet, BaseDictionary);

Tureng.name = "Tureng";
Tureng.baseUrl = "http://tureng.com/";
Tureng.tabId = "turengTab";
Tureng.inputSelector = "#searchWord";
Tureng.divContainer = "#searchPage";
Wordreference.name = "Wordreference.com";
Wordreference.baseUrl = "http://www.wordreference.com/";
Wordreference.tabId = "wordReferenceTab";
Wordreference.inputSelector = "#si";
Wordreference.divContainer = "#articleWRD";
DictionaryReference.name = "Dictionary.com";
DictionaryReference.baseUrl = "http://dictionary.reference.com/";
DictionaryReference.tabId = "dictionaryTab";
DictionaryReference.inputSelector = "#search-input";
DictionaryReference.divContainer = ".source-data";
YandexTranslate.name = "Yandex.Translate";
YandexTranslate.baseUrl = "https://ceviri.yandex.com.tr/";
YandexTranslate.tabId = "yandexTab";
YandexTranslate.inputSelector = "#TargetText";
YandexTranslate.divContainer = "#DictionaryOutput";
TdkSozluk.name = "Tdk";
TdkSozluk.baseUrl = "http://tdk.gov.tr/index.php";
TdkSozluk.tabId = "tdkTab";
TdkSozluk.inputSelector = "#metin";
TdkSozluk.divContainer = "#tdkContainer";
Abbyy.name = "Abbyy";
Abbyy.baseUrl = "http://www.lingvo-online.ru/";
Abbyy.tabId = "abbyyTab";
Abbyy.inputSelector = "#searchText";
Abbyy.divContainer = ".l-articles";
SozlukNet.name = "Sozluk.net";
SozlukNet.baseUrl = "http://sozluk.net/index.php";
SozlukNet.tabId = "sozlukNetTab";
SozlukNet.inputSelector = "#metin";
SozlukNet.divContainer = "#sozlukNetContainer";
var AllWebSites = [Tureng, Wordreference, DictionaryReference, YandexTranslate, TdkSozluk, Abbyy, SozlukNet];

function getUrl(tabName) {
    switch (tabName) {
        case Tureng.tabId:
            return Tureng.getUrl();
        case Wordreference.tabId:
            return Wordreference.getUrl();
        case DictionaryReference.tabId:
            return DictionaryReference.getUrl();
        case YandexTranslate.tabId:
            return YandexTranslate.getUrl();
        case TdkSozluk.tabId:
            return TdkSozluk.getUrl();
        case Abbyy.tabId:
            return Abbyy.getUrl();
        case SozlukNet.tabId:
            return SozlukNet.getUrl();
        default:
            return Tureng.getUrl();
    }
}

function getInputSelector(tabName) {
    switch (tabName) {
        case Tureng.tabId:
            return Tureng.inputSelector;
        case Wordreference.tabId:
            return Wordreference.inputSelector;
        case DictionaryReference.tabId:
            return DictionaryReference.inputSelector;
        case YandexTranslate.tabId:
            return YandexTranslate.inputSelector;
        case TdkSozluk.tabId:
            return TdkSozluk.inputSelector;
        case Abbyy.tabId:
            return Abbyy.inputSelector;
        case SozlukNet.tabId:
            return SozlukNet.inputSelector;
        default:
            return Tureng.inputSelector;
    }
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
    $("[data-lang-alt]").each(function () {
        var alt = $(this).attr("alt");
        var key = $(this).attr("data-lang-alt");
        $(this).attr("alt", alt + ExtensionCore.i18n(key));
    });
    $("[data-lang-title]").each(function () {
        var title = $(this).attr("title");
        if (!title) {
            title = "";
        }

        var key = $(this).attr("data-lang-title");
        $(this).attr("title", title + ExtensionCore.i18n(key));
    });
}
