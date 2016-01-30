var mxRuntime = window.external.mxGetRuntime();
var mxStorage = mxRuntime.storage;
var mxLocale = mxRuntime.locale;
var mxBrowser = mxRuntime.create("mx.browser");
var mxLang = mxRuntime.locale.t;
var trPanel = mxRuntime.getActionByName("dict-panel");
//console.log(mxRuntime.version);
//console.log(mxRuntime.locale.getSystemLocale()); // en, tr-tr
mxLocale.setDisplayLocale(mxLocale.getSystemLocale());

function UserConfig() {
    Object.defineProperty(this, "onOffTdkSozluk", {
        get: function() {
            return (mxStorage.getConfig("onOffTdkSozluk") == "true");
        },
        set: function(value) {
            return mxStorage.setConfig("onOffTdkSozluk", value);
        }
    });

    Object.defineProperty(this, "onOffYandexTranslate", {
        get: function() {
            return (mxStorage.getConfig("onOffYandexTranslate") == "true");
        },
        set: function(value) {
            return mxStorage.setConfig("onOffYandexTranslate", value);
        }
    });

    Object.defineProperty(this, "onOffDictionaryReference", {
        get: function() {
            return (mxStorage.getConfig("onOffDictionaryReference") == "true");
        },
        set: function(value) {
            return mxStorage.setConfig("onOffDictionaryReference", value);
        }
    });

    Object.defineProperty(this, "onOffWordReference", {
        get: function() {
            return (mxStorage.getConfig("onOffWordReference") == "true");
        },
        set: function(value) {
            return mxStorage.setConfig("onOffWordReference", value);
        }
    });

    Object.defineProperty(this, "onOffTureng", {
        get: function() {
            return (mxStorage.getConfig("onOffTureng") == "true");
        },
        set: function(value) {
            return mxStorage.setConfig("onOffTureng", value);
        }
    });

    Object.defineProperty(this, "languageGroup", {
        get: function() {
            return mxStorage.getConfig("languageGroup");
        },
        set: function(value) {
            return mxStorage.setConfig("languageGroup", value);
        }
    });

    Object.defineProperty(this, "culture", {
        get: function() {
            return mxStorage.getConfig("culture");
        },
        set: function(value) {
            return mxStorage.setConfig("culture", value);
        }
    });

    Object.defineProperty(this, "lastSearchTerm", {
        get: function() {
            return mxStorage.getConfig("lastSearched");
        },
        set: function(value) {
            return mxStorage.setConfig("lastSearched", value);
        }
    });

    Object.defineProperty(this, "doubleClicked", {
        get: function() {
            return (mxStorage.getConfig("dblclicked") == "true");
        },
        set: function(value) {
            return mxStorage.setConfig("dblclicked", value);
        }
    });

    Object.defineProperty(this, "mouseSelected", {
        get: function() {
            return (mxStorage.getConfig("mouseSelected") == "true");
        },
        set: function(value) {
            return mxStorage.setConfig("mouseSelected", value);
        }
    });
};
var userConfig = new UserConfig();
var systemLanguageIsEnglish = (mxLocale.getSystemLocale().indexOf("en") > -1);

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
        "fr": (systemLanguageIsEnglish ? "en/french-english//" : "fr/francais-anglais/")
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

var culture = "";
function checkCulture() {
    if (culture == "") {
        var timeout = null;
        var enableCallbacks = true;
        $.ajax({
            type: "GET",
            dataType: "html",
            url: "http://tureng.com/",
            beforeSend: function (xhr) {
                timeout = setTimeout(function() {
                  xhr.abort();
                  enableCallbacks = false;
                  // Handle the timeout
                  culture = "";
                  setTimeout(checkCulture, 5000);
                }, 2000);
            },
            success: function (data, textStatus, xhr) {
                clearTimeout(timeout);
                if (!enableCallbacks) return;
                var $culture = $(data).find("#topBarRight a[href^='/setculture']");
                if ($culture.length) {
                    var href = $culture.attr("href");
                    var arr = href.split("=");
                    culture = arr[1];
                    if (mxLocale.indexOf(culture) > -1) {
                        // set tureng culture.
                        var tabs = rt.create("mx.browser.tabs");
                        var newUrl = "http://tureng.com/setculture?culture=" + culture;
                        //tabs.newTab({ url: newUrl, activate: false });
                    } else {
                        culture = mxLocale.split("-")[0];
                    }
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                clearTimeout(timeout);
                if (!enableCallbacks) return;
                console.log("error: ", xhr.status, " ", textStatus);
            }
        });
    } else if (mxLocale.indexOf(culture) < 0) {
        // set tureng culture.
        var tabs = rt.create("mx.browser.tabs");
        var newUrl = "http://tureng.com/setculture?culture=" + culture;
        tabs.newTab({ url: newUrl, activate: false });
    }
}
