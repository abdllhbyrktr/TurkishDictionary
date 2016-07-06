var maxDicts = 4;
var selectedDicts = 1;

$(document).ready(function () {
    localizeHtml();
    // prevent right click on panel.
    //$(document).bind("contextmenu", function (e) { return false; });
    $("#optionsTitle").html(ExtensionCore.i18n("app.title") + "<sup>2.1.7</sup>");
    // restore settings from config.
    $("#onOffDblClick").prop("checked", userConfig.doubleClicked ? "checked" : null);
    $("#onOffSelection").prop("checked", userConfig.mouseSelected ? "checked" : null);
    $("#onOffDictionaryReference").prop("checked", userConfig.onOffDictionaryReference ? "checked" : null);
    $("#onOffWordReference").prop("checked", userConfig.onOffWordReference ? "checked" : null);
    $("#onOffYandexTranslate").prop("checked", userConfig.onOffYandexTranslate ? "checked" : null);
    $("#onOffTdkSozluk").prop("checked", userConfig.onOffTdkSozluk ? "checked" : null);
    $("#onOffAbbyy").prop("checked", userConfig.onOffAbbyy ? "checked" : null);
    $("#onOffSozlukNet").prop("checked", userConfig.onOffSozlukNet ? "checked" : null);
    $("#onOffTdkSozluk").prop("disabled", "disabled");

    userConfig.onOffDictionaryReference && selectedDicts++;
    userConfig.onOffWordReference && selectedDicts++;
    userConfig.onOffYandexTranslate && selectedDicts++;
    userConfig.onOffTdkSozluk && selectedDicts++;
    userConfig.onOffAbbyy && selectedDicts++;
    userConfig.onOffSozlukNet && selectedDicts++;

    var showOrHideDicts = function(fromLang, toLang) {
        console.log("Tureng is supported: ", Tureng.isSupported(fromLang, toLang));
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

    var updateDicts = function () {
        if (selectedDicts >= maxDicts) {
            $(".dictionary:not(:checked)").prop("disabled", "disabled");
        } else {
            $(".dictionary:not(:checked)").prop("disabled", null);
            if (AvailableLangs.getCurrentLanguage() != AvailableLangs.Turkish) {
                $("#onOffTdkSozluk").prop("disabled", "disabled");
            }
        }
    };

    var checkValue = function (isChecked) {
        isChecked ? selectedDicts++ : selectedDicts--;
        updateDicts();
        ExtensionCore.post("updateTabs", isChecked);

        return isChecked;
    };

    switch (AvailableLangs.getCurrentLanguage()) {
        case AvailableLangs.Turkish:
            $("#trRadio").attr("checked", "checked");
            $("#onOffTdkSozluk").prop("disabled", null);
            break;
        case AvailableLangs.German:
            $("#deRadio").attr("checked", "checked");
            break;
        case AvailableLangs.Spanish:
            $("#esRadio").attr("checked", "checked");
            break;
        case AvailableLangs.French:
            $("#frRadio").attr("checked", "checked");
            break;
        default:
        case AvailableLangs.Russian:
            $("#ruRadio").attr("checked", "checked");
            break;
    }

    $("#onOffDictionaryReference").change(function () {
        userConfig.onOffDictionaryReference = checkValue($(this).is(":checked"));
    });

    $("#onOffWordReference").change(function () {
        userConfig.onOffWordReference = checkValue($(this).is(":checked"));
    });

    $("#onOffYandexTranslate").change(function () {
        userConfig.onOffYandexTranslate = checkValue($(this).is(":checked"));
    });

    $("#onOffTdkSozluk").change(function () {
        userConfig.onOffTdkSozluk = checkValue($(this).is(":checked"));
    });

    $("#onOffAbbyy").change(function () {
        userConfig.onOffAbbyy = checkValue($(this).is(":checked"));
    });

    $("#onOffSozlukNet").change(function () {
        userConfig.onOffSozlukNet = checkValue($(this).is(":checked"));
    });

    $("#onOffDblClick").change(function () {
        userConfig.doubleClicked = $(this).is(":checked");
        ExtensionCore.post("toggleSettingsForDoubleClick", userConfig.doubleClicked);
    });

    $("#onOffSelection").change(function () {
        userConfig.mouseSelected = $(this).is(":checked");
        ExtensionCore.post("toggleSettingsForSelection", userConfig.mouseSelected);
    });

    $("input[type='radio'][name='languageGroup']").change(function () {
        var currentVal = $(this).val();
        userConfig.languageGroup = currentVal;
        ExtensionCore.post("updateTabs", currentVal);

        if (currentVal == AvailableLangs.Turkish) {
            selectedDicts < maxDicts ? $("#onOffTdkSozluk").prop("disabled", null) :
            $("#onOffTdkSozluk").prop("disabled", "disabled");
        } else {
            if ($("#onOffTdkSozluk").is(":checked")) {
                selectedDicts--;
                updateDicts();
                userConfig.onOffTdkSozluk = false;
                $("#onOffTdkSozluk").prop("checked", null);
            }

            $("#onOffTdkSozluk").prop("disabled", "disabled");
        }
    });

    updateDicts();
});
