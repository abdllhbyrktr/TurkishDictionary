var rt = window.external.mxGetRuntime();
var browser = rt.create("mx.browser");
var excludedSites = [];

/*

		"service" : {
			"main" : "service.htm",
			"debug" : true
		},
*/

browser.onBrowserEvent = function (obj) {
    var tab = browser.tabs.getCurrentTab();
    console.log(obj.type);
    console.log(tab.title);
    switch (obj.type) {
        case "ON_NAVIGATE":
            /*
            The page will redirect to another URL.
			    Additional Attributes:
                    obj.id
	                    String.
	                    Target Tab ID.
                    obj.url
                        String.
                        Target URL
            */
            break;
        case "PAGE_LOADED":
            /*
            Page loaded.
			    Additional Attributes:
                    obj.id
	                    String.
	                    Target Tab ID.
            */
            var tab = browser.tabs.getTabById(obj.id);
            browser.injectScriptFile("js/popup.js", obj.id);
            console.log("script injected.");
            console.log(rt);
            console.log(browser);
            console.log(rt.getActionByName("dict-page-script"));
            if (0 && /*!specialSites[tab.id] && */tab.url.indexOf("maxthon.com") > -1) {
                //specialSites[tab.id] = "injected";
                browser.injectScriptFile("js/popup.js", obj.id);
                browser.executeScript('var heads = document.getElementsByTagName("head"); if (heads.length > 0) { var node = document.createElement("script"); node.type = "text/javascript"; node.src = "mxaddon-pkg://{8b14962d-1e33-4be1-8420-c29422902c26}/js/popup.js"; heads[0].appendChild(node); }', tab.id);
                console.log("executed in: " + tab.url);
            }

            //alert("pageLoaded: " + tab.title);
            break;
        case "PAGE_CLOSED":
            /*
            Page closed.
			    Additional Attributes:
                    obj.id
	                    String.
	                    Target Tab ID.
            */
            break;
        case "TAB_SWITCH":
            /*
            Tab switched.
			    Attributes:
                    obj.from
	                    String.
	                    The ID of the tab which the user switched from.
                    obj.to
                        String.
                        The ID of the tab which the user switched to.
            */
            break;
        default:
            console.log("browser event types out of " + obj.type + ".");
    }
};
