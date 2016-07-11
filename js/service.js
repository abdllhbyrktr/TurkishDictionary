
// "service": {
//     "main": "service.htm",
//     "debug": false
// },

ExtensionCore.addAppListener(ExtensionCore.AppEvents.appLocaleChange, function () {
    mxRuntime.post("refresh", "service");
});