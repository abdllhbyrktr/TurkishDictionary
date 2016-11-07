$(document).ready(function () {
    localizeHtml();
    // prevent right click on panel.
    $(document).bind("contextmenu", function (e) { return false; });
    $("#optionsTitle").html(ExtensionCore.i18n("app.title") + "<small><sup>3.0</sup></small>");
    // restore settings from config.
    $("#onOffDblClick").prop("checked", userConfig.doubleClicked ? "checked" : null);
    $("#onOffSelection").prop("checked", userConfig.mouseSelected ? "checked" : null);
    $("#onOffAutoPlayAudio").prop("checked", userConfig.autoPlayAudio ? "checked" : null);
    $("#onOffAutoDisplayImage").prop("checked", userConfig.autoDisplayImage ? "checked" : null);
    $("input[type='radio'][name='fromLang'][value='" + userConfig.fromLang + "']")
        .prop("checked", "checked")
        .parent("label").addClass("active");
    $("input[type='radio'][name='toLang'][value='" + userConfig.toLang + "']")
        .prop("checked", "checked")
        .parent("label").addClass("active");

    var showOrHideDicts = function(fromLang, toLang) {
        userConfig.fromLang = fromLang;
        userConfig.toLang = toLang;
        ExtensionCore.post("updateTabs", fromLang);
        AllWebsites.forEach(function(element, index, array) {
            var $el = $("input[type='checkbox'][value='" + element.name + "']");
            if (!element.isSupported(fromLang, toLang)) {
                $el.prop("checked", null)
                .parent("label").removeClass("active").addClass("disabled");
            } else {
                $el.parent("label").removeClass("disabled");
                $el.parent("label").addClass("active");
                $el.prop("checked", "checked");
            }
        });
    };

    $("input[type='radio'][name='fromLang']").on("change", function() {
        var fromLang = $(this).val();
        var toLang = $("input[type='radio'][name='toLang']:checked").val();
        showOrHideDicts(fromLang, toLang);
    });

    $("input[type='radio'][name='toLang']").on("change", function() {
        var toLang = $(this).val();
        var fromLang = $("input[type='radio'][name='fromLang']:checked").val();
        showOrHideDicts(fromLang, toLang);
    });

    $("#onOffDblClick").change(function () {
        userConfig.doubleClicked = $(this).is(":checked");
        ExtensionCore.post("toggleSettingsForDoubleClick", userConfig.doubleClicked);
    });

    $("#onOffSelection").change(function () {
        userConfig.mouseSelected = $(this).is(":checked");
        ExtensionCore.post("toggleSettingsForSelection", userConfig.mouseSelected);
    });

    $("#onOffAutoPlayAudio").change(function () {
        userConfig.autoPlayAudio = $(this).is(":checked");
    });

    $("#onOffAutoDisplayImage").change(function () {
        userConfig.autoDisplayImage = $(this).is(":checked");
    });
});
