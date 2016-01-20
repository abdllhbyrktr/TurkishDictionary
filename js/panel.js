var dblclicked = false;
var mouseSelected = false;
var highlighted = false;
var highlightedText = "";
var $hoveredSpan;
var badgeNumber = 0;
var lastSelected = "";
var handleTimeout = 6000;
var yandexApiKey = "trnsl.1.1.20150328T004518Z.482e8153ea2baa64.d0a5debb3b13637b9c6cd2b12a9398efb62fbd9b";

mxRuntime.onAppEvent = function (obj) {
	//console.log(obj.type);
    switch (obj.type) {
        case "ACTION_START":
            //console.log("Action Started.");
            break;
        case "ACTION_STOP":
            //console.log("Action closed (exited).");
            break;
        case "ACTION_SHOW":
            //console.log("Action is shown.");
            badgeNumber = 0;
            //mxRuntime.icon.showBadge(badgeNumber);
            if (lastSelected != "") {
                turengTranslate(lastSelected);
                lastSelected = "";
            } else {
                $("#searchWord").focus();
            }
            break;
        case "ACTION_HIDE":
            //console.log("Action is hidden.");
            if (navHistory.backArr.length) {
                userConfig.lastSearchTerm = navHistory.backArr[navHistory.backArr.length - 1];
            }
            break;
        case "ERROR":
            console.log(obj.errorMessage);
            break;
        case "LOCALE_CHANGED":
            mxRuntime.locale.setDisplayLocale(mxRuntime.locale.getSystemLocale());
            location.reload();
            break;
        default:
            console.log("appevent types out of " + obj.type + ".");
    }
};

mxRuntime.listen("showBadge", function (selected) {
    //lastSelected = selected;
    badgeNumber = badgeNumber + 1;
    //mxRuntime.icon.showBadge(badgeNumber);
});

mxRuntime.listen("retrieveMessage", function (msg) {
    //console.log("I got message from script action: ", msg);
    setTimeout(sendSettings, 100);
});

mxRuntime.listen("translate", function (searchKey) {
    panelTab.translate(searchKey);
    //setTimeout(sendResults, 100);
});

function sendResults() {
    mxRuntime.post("results", $("#searchPage").html());
}

function sendSettings() {
    var obj = {"dblClick": dblclicked, "mouseSelect": mouseSelected};
    mxRuntime.post("getSettings", obj);
}

