"use strict";

var ExtensionCore = ExtensionCore || {};

(function () {
    var mxRuntime = window.external.mxGetRuntime(),
        mxStorage = mxRuntime.storage,
        mxLocale = mxRuntime.locale,
        mxBrowser = mxRuntime.create("mx.browser"),
        mxLang = mxRuntime.locale.t;

    ExtensionCore.CoreName = {
        mx: "1",
        chrome: "2",
        gecko: "3"
    };
    ExtensionCore.AppEvents = {
        appStart: "ACTION_START",
        appStartFunc: function() {},
        appStop: "ACTION_STOP",
        appStopFunc: function() {},
        appShow: "ACTION_SHOW",
        appShowFunc: function() {},
        appHide: "ACTION_HIDE",
        appHideFunc: function() {},
        appError: "ERROR",
        appErrorFunc: function() {},
        appLocaleChange: "LOCALE_CHANGED",
        appLocaleChangeFunc: function() {}
    };
    
    ExtensionCore.getCurrentCore = function() {
        return ExtensionCore.CoreNames.mx;
    };

    ExtensionCore.getVersion = function() {
        return mxRuntime.version;
    };

    ExtensionCore.getBrowserLocale = function () {
        return mxLocale.getSystemLocale(); // en, tr-tr
    };

    ExtensionCore.updateDisplayLocale = function() {
        mxLocale.setDisplayLocale(mxLocale.getSystemLocale());
    };

    ExtensionCore.hasSetting = function (key) {
        if (mxStorage.getConfig(key)) {
            return true;
        }

        return false;
    };

    ExtensionCore.getSetting = function(key) {
        return mxStorage.getConfig(key);
    };

    ExtensionCore.setSetting = function (key, value) {
        return mxStorage.setConfig(key, value);
    };

    ExtensionCore.i18n = function (key) {
        if (!key) {
            return "";
        }

        return mxLang(key);
    };

    ExtensionCore.addAppListener = function(evt, func) {
        switch (evt) {
        case ExtensionCore.AppEvents.appError:
            ExtensionCore.AppEvents.appErrorFunc = func;
            break;
        case ExtensionCore.AppEvents.appHide:
            ExtensionCore.AppEvents.appHideFunc = func;
            break;
        case ExtensionCore.AppEvents.appLocaleChange:
            ExtensionCore.AppEvents.appLocaleChangeFunc = func;
            break;
        case ExtensionCore.AppEvents.appShow:
            ExtensionCore.AppEvents.appShowFunc = func;
            break;
        case ExtensionCore.AppEvents.appStart:
            ExtensionCore.AppEvents.appStartFunc = func;
            break;
        case ExtensionCore.AppEvents.appStop:
            ExtensionCore.AppEvents.appStopFunc = func;
            break;
        default:
            console.log("appevent types out of " + evt + ".");
            break;
        }
    };

    ExtensionCore.listen = function(name, func) {
        mxRuntime.listen(name, func);
    };

    ExtensionCore.post = function(name, obj) {
        mxRuntime.post(name, obj);
    };

    ExtensionCore.openNewTab = function (url) {
        var tabs = mxRuntime.create("mx.browser.tabs");
        tabs.newTab({ url: url });
    };

    mxRuntime.onAppEvent = function (obj) {
        //console.log(obj.type);
        switch (obj.type) {
            case ExtensionCore.AppEvents.appStart:
                ExtensionCore.AppEvents.appStartFunc();
                break;
            case ExtensionCore.AppEvents.appStop:
                ExtensionCore.AppEvents.appStopFunc();
                break;
            case ExtensionCore.AppEvents.appShow:
                ExtensionCore.AppEvents.appShowFunc();
                break;
            case ExtensionCore.AppEvents.appHide:
                ExtensionCore.AppEvents.appHideFunc();
                break;
            case ExtensionCore.AppEvents.appError:
                ExtensionCore.AppEvents.appErrorFunc();
                break;
            case ExtensionCore.AppEvents.appLocaleChange:
                ExtensionCore.AppEvents.appLocaleChangeFunc();
                break;
            default:
                console.log("appevent types out of " + obj.type + ".");
        }
    };

})();

ExtensionCore.updateDisplayLocale();
console.log(ExtensionCore.getVersion());
console.log(ExtensionCore.getBrowserLocale());