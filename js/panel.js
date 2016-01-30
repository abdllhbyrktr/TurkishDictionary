var dblclicked = false;
var mouseSelected = false;
var highlighted = false;
var highlightedText = "";
var $hoveredSpan;
var badgeNumber = 0;
var lastSelected = "";
var handleTimeout = 6000;
var maxNavigationHistory = 10;
var yandexApiKey = "trnsl.1.1.20150328T004518Z.482e8153ea2baa64.d0a5debb3b13637b9c6cd2b12a9398efb62fbd9b";

var PanelTab = (function () {
    // variables.
    var currentTab = Tureng.tabId;
    // constructor.
    function PanelTab() {
        //this.currentTab = 0;
    };

    PanelTab.prototype.getCurrentTab = function () {
        return currentTab;
    };

    PanelTab.prototype.setCurrentTab = function (tab) {
        currentTab = tab;
    };

    PanelTab.prototype.translate = function (word) {
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

        var inputSelector = "",
            url ="";

        switch (currentTab) {
            case Tureng.tabId:
                inputSelector = Tureng.inputSelector;
                url = Tureng.getUrl() + encodeURIComponent(word);
                getHtmlData(url, Tureng.divContainer, loadTurengSearchResults);
                break;
            case Wordreference.tabId:
                inputSelector = Wordreference.inputSelector;
                url = Wordreference.getUrl() + encodeURIComponent(word);
                getHtmlData(url, Wordreference.divContainer, loadWordReferenceSearchResults);
                break;
            case DictionaryReference.tabId:
                inputSelector = DictionaryReference.inputSelector;
                url = DictionaryReference.getUrl() + encodeURIComponent(word);
                getHtmlData(url, DictionaryReference.divContainer, loadDictionaryReferenceSearchResults);
                break;
            case YandexTranslate.tabId:
                inputSelector = YandexTranslate.inputSelector;
                yandexTranslate(word, "");
                break;
            case TdkSozluk.tabId:
                inputSelector = TdkSozluk.inputSelector;
                url = TdkSozluk.getUrl() + encodeURIComponent(word);
                getHtmlData(url, TdkSozluk.divContainer, loadTdkSearchResults);
                break;
            default:
                console.log("Error: there is no tab with: " + currentTab);
                break;
        }
        
        if (currentTab != YandexTranslate.tabId) {
            $(inputSelector).attr("title", $(inputSelector).val());
            $("#mainPageBottom").show();
        }

        $(inputSelector).val(word.toLowerCase());
        $(inputSelector).focus();
        userConfig.lastSearchTerm = word;
    };

    return PanelTab;
})();
var panelTab = new PanelTab();

var navHistory = {
    backArr: [],
    forwardArr: [],
    navigating: false,
    add: function(word) {
        if (!this.navigating) {
            if ($.inArray(word, this.backArr) === -1) this.backArr.push(word);
            userConfig.lastSearchTerm = word;
        }
        if (this.backArr.length > maxNavigationHistory) { this.backArr.shift(); }
        if (this.backArr.length > 1) { this.cssBack(true); }
        // reset forward.
        if (this.forwardArr.length && !this.navigating) {
            this.cssForward(false);
            this.forwardArr = [];   
        }
        // change styles for back array.
        if (this.backArr.length <= 1) { this.cssBack(false); }
        // change styles for forward array.
        if (!this.forwardArr.length) { this.cssForward(false); }

        this.navigating = false;
    },
    next: function() {
        if (!this.forwardArr.length) { return; }
        this.navigating = true;
        var word = this.forwardArr.pop();
        this.backArr.push(word);
        panelTab.translate(word);
    },
    prev: function() {
        if (!this.backArr.length) { return; }
        if (this.forwardArr.length == 0) { this.cssForward(true); }
        this.navigating = true;
        var toForward = this.backArr.pop();
        this.forwardArr.push(toForward);
        panelTab.translate(this.backArr[this.backArr.length - 1]);
    },
    cssBack: function(active) {
        if (active) {
            $(".navigationBack").css({"cursor": "default", "-webkit-filter": "grayscale(0.1)"});
            $(".navigationBack").attr("title", mxLang("app.backward"));
        } else {
            $(".navigationBack").css({"cursor": "default", "-webkit-filter": "grayscale(1)"});
            $(".navigationBack").attr("title", null);
        }
    },
    cssForward: function(active) {
        if (active) {
            $(".navigationForward").css({"cursor": "default", "-webkit-filter": "grayscale(0.1)"});
            $(".navigationForward").attr("title", mxLang("app.forward"));
        } else {
            $(".navigationForward").css({"cursor": "default", "-webkit-filter": "grayscale(1)"});
            $(".navigationForward").attr("title", null);
        }
    }
};