$(document).ready(function () {
    $(".tabs .tab-links a").on("click", function (e) {
        $("#mainPageBottom").hide();
        var currentAttrValue = $(this).attr("href");

        // Show/Hide Tabs
        $(".tabs " + currentAttrValue).fadeIn(400).siblings().hide();

        // Change/remove current tab to active
        $(this).parent("li").addClass("active").siblings().removeClass("active");
        $(currentAttrValue).addClass("activeContent").siblings().removeClass("activeContent");
        // set current tab index
        panelTab.setCurrentTab($(".activeContent").attr("id"));
        // translate
        var currentWord = userConfig.lastSearchTerm;
        panelTab.translate(currentWord);

        e.preventDefault();
    });

    // Handler for .ready() called.
    $("#searchPage").html("<h1>" + mxLang("app.loading") + "</h1>");
    // Hide main page bottom.
    $("#mainPageBottom").hide();
    // check culture for websites.
    //checkCulture();
    // prevent right click on panel.
    $(document).bind("contextmenu", function (e) { return false; });

    $("#searchWord").keypress(function (event) {
        // return key(enter).
        if (event.which == 13) {
            var searchTerm = $("#searchWord").val();

            if (searchTerm.length) {
                turengTranslate(searchTerm);
            }
        }
    });

    $("#si").keypress(function (event) {
        // return key(enter).
        if (event.which == 13) {
            var searchTerm = $("#si").val();

            if (searchTerm.length) {
                wordReferenceTranslate(searchTerm);
            }
        }
    });

    $("#search-input").keypress(function (event) {
        // return key(enter).
        if (event.which == 13) {
            var searchTerm = $("#search-input").val();

            if (searchTerm.length) {
                dictionaryTranslate(searchTerm);
            }
        }
    });

    $("#searchButton").click(function () {
        var searchTerm = $("#searchWord").val();

        if (searchTerm.length) {
            turengTranslate(searchTerm);
        }
    });

    $("#search input.button").click(function () {
        var searchTerm = $("#si").val();

        if (searchTerm.length) {
            wordReferenceTranslate(searchTerm);
        }
    });

    $("#search-submit").click(function () {
        var searchTerm = $("#search-input").val();

        if (searchTerm.length) {
            dictionaryTranslate(searchTerm);
        }
    });

    $("#DictControl").click(function () {
        var dataLang = "";
        var searchTerm = $("#TargetText").val();
        var currentLang = AvailableLangs.getCurrentLanguage();

        if ($("#DictFirst").html().indexOf("English") > -1) {
            dataLang = "&lang=en-" + currentLang;
        } else {
            dataLang = "&lang=" + currentLang + "-en";
        }

        if (searchTerm.length) {
            yandexTranslate(searchTerm, dataLang);
        }
    });

    $("#DictSwap").attr({ "title": mxLang("app.swap"), "alt": mxLang("app.swap") });
    $("#DictSwap").click(function() {
        var first = $("#DictFirst").html();
        var second = $("#DictSecond").html();
        $("#DictFirst").html(second);
        $("#DictFirst").attr("title", second);
        $("#DictSecond").html(first);
        $("#DictSecond").attr("title", first);
        $("#TargetText").focus();
    });

    $(document).on("keydown", function() {
        // ctrl key.
        if (event.which == 17) {
            highlighted = true;
            if ($hoveredSpan) {
                highlightedText = $hoveredSpan.text();
                $hoveredSpan.addClass("highlight");
            }
        }
    });

    $(document).on("keyup", function() {
        // ctrl key.
        if (event.which == 17) {
            highlighted = false;
            if ($hoveredSpan) {
                highlightedText = "";
                $hoveredSpan.removeClass("highlight");
            }
        }
    });
    
    // restore settings from config.
    if (userConfig.doubleClicked) {
        dblclicked = userConfig.doubleClicked == "true" || false;
    }

    if (userConfig.mouseSelected) {
        mouseSelected = userConfig.mouseSelected == "true" || false;
    }

    var checkedClick = dblclicked ? ' checked="checked"' : '';
    var checkedSelect = mouseSelected ? ' checked="checked"' : '';

    $("#settings").html('<div class="setDblClick"><span>' + mxLang("app.dblclick") + '</span><input type="checkbox" id="onOffDblClick"' + checkedClick + '/></div><div class="setSelection"><span>' + mxLang("app.selection") + '</span><input type="checkbox" id="onOffSelection"' + checkedSelect + '/></div><div class="settingsIcon" title="' + mxLang("app.settings") + '"></div>');

    $(".setDblClick :checkbox").iphoneStyle({checkedLabel: mxLang("app.on"), uncheckedLabel: mxLang("app.off"), onChange: function (e, checked) {
        dblclicked = checked;
        userConfig.doubleClicked = dblclicked;
        sendSettings();
    }});

    $(".setSelection :checkbox").iphoneStyle({checkedLabel: mxLang("app.on"), uncheckedLabel: mxLang("app.off"), onChange: function (e, checked) {
        mouseSelected = checked;
        userConfig.mouseSelected = mouseSelected;
        sendSettings();
    }});

    $("#settings").hover(function(event) {
        // mouseover.
        event.stopPropagation();
        $(this).css("top", "0px");
    }, function (event) {
        // mouseout.
        event.stopPropagation();
        $(this).css("top", "-58px");
    });

    $(".navigationBack").click(function() {
       navHistory.prev();
    });

    $(".navigationForward").click(function() {
       navHistory.next();
    });

    sendSettings();
    var lastSearched = "gezi parkı";
    if (userConfig.lastSearchTerm) {
        lastSearched = userConfig.lastSearchTerm;
    }

    //setTimeout(turengTranslate(lastSearched), 100);
    panelTab.translate(lastSearched);
});

