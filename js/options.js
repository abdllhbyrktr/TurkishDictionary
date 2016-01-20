$(document).ready(function () {
    // restore settings from config.
    if (userConfig.doubleClicked) {
        $("#onOffDblClick").prop("checked", userConfig.doubleClicked ? "checked" : null);
    }

    if (userConfig.mouseSelected) {
        $("#onOffSelection").prop("checked", userConfig.mouseSelected ? "checked" : null);
    }
    
    switch (AvailableLangs.getCurrentLanguage()) {
        case AvailableLangs.Turkish:
            $("#trRadio").attr("checked", "checked");
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
    }

    $("#onOffDblClick").change(function () {
        userConfig.doubleClicked = $(this).is(":checked");
    });
    
    $("#onOffSelection").change(function () {
        userConfig.mouseSelected = $(this).is(":checked");
    });

    $("input[type='radio'][name='languageGroup']").change(function () {
        userConfig.languageGroup = $(this).val();
    });
});
