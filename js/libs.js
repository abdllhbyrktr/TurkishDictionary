var mxRuntime = window.external.mxGetRuntime();
var mxStorage = mxRuntime.storage;
var mxLocale = mxRuntime.locale;
var mxBrowser = mxRuntime.create("mx.browser");
var mxLang = mxRuntime.locale.t;
//console.log(mxRuntime.version);
//console.log(mxRuntime.locale.getSystemLocale()); // en, tr-tr
mxLocale.setDisplayLocale(mxLocale.getSystemLocale());

function UserConfig() {
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
            return mxStorage.getConfig("dblclicked");
        },
        set: function(value) {
            return mxStorage.setConfig("dblclicked", value);
        }
    });

    Object.defineProperty(this, "mouseSelected", {
        get: function() {
            return mxStorage.getConfig("mouseSelected");
        },
        set: function(value) {
            return mxStorage.setConfig("mouseSelected", value);
        }
    });
};
var userConfig = new UserConfig();
var systemLanguageIsEnglish = (mxLocale.getSystemLocale().indexOf("en") > -1);

// restore settings.
if (!userConfig.languageGroup) {
    userConfig.languageGroup = AvailableLangs.Turkish;
}

var AvailableLangs = {
    Turkish: "tr",
    German: "de",
    Spanish: "es",
    French: "fr",
    getCurrentLanguage: function () {
        return userConfig.languageGroup;
    }
};

var BaseDictionary = {
    baseUrl: "",
    tabId: "",
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

_.extend(Tureng, BaseDictionary);
_.extend(Wordreference, BaseDictionary);
_.extend(DictionaryReference, BaseDictionary);
_.extend(YandexTranslate, BaseDictionary);

Tureng.baseUrl = "http://tureng.com/";
Tureng.tabId = "turengTab";
Wordreference.baseUrl = "http://www.wordreference.com/";
Wordreference.tabId = "wordReferenceTab";
DictionaryReference.baseUrl = "http://dictionary.reference.com/";
DictionaryReference.tabId = "dictionaryTab";
YandexTranslate.baseUrl = "https://ceviri.yandex.com.tr/";
YandexTranslate.tabId = "yandexTab";

var PanelTab = (function () {
    // variables.
    var currentTab = Tureng.tabId;
    // constructor.
    function PanelTab() {
        //this.currentTab = 0;
    };

    PanelTab.prototype.getCurrentTab = function () {
        return currentTab;
    };

    PanelTab.prototype.setCurrentTab = function (tab) {
        currentTab = tab;
    };

    PanelTab.prototype.translate = function (word) {
        switch (currentTab) {
            case Tureng.tabId:
                turengTranslate(word);
                break;
            case Wordreference.tabId:
                wordReferenceTranslate(word);
                break;
            case DictionaryReference.tabId:
                dictionaryTranslate(word);
                break;
            case YandexTranslate.tabId:
                yandexTranslate(word, "");
                break;
            default:
                console.log("Error: there is no tab with: " + currentTab);
                break;
        }
    };

    return PanelTab;
})();
var panelTab = new PanelTab();

var navHistory = {
    backArr: [],
    forwardArr: [],
    navigating: false,
    add: function(word) {
        if (!this.navigating) {
            if ($.inArray(word, this.backArr) === -1) this.backArr.push(word);
            userConfig.lastSearchTerm = word;
        }
        if (this.backArr.length > 10) { this.backArr.shift(); }
        if (this.backArr.length > 1) { this.cssBack(true); }
        // reset forward.
        if (this.forwardArr.length && !this.navigating) {
            this.cssForward(false);
            this.forwardArr = [];   
        }
        // change styles for back array.
        if (this.backArr.length <= 1) { this.cssBack(false); }
        // change styles for forward array.
        if (!this.forwardArr.length) { this.cssForward(false); }

        this.navigating = false;
    },
    next: function() {
        if (!this.forwardArr.length) { return; }
        this.navigating = true;
        var word = this.forwardArr.pop();
        this.backArr.push(word);
        //turengTranslate(word);
        panelTab.translate(word);
    },
    prev: function() {
        if (!this.backArr.length) { return; }
        if (this.forwardArr.length == 0) { this.cssForward(true); }
        this.navigating = true;
        var toForward = this.backArr.pop();
        this.forwardArr.push(toForward);
        //turengTranslate(this.backArr[this.backArr.length - 1]);
        panelTab.translate(this.backArr[this.backArr.length - 1]);
    },
    cssBack: function(active) {
        if (active) {
            $(".navigationBack").css({"cursor": "default", "-webkit-filter": "grayscale(0.1)"});
            $(".navigationBack").attr("title", mxLang("app.backward"));
        } else {
            $(".navigationBack").css({"cursor": "default", "-webkit-filter": "grayscale(1)"});
            $(".navigationBack").attr("title", null);
        }
    },
    cssForward: function(active) {
        if (active) {
            $(".navigationForward").css({"cursor": "default", "-webkit-filter": "grayscale(0.1)"});
            $(".navigationForward").attr("title", mxLang("app.forward"));
        } else {
            $(".navigationForward").css({"cursor": "default", "-webkit-filter": "grayscale(1)"});
            $(".navigationForward").attr("title", null);
        }
    }
};

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
        default:
            return Tureng.getUrl();
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
