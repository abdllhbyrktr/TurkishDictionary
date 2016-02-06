ExtensionCore.updateDisplayLocale();

function UserConfig() {
    Object.defineProperty(this, "onOffTdkSozluk", {
        get: function() {
            return (ExtensionCore.getSetting("onOffTdkSozluk") == "true");
        },
        set: function(value) {
            return ExtensionCore.setSetting("onOffTdkSozluk", value);
        }
    });

    Object.defineProperty(this, "onOffYandexTranslate", {
        get: function() {
            return (ExtensionCore.getSetting("onOffYandexTranslate") == "true");
        },
        set: function(value) {
            return ExtensionCore.setSetting("onOffYandexTranslate", value);
        }
    });

    Object.defineProperty(this, "onOffDictionaryReference", {
        get: function() {
            return (ExtensionCore.getSetting("onOffDictionaryReference") == "true");
        },
        set: function(value) {
            return ExtensionCore.setSetting("onOffDictionaryReference", value);
        }
    });

    Object.defineProperty(this, "onOffWordReference", {
        get: function() {
            return (ExtensionCore.getSetting("onOffWordReference") == "true");
        },
        set: function(value) {
            return ExtensionCore.setSetting("onOffWordReference", value);
        }
    });

    Object.defineProperty(this, "onOffTureng", {
        get: function() {
            return (ExtensionCore.getSetting("onOffTureng") == "true");
        },
        set: function(value) {
            return ExtensionCore.setSetting("onOffTureng", value);
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
    Turkish: "tr",
    German: "de",
    Spanish: "es",
    French: "fr",
    getCurrentLanguage: function () {
        return userConfig.languageGroup;
    }
};

// restore settings.
if (!userConfig.languageGroup) {
    userConfig.languageGroup = AvailableLangs.Turkish;
    userConfig.onOffTureng = true;
    userConfig.onOffWordReference = false;
    userConfig.onOffDictionaryReference = false;
    userConfig.onOffYandexTranslate = true;
    userConfig.onOffTdkSozluk = true;
    userConfig.lastSearchTerm = "gezi parkı";
    userConfig.doubleClicked = false;
    userConfig.mouseSelected = false;
}

var BaseDictionary = {
    baseUrl: "",
    tabId: "",
    inputSelector: "",
    divContainer: "",
    getUrl: function () {
        return this.baseUrl + this.lang[AvailableLangs.getCurrentLanguage()];
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
    }
};
var Wordreference = {
    lang: {
        "tr": "entr/",
        "de": "ende/",
        "es": "es/translation.asp?tranword=",
        "fr": "enfr/"
    }
};
var DictionaryReference = {
    lang: {
        "tr": "browse/",
        "de": "browse/",
        "es": "browse/",
        "fr": "browse/"
    }
};
var YandexTranslate = {
    lang: {
        "tr": "?text=",
        "de": "?text=",
        "es": "?text=",
        "fr": "?text="
    }
};
var TdkSozluk = {
    lang: {
        "tr": "?option=com_gts&arama=gts&kelime="
    }
};

_.extend(Tureng, BaseDictionary);
_.extend(Wordreference, BaseDictionary);
_.extend(DictionaryReference, BaseDictionary);
_.extend(YandexTranslate, BaseDictionary);
_.extend(TdkSozluk, BaseDictionary);

Tureng.baseUrl = "http://tureng.com/";
Tureng.tabId = "turengTab";
Tureng.inputSelector = "#searchWord";
Tureng.divContainer = "#searchPage";
Wordreference.baseUrl = "http://www.wordreference.com/";
Wordreference.tabId = "wordReferenceTab";
Wordreference.inputSelector = "#si";
Wordreference.divContainer = "#articleWRD";
DictionaryReference.baseUrl = "http://dictionary.reference.com/";
DictionaryReference.tabId = "dictionaryTab";
DictionaryReference.inputSelector = "#search-input";
DictionaryReference.divContainer = ".source-data";
YandexTranslate.baseUrl = "https://ceviri.yandex.com.tr/";
YandexTranslate.tabId = "yandexTab";
YandexTranslate.inputSelector = "#TargetText";
YandexTranslate.divContainer = "#DictionaryOutput";
TdkSozluk.baseUrl = "http://tdk.gov.tr/index.php";
TdkSozluk.tabId = "tdkTab";
TdkSozluk.inputSelector = "#metin";
TdkSozluk.divContainer = "#tdkContainer";

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
