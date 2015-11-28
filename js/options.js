// Get the runtime object
var rt = window.external.mxGetRuntime();
var browser = rt.create("mx.browser");
var lang = rt.locale.t;

$(document).ready(function () {
    // restore settings from config.
    if (rt.storage.getConfig("dblclicked")) {
        $("#onOffDblClick").attr("checked", (rt.storage.getConfig("dblclicked") == "true"));
    }

    if (rt.storage.getConfig("mouseSelected")) {
        $("#onOffSelection").attr("checked", (rt.storage.getConfig("mouseSelected") == "true"));
    }
});