function updateTabs() {
    userConfig.onOffWordReference ? $(".tab-links li:eq(1)").show() : $(".tab-links li:eq(1)").hide();
    userConfig.onOffDictionaryReference ? $(".tab-links li:eq(2)").show() : $(".tab-links li:eq(2)").hide();
    userConfig.onOffTdkSozluk ? $(".tab-links li:eq(3)").show() : $(".tab-links li:eq(3)").hide();
    userConfig.onOffYandexTranslate ? $(".tab-links li:eq(4)").show() : $(".tab-links li:eq(4)").hide();
}

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
                panelTab.translate(lastSelected);
                lastSelected = "";
            } else {
                $("#searchWord").focus();
            }
            updateTabs();
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

mxRuntime.listen("updateTabs", function (searchKey) {
    updateTabs();
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

    updateTabs();
    // Handler for .ready() called.
    $("#searchPage").html("<h1>" + mxLang("app.loading") + "</h1>");
    // Hide main page bottom.
    $("#mainPageBottom").hide();
    // check culture for websites.
    //checkCulture();
    // prevent right click on panel.
    $(document).bind("contextmenu", function (e) { return false; });

    $("input[type='text']").keypress(function (event) {
        var tabId = $(this).attr("data-tab-id");
        var inputSelector = getInputSelector(tabId);

        if (event.which == 13) {
            var searchTerm = $(inputSelector).val();

            if (searchTerm.length) {
                panelTab.translate(searchTerm);
            }
        }
    });

    $("#searchButton").click(function () {
        var searchTerm = $(Tureng.inputSelector).val();

        if (searchTerm.length) {
            panelTab.translate(searchTerm);
        }
    });

    $("#search input.button").click(function () {
        var searchTerm = $(Wordreference.inputSelector).val();

        if (searchTerm.length) {
            panelTab.translate(searchTerm);
        }
    });

    $("#search-submit").click(function () {
        var searchTerm = $(DictionaryReference.inputSelector).val();

        if (searchTerm.length) {
            panelTab.translate(searchTerm);
        }
    });
    
    $("#tdk-input").click(function () {
        var searchTerm = $(TdkSozluk.inputSelector).val();

        if (searchTerm.length) {
            panelTab.translate(searchTerm);
        }
    });

    $("#DictControl").click(function () {
        var dataLang = "";
        var searchTerm = $(YandexTranslate.inputSelector).val();
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
    $("#DictSwap").click(function () {
        var first = $("#DictFirst").html();
        var second = $("#DictSecond").html();
        $("#DictFirst").html(second);
        $("#DictFirst").attr("title", second);
        $("#DictSecond").html(first);
        $("#DictSecond").attr("title", first);
        $("#TargetText").focus();
    });

    $(document).on("keydown", function () {
        // ctrl key.
        if (event.which == 17) {
            highlighted = true;
            if ($hoveredSpan) {
                highlightedText = $hoveredSpan.text();
                $hoveredSpan.addClass("highlight");
            }
        }
    });

    $(document).on("keyup", function () {
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
    dblclicked = userConfig.doubleClicked || false;
    mouseSelected = userConfig.mouseSelected || false;

    var checkedClick = dblclicked ? ' checked="checked"' : '';
    var checkedSelect = mouseSelected ? ' checked="checked"' : '';

    $("#settings").html('<div class="setDblClick"><span>' + mxLang("app.dblclick") + '</span><input type="checkbox" id="onOffDblClick"' + checkedClick + '/></div><div class="setSelection"><span>' + mxLang("app.selection") + '</span><input type="checkbox" id="onOffSelection"' + checkedSelect + '/></div><div class="settingsIcon" title="' + mxLang("app.settings") + '"></div>');

    $(".setDblClick :checkbox").iphoneStyle({ checkedLabel: mxLang("app.on"), uncheckedLabel: mxLang("app.off"), onChange: function (e, checked) {
        dblclicked = checked;
        userConfig.doubleClicked = dblclicked;
        sendSettings();
    }
    });

    $(".setSelection :checkbox").iphoneStyle({ checkedLabel: mxLang("app.on"), uncheckedLabel: mxLang("app.off"), onChange: function (e, checked) {
        mouseSelected = checked;
        userConfig.mouseSelected = mouseSelected;
        sendSettings();
    }
    });

    $("#settings").hover(function (event) {
        // mouseover.
        event.stopPropagation();
        $(this).css("top", "0px");
    }, function (event) {
        // mouseout.
        event.stopPropagation();
        $(this).css("top", "-58px");
    });

    $(".navigationBack").click(function () {
        navHistory.prev();
    });

    $(".navigationForward").click(function () {
        navHistory.next();
    });

    sendSettings();
    panelTab.translate(userConfig.lastSearchTerm);
});

function getHtmlData(url, notifyContainer, loadFunc) {
    var timeout = null;
    var enableCallbacks = true;

    $.ajax({
        type: "GET",
        dataType: "html",
        url: url,
        beforeSend: function (xhr) {
            $(notifyContainer).html("<h1>" + mxLang("app.loading") + "</h1>");
            timeout = setTimeout(function () {
                xhr.abort();
                enableCallbacks = false;
                // Handle the timeout
                $(notifyContainer).html("<h1>" + mxLang("app.timeout") + "</h1>");
            }, handleTimeout);
        },
        success: function (data, textStatus, xhr) {
            clearTimeout(timeout);
            if (!enableCallbacks) return;

            loadFunc(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            clearTimeout(timeout);
            if (!enableCallbacks) return;
            console.log("error: ", xhr.status, " ", textStatus);
            $(notifyContainer).html("<h1>" + mxLang("app.notFound") + "</h1>");
        }
    });
}

function loadTdkSearchResults(data) {
    var $tables = $(data).find("table[id*='hor-minimalist']");
    var html = "";

    if ($tables.length > 0) {
        $tables.each(function () {
            $(this).addClass("hor-minimalist");
            html += this.outerHTML;
        });

        $(TdkSozluk.divContainer).html(html);
        $("#tdkContainer td a").attr({ href: "javascript:;", target: null }).each(reOrganizeLinks);
    } else {
        $(TdkSozluk.divContainer).html("<h1>" + mxLang("app.notFound") + "</h1>");
    }
}

function loadDictionaryReferenceSearchResults(data) {
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
}

function loadWordReferenceSearchResults(data) {
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

function reOrganizeLinks(item) {
    //console.log($(this).text());
    var text = $(this).text();
    text = text.replace(/[0-9"`\/|&?!:;.,_-]/g, " ");
    text = text.replace(/^\s+|\s+$/g, ""); // trim whitespaces.
    text = text.replace(/\s{2,128}/g, " "); // replace 2 or more white spaces into the one.
    text = text.replace("'", "\\'");
    $(this).attr("onclick", "panelTab.translate('" + text + "');");

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

        $(this).html(newText).find("span").each(function (index) {
            //console.log($(this).text());
            $(this).hover(function () { // mouseover.
                if (highlighted) {
                    highlightedText = $(this).text();
                    $(this).addClass("highlight");
                }
                $hoveredSpan = $(this);
            }, function () { // mouseout.
                highlightedText = "";
                $hoveredSpan = null;
                $(this).removeClass("highlight");
            });
        });
    }
}

function loadTurengSearchResults(data) {
    var englishResultIndex = -1,
        turkishResultIndex = -1,
        englishFullResultIndex = -1,
        turkishFullResultIndex = -1;
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
    $(".searchResultsTable td a").attr({href: "javascript:;", target: null}).each(reOrganizeLinks);
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
}

function openMore() {
    var tabs = mxRuntime.create("mx.browser.tabs");
    var tabId = $(".activeContent").attr("id");
    var newUrl = getUrl(tabId);
    var inputSelector = getInputSelector(tabId)
    var word = $(inputSelector).val();

    if (word) {
        var queryWord = encodeURIComponent(word); //word.replace(/\s/g, "%20");
        newUrl = newUrl + queryWord;
    }

    tabs.newTab({ url: newUrl });
}