function loadDictionaryReferenceSearchResults(url) {
    var timeout = null;
    var enableCallbacks = true;

    $.ajax({
        type: "GET",
        dataType: "html",
        url: url,
        beforeSend: function (xhr) {
            $(".source-data").html("<h1>" + mxLang("app.loading") + "</h1>");
            timeout = setTimeout(function () {
                xhr.abort();
                enableCallbacks = false;
                // Handle the timeout
                $(".source-data").html("<h1>" + mxLang("app.timeout") + "</h1>");
            }, handleTimeout);
        },
        success: function(data, textStatus, xhr) {
            clearTimeout(timeout);
            if (!enableCallbacks) return;
            
            var $defList = $(data).find(".def-list");
            if ($defList.length) {
                $(".source-data").html($defList[0].outerHTML);
                // remove links.
                $(".def-content").find("a").each(function () {
                    var linkContent = "<span>" + $(this).html() + "</span>";
                    $(this).replaceWith(linkContent);
                });

            } else {
                $(".source-data").html("<h1>" + mxLang("app.notFound") + "</h1>");
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            clearTimeout(timeout);
            if (!enableCallbacks) return;
            console.log("error: ", xhr.status, " ", textStatus);
            $(".source-data").html("<h1>" + mxLang("app.notFound") + "</h1>");
        }
    });
}

function loadWordReferenceSearchResults(url) {
    var timeout = null;
    var enableCallbacks = true;

    $.ajax({
        type: "GET",
        dataType: "html",
        url: url,
        beforeSend: function (xhr) {
            $("#articleWRD").html("<h1>" + mxLang("app.loading") + "</h1>");
            timeout = setTimeout(function () {
                xhr.abort();
                enableCallbacks = false;
                // Handle the timeout
                $("#articleWRD").html("<h1>" + mxLang("app.timeout") + "</h1>");
            }, handleTimeout);
        },
        success: function (data, textStatus, xhr) {
            clearTimeout(timeout);
            if (!enableCallbacks) return;

            var $tables = $(data).find(".WRD");
            if ($tables.length) {
                $("#articleWRD").html($tables[0].outerHTML);

                // remove un-desired sections.
                $(".wrtopsection").remove();
                $(".POS2").find("span").remove();
                var results = 0, maxResultBlock = 5;
                $(".WRD").find("tr").each(function() {
                    if ($(this).attr("id")) {
                        maxResultBlock = maxResultBlock - 1;
                    }

                    if (maxResultBlock <= 0) {
                        return false;
                    }

                    results = results + 1;
                });
                // remove another results.
                $(".WRD").find("tr").slice(results).remove();

                // replace odd and even classes.
                $("#articleWRD .even").removeClass("even").addClass("wrEven");
                $("#articleWRD .odd").removeClass("odd").addClass("wrOdd");
            } else {
                $("#articleWRD").html("<h1>" + mxLang("app.notFound") + "</h1>");
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            clearTimeout(timeout);
            if (!enableCallbacks) return;
            console.log("error: ", xhr.status, " ", textStatus);
            $("#articleWRD").html("<h1>" + mxLang("app.notFound") + "</h1>");
        }
    });

}

function replaceTurEng($trs) {
    for (var i = 0; i < $trs.length; i++) {
        var tr = $trs[i];
        $("#englishResultsTable tbody").append("<tr>" +
        tr.children[0].outerHTML +
        tr.children[1].outerHTML +
        tr.children[3].outerHTML +
        tr.children[2].outerHTML +
        tr.children[4].outerHTML +
        "</tr>");
    }
}

function addToSearchPage(html, results) {
    $("#searchPage").html(html);
    $(".searchResultsTable").find("tr").slice(results).remove();
}

function loadTurengSearchResults(url) {
    var timeout = null;
    var enableCallbacks = true;

    $.ajax({
        type: "GET",
        dataType: "html",
        url: url,
        beforeSend: function (xhr) {
            $("#searchPage").html("<h1>" + mxLang("app.loading") + "</h1>");
            timeout = setTimeout(function() {
              xhr.abort();
              enableCallbacks = false;
              // Handle the timeout
              $("#searchPage").html("<h1>" + mxLang("app.timeout") + "</h1>");
            }, handleTimeout);
        },
        success: function (data, textStatus, xhr) {
            clearTimeout(timeout);
            if (!enableCallbacks) return;

            var englishResultIndex = -1, turkishResultIndex = -1, englishFullResultIndex = -1, turkishFullResultIndex = -1;
            var $tables = $(data).find(".searchResultsTable");
            if ($tables.length) {
                for (var i = 0; i < $tables.length; i++) {
                    if ($($tables[i]).find(".c2:contains('ng')").length > 0) {
                        if (englishResultIndex == -1) {
                            englishResultIndex = i;
                            continue;
                        }
                        englishFullResultIndex = i;
                    }
                    else if ($($tables[i]).find(".c2:contains('" + Tureng.containsTerm() + "')").length > 0) {
                        if (turkishResultIndex == -1) {
                            turkishResultIndex = i;
                            continue;
                        }
                        turkishFullResultIndex = i;
                    }
                }

                // remove un-desired tr-columns.
                $tables.find(".visible-xs").each(function (index) {
                    $($(this)[0].nextElementSibling).remove();
                    $(this).remove();
                });

                var addedEng = false, addedTur = false;
                var twoSided = ((englishResultIndex > -1 || englishFullResultIndex > -1) &&
                                (turkishResultIndex > -1 || turkishFullResultIndex > -1));
                var firstResults = twoSided ? 5 : 6;
                var fullResults = twoSided ? 4 : 5;
                // add first side of results.
                if (englishResultIndex > -1) {
                    addedEng = true;
                    addToSearchPage($tables[englishResultIndex].outerHTML, firstResults);
                }
                if (turkishResultIndex > -1) {
                    if (addedEng && twoSided) {
                        replaceTurEng($($tables[turkishResultIndex]).find("tr").slice(1, firstResults));
                    } else {
                        addedTur = true;
                        addToSearchPage($tables[turkishResultIndex].outerHTML, firstResults);
                    }
                }
                if (englishFullResultIndex > -1) {
                    if (addedTur && twoSided) {
                        replaceTurEng($($tables[englishFullResultIndex]).find("tr").slice(1, fullResults));
                    } else if (addedEng) {
                        var slices = $($tables[englishFullResultIndex]).find("tr").slice(1, fullResults);
                        $("#englishResultsTable tbody").append(slices);
                    } else {
                        addedEng = true;
                        addToSearchPage($tables[englishFullResultIndex].outerHTML, fullResults);
                    }
                }
                // then, append second results.
                if (turkishFullResultIndex > -1) {
                    if (addedEng && twoSided) {
                        replaceTurEng($($tables[turkishFullResultIndex]).find("tr").slice(1, fullResults));
                    } else if (addedTur) {
                        var slices = $($tables[turkishFullResultIndex]).find("tr").slice(1, fullResults);
                        $("#englishResultsTable tbody").append(slices);
                    } else {
                        addedTur = true;
                        addToSearchPage($tables[turkishFullResultIndex].outerHTML, fullResults);
                    }
                }
                // change class name properly.
                $(".searchResultsTable tr:not(:first-child)").each(function(index) {
                    //var tr = $(this)[0];
                    //tr.children[1].title = turengAbbrv[tr.children[2].innerHTML];

                    if (index % 2 == 0) {
                        $(this).attr("class", "odd");
                    } else {
                        $(this).attr("class", "even");
                    }
                });
                // remove table cells that are undesired.
                $(".c0").remove();
                $(".c4").remove();
                $(".c5").remove();
                $(".rc0").remove();
                $(".rc4").remove();
                //$(".searchResultsTable").find("tr td:nth-child(2)").remove();
                // add white space for break-word in css.
                $(".even, .odd").each(function(index) {
                   var $td = $(this).find("td:first");
                   var text = $td.text();
                   text = text.replace(/\//g, " / ");
                   $td.html(text);
                });
            } else {
                $("#searchPage").html("<h1>" + mxLang("app.notFound") + "</h1>");
            }
            // add titles into the abbrevations.
            $(".visible-xs-inline").each(function() {
                $(this).attr("title", Tureng.abbrv[$(this).html()]);
            });
            // re-organize all results for panel application.
            $(".searchResultsTable td a").attr({href: "javascript:;", target: null}).each(function(index) {
                //console.log($(this).text());
                var text = $(this).text();
                text = text.replace(/[0-9"`\/|&?!:;.,_-]/g, " ");
                text = text.replace(/^\s+|\s+$/g, ""); // trim whitespaces.
                text = text.replace(/\s{2,128}/g, " "); // replace 2 or more white spaces into the one.
                text = text.replace("'", "\\'");
                $(this).attr("onclick", "turengTranslate('" + text + "');");
            
                // add highlights.
                var arr = $(this).text().split(" ");
                if (arr.length > 1) {
                    for (var i = 0; i < arr.length; i++) {
                        arr[i] = arr[i].replace("/", "</span>/<span>");
                    }

                    var newText = arr.join("</span> <span>");
                    newText = "<span>" + newText + "</span>";
                    newText = newText.replace("<span>(", "(<span>");
                    newText = newText.replace(")</span>", "</span>)");

                    $(this).html(newText).find("span").each(function(index) {
                        //console.log($(this).text());
                        $(this).hover(function() { // mouseover.
                            if (highlighted) {
                                highlightedText = $(this).text();
                                $(this).addClass("highlight");
                            }
                            $hoveredSpan = $(this);
                        }, function() { // mouseout.
                            highlightedText = "";
                            $hoveredSpan = null;
                            $(this).removeClass("highlight");
                        });
                    });
                }
            });
        },
        error: function (xhr, textStatus, errorThrown) {
            clearTimeout(timeout);
            if (!enableCallbacks) return;
            console.log("error: ", xhr.status, " ", textStatus);
            $("#searchPage").html("<h1>" + mxLang("app.notFound") + "</h1>");
        }
    });
}

function yandexTranslate(word, detectLang) {
    $("#DictionaryOutput").html("<h1>" + mxLang("app.loading") + "</h1>");
    var queryword = word.replace(/\s/g, "+");
    var detectUrl = "https://translate.yandex.net/api/v1.5/tr.json/detect?key=" + yandexApiKey + "&text=" + queryword;
    var translateUrl = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + yandexApiKey;

    if (detectLang == "") {
        $.get(detectUrl, function(data) {
            var currentLang = AvailableLangs.getCurrentLanguage();
            var currentLangText = mxLang("app." + currentLang);
            //console.log("yandex-detect error code: ", data.code);
            //console.log("yandex detect result: ", data.lang);
            if (data.lang == "en") {
                translateUrl = translateUrl + "&lang=en-" + currentLang + "&text=" + queryword;
                $("#DictFirst").html(mxLang("app.eng"));
                $("#DictFirst").attr("title", mxLang("app.eng"));
                $("#DictSecond").html(currentLangText);
                $("#DictSecond").attr("title", currentLangText);
            } else {
                translateUrl = translateUrl + "&lang=" + currentLang + "-en&text=" + queryword;
                $("#DictFirst").html(currentLangText);
                $("#DictFirst").attr("title", currentLangText);
                $("#DictSecond").html(mxLang("app.eng"));
                $("#DictSecond").attr("title", mxLang("app.eng"));
            }
            $.get(translateUrl, function(data) {
                //console.log("yandex-translate error code: ", data.code);
                //console.log("yandex translate result: ", data.text.join(" "));
                $("#DictionaryOutput").html("<span>" + data.text.join(" ") + "</span>");
            }, "json");
        }, "json");
    } else {
        translateUrl = translateUrl + detectLang + "&text=" + queryword;
        $.get(translateUrl, function (data) {
            //console.log("yandex-translate error code: ", data.code);
            //console.log("yandex translate result: ", data.text.join(" "));
            $("#DictionaryOutput").html("<span>" + data.text.join(" ") + "</span>");
        }, "json");
    }

    $("#TargetText").val(word.toLowerCase());
    $("#TargetText").focus();
    //$("#mainPageBottom").show();
}

function turengTranslate(word) {
    //console.log("highlightedText: ", highlightedText);
    if (highlightedText) {
        word = highlightedText;
        word = word.replace(/&\w+;/g, ""); // remove html codes like &nbsp;
        word = word.replace(/[0-9\/\(\)|&?!:;.,_-]/g, " "); // convert some chars to whitespace.
        word = word.replace(/^\s+|\s+$/g, ""); // trim whitespaces.
        word = word.replace(/\s{2,128}/g, " "); // replace 2 or more white spaces into the one.
        highlightedText = "";
        $hoveredSpan = null;
    }

    navHistory.add(word);
    loadTurengSearchResults(Tureng.getUrl() + encodeURIComponent(word));
    $("#searchWord").val(word.toLowerCase());
    $("#searchWord").attr("title", $("#searchWord").val());
    $("#searchWord").focus();
    $("#mainPageBottom").show();
}

function wordReferenceTranslate(word) {
    navHistory.add(word);
    loadWordReferenceSearchResults(Wordreference.getUrl() + encodeURIComponent(word));
    $("#si").val(word.toLowerCase());
    $("#si").attr("title", $("#si").val());
    $("#si").focus();
    $("#mainPageBottom").show();
}

function dictionaryTranslate(word) {
    navHistory.add(word);
    loadDictionaryReferenceSearchResults(DictionaryReference.getUrl() + encodeURIComponent(word));
    $("#search-input").val(word.toLowerCase());
    $("#search-input").attr("title", $("#search-input").val());
    $("#search-input").focus();
    $("#mainPageBottom").show();
}

function openMore() {
    var tabs = mxRuntime.create("mx.browser.tabs");
    var newUrl = getUrl($(".activeContent").attr("id"));
    var word = $("#searchWord").val();

    if (word) {
        var queryWord = encodeURIComponent(word); //word.replace(/\s/g, "%20");
        newUrl = newUrl + queryWord;
    }

    tabs.newTab({ url: newUrl });
}
