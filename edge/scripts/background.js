'use strict';

var chrome = browser;
var ExtensionCore = ExtensionCore || {};

ExtensionCore.setSetting = function (key, value) {
    var storage = {};
    storage[key] = value;
    chrome.storage.local.set(storage, function() {});
};

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.local.get(null, function(result) {
    ExtensionCore.setSetting("doubleClicked", (result["doubleClicked"] || false));
    ExtensionCore.setSetting("mouseSelected", (result["mouseSelected"] || false));
  });
  console.log("Dictionary Installed.");
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
  if (request.hasOwnProperty("translate")) {
    ExtensionCore.setSetting("lastSearchTerm", request["translate"]);
    chrome.browserAction.getBadgeText({}, function(result) {
      var oldBadge = result || "0";
      oldBadge++;
      chrome.browserAction.setBadgeText({text: oldBadge.toString()});
    })
  }
});
//chrome.browserAction.setBadgeText({text: '\'Allo'});
//console.log('\'Allo \'Allo! Event Page for Browser Action');
