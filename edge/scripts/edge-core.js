'use strict';

var chrome = browser;
var ExtensionCore = ExtensionCore || {};

ExtensionCore.CoreName = {
    mx: "1",
    chrome: "2",
    edge: "3",
    gecko: "4"
};

ExtensionCore.getCurrentCore = function() {
    return ExtensionCore.CoreNames.edge;
};

ExtensionCore.getBrowserLocale = function () {
    return chrome.i18n.getUILanguage();
};

ExtensionCore.getSetting = function(key, resultFunc) {
    chrome.storage.local.get(key, resultFunc);
};

ExtensionCore.setSetting = function (key, value) {
    var storage = {};
    storage[key] = value;
    chrome.storage.local.set(storage, function() {});
};

ExtensionCore.i18n = function (key) {
    if (!key) {
        return "";
    }

    return chrome.i18n.getMessage(key);
};

ExtensionCore.listen = function(name, func) {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
        if (request.hasOwnProperty(name)) {
            func(request[name]);
        }
    });
};

ExtensionCore.post = function(name, obj) {
    var msg = {};
    msg[name] = obj;
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, msg, function (response) {
            //console.log(response.farewell);
        });
    });
};

ExtensionCore.openNewTab = function (url) {
    chrome.tabs.create({ url: url });
};

ExtensionCore.setBadge = function(val) {
    chrome.browserAction.setBadgeText({text: (val || "")});
};

ExtensionCore.getSetting(null, function(result) {
    ExtensionCore.allStorage = result;
});

console.log(ExtensionCore.getBrowserLocale());