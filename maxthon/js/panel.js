var dblclicked = false;
var mouseSelected = false;
var highlighted = false;
var highlightedText = "";
var $hoveredSpan;
var handleTimeout = 8000;
var maxNavigationHistory = 10;
var yandexApiKey = "trnsl.1.1.20150328T004518Z.482e8153ea2baa64.d0a5debb3b13637b9c6cd2b12a9398efb62fbd9b";

ExtensionCore.addAppListener(ExtensionCore.AppEvents.appShow, function () {
    updateSwapLangs();
    updateTabs();
});

ExtensionCore.addAppListener(ExtensionCore.AppEvents.appHide, function () {
    // if (navHistory.backArr.length) {
    //     userConfig.lastSearchTerm = navHistory.backArr[navHistory.backArr.length - 1];
    // }
});

ExtensionCore.listen("refresh", function (from) {
    ExtensionCore.updateDisplayLocale();
    location.reload();
});

ExtensionCore.listen("showBadge", function (selected) {
    // do nothing.
});

ExtensionCore.listen("retrieveMessage", function (msg) {
    //console.log("I got message from script action: ", msg);
    setTimeout(sendSettings, 100);
});

ExtensionCore.listen("translate", function (searchKey) {
    panelTab.translate(searchKey);
    //setTimeout(sendResults, 100);
});

ExtensionCore.listen("updateTabs", function (isChecked) {
    updateSwapLangs();
    updateTabs();
});

ExtensionCore.listen("toggleSettingsForSelection", function (settings) {
    $(".setSelection :checkbox").click();
});

ExtensionCore.listen("toggleSettingsForDoubleClick", function (settings) {
    $(".setDblClick :checkbox").click();
});

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
        if (!word.length) {
            return;
        }

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
        if (currentTab == YandexTranslate.tabId) {
            yandexTranslate(word);
        } else {
            var url = getUrl(currentTab) + encodeURIComponent(word);
            getHtmlData(url, getDivContainer(currentTab), getLoadFunc(currentTab));
            $("#mainPageBottom").show();
        }

        $("#searchInput").val(word.toLowerCase());
        $("#searchInput").focus();
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
            $(".navigationBack").removeClass("disabled");
            $(".navigationBack").attr("title", ExtensionCore.i18n("app.backward"));
        } else {
            $(".navigationBack").addClass("disabled");
            $(".navigationBack").attr("title", null);
        }
    },
    cssForward: function(active) {
        if (active) {
            $(".navigationForward").removeClass("disabled");
            $(".navigationForward").attr("title", ExtensionCore.i18n("app.forward"));
        } else {
            $(".navigationForward").addClass("disabled");
            $(".navigationForward").attr("title", null);
        }
    }
};

function updateSwapLangs() {
    $("#fromLang").attr("data-value", userConfig.fromLang);
    $("#fromLang i").removeClass().addClass(userConfig.fromLang.getLanguageIcon());
    $("#toLang").attr("data-value", userConfig.toLang);
    $("#toLang i").removeClass().addClass(userConfig.toLang.getLanguageIcon());
}

function updateTabs() {
    var currentTabInNotSupported = false;
    var currentTab = $(".tab-content .active").attr("id");

    AllWebsites.forEach(function(element, index, array) {
        var $el = $("a[data-toggle='tab'][href='#" + element.tabId + "']");
        var isSupported = element.isSupported(userConfig.fromLang, userConfig.toLang);

        isSupported ? $el.show() : $el.hide();
        if (element.tabId == currentTab) {
            currentTabInNotSupported = !isSupported;
        }
    });

    if (currentTabInNotSupported) {
        var $firstTab = $("a[data-toggle='tab']:not(:hidden):first");
        $firstTab.tab("show");
        panelTab.setCurrentTab($firstTab.attr("aria-controls"));
    }

    panelTab.translate(userConfig.lastSearchTerm);
}

function sendResults() {
    ExtensionCore.post("results", $("#searchPage").html());
}

function sendSettings() {
    var obj = {"dblClick": dblclicked, "mouseSelect": mouseSelected};
    ExtensionCore.post("getSettings", obj);
}

$(document).ready(function () {
    localizeHtml();
    // prevent right click on panel.
    $(document).bind("contextmenu", function (e) { return false; });

    $("a[data-toggle='tab']").on("shown.bs.tab", function (e) {
        e.target // newly activated tab
        e.relatedTarget // previous active tab
        var tabId = $(e.target).attr("aria-controls");
        // set current tab index
        panelTab.setCurrentTab(tabId);
        // translate
        var currentWord = userConfig.lastSearchTerm;
        panelTab.translate(currentWord);
    });

    $("#searchInput").on("keypress", function(e) {
        e.stopPropagation();
        if (e.which == 13) {
            panelTab.translate($(this).val());
        }
    });

    $("#searchButton").click(function(e) {
        e.stopPropagation();
        panelTab.translate($("#searchInput").val());
    });

    $("#clickMore").click(function(e) {
        e.stopPropagation();
        var tabId = $(".tab-content .active").attr("id");
        var newUrl = getUrl(tabId);
        var word = $("#searchInput").val();

        if (tabId == YandexTranslate.tabId) {
            newUrl = newUrl.replace("/&", "/?");
        }

        if (word) {
            var queryWord = encodeURIComponent(word); //word.replace(/\s/g, "%20");
            newUrl = newUrl + queryWord;
        }

        ExtensionCore.openNewTab(newUrl);
    });

    $(".fromLang-dropdown a").click(function(e) {
        var fromLang = $(this).attr("data-value");
        if (userConfig.fromLang == fromLang) {
            return;
        }

        userConfig.fromLang = fromLang;
        updateSwapLangs();
        updateTabs();
    });

    $(".toLang-dropdown a").click(function(e) {
        var toLang = $(this).attr("data-value");
        if (userConfig.toLang == toLang) {
            return;
        }

        userConfig.toLang = toLang;
        updateSwapLangs();
        updateTabs();
    });

    $("#swapFromTo").click(function(e) {
        e.stopPropagation();
        var fromLang = $("#fromLang").attr("data-value");
        var toLang = $("#toLang").attr("data-value");

        if (fromLang == toLang) {
            return false;
        }

        userConfig.toLang = fromLang;
        userConfig.fromLang = toLang;
        updateSwapLangs();
        updateTabs();
    });

    $("#TargetText").on("change keyup paste", function() {
        $("#searchInput").val($(this).val());
    })

    // initialize.
    var activeTabId = $(".tab-content .active").attr("id");
    $("#searchInput").val(userConfig.lastSearchTerm);
    $(getDivContainer(activeTabId)).html("<h1>" + ExtensionCore.i18n("app.loading") + "</h1>");
    $("#mainPageBottom").hide();
    updateSwapLangs();
    updateTabs();

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
    dblclicked = userConfig.doubleClicked || dblclicked;
    mouseSelected = userConfig.mouseSelected || mouseSelected;

    var checkedClick = dblclicked ? "checked" : null;
    var checkedSelect = mouseSelected ? "checked" : null;

    $("#onOffDblClick").prop("checked", checkedClick)
        .change(function () {
            dblclicked = $(this).is(":checked");
            userConfig.doubleClicked = dblclicked;
            sendSettings();
    });

    $("#onOffSelection").prop("checked", checkedSelect)
        .change(function () {
            mouseSelected = $(this).is(":checked");
            userConfig.mouseSelected = mouseSelected;
            sendSettings();
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

    $(".navigationSound").click(function () {
        var audioSource = getAudioSourceUrl(panelTab.getCurrentTab());
        if (audioSource) {
            var audio = new Audio(audioSource);
            audio.play();
        }
    });

    sendSettings();
    //panelTab.translate(userConfig.lastSearchTerm);
});

function getHtmlData(url, notifyContainer, loadFunc) {
    var timeout = null;
    var enableCallbacks = true;

    $.ajax({
        type: "GET",
        dataType: "html",
        url: url,
        beforeSend: function (xhr) {
            $(notifyContainer).html("<h1>" + ExtensionCore.i18n("app.loading") + "</h1>");
            timeout = setTimeout(function () {
                xhr.abort();
                enableCallbacks = false;
                // Handle the timeout
                $(notifyContainer).html("<h1>" + ExtensionCore.i18n("app.timeout") + "</h1>");
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
            $(notifyContainer).html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
        }
    });
}

function loadSozluknetSearchResults(data) {
    var selector = "#" + userConfig.fromLang + userConfig.toLang;
    var $data = $(data);
    var $tables = $data.find(selector);
    if ($tables.length > 0) {
        // set the first audio source url.
        var audioSource = $data.find('img[src*="audio.gif"]').closest('a');
        if (audioSource.length) {
            var wordId = userConfig.lastSearchTerm.charAt(0);
            var jsSource = audioSource.attr('href');
            var wavId = jsSource.slice(jsSource.lastIndexOf(','), -3).slice(2);
            SozlukNet.defaultAudioUrl = "http://www.sozluk.net/wavs/" + wordId + "/" + wavId + ".wav";
        } else {
            SozlukNet.defaultAudioUrl = "";
        }

        $tables.find("td").prop("width", null);
        $tables.find("a img").each(function(index, item) {
            $(this).parent().remove();
        });
        $tables.find("a").attr({ href: "javascript:;", target: null });
        $(SozlukNet.divContainer).html($tables.find("table")[0].outerHTML);
    } else {
        $(SozlukNet.divContainer).html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
    }
}

function loadAbbyySearchResults(data) {
    var $data = $(data);
    var $abbyContainer = $(Abbyy.divContainer);
    var $article = $data.find('div[name*="dictionary"]');
    if ($article.length > 0) {
        $article.find('a[href*="api.lingvolive.com/sounds"]').remove();
        $article.find('._1lsRx').remove();
        $article.find('h1').remove();
        $article.find('h4').remove();
        $abbyContainer.html($article[0].outerHTML);
        $abbyContainer.find('._3zJig').each(reOrganizeLinks);
        $abbyContainer.find("a").attr({ href: "javascript:;", target: null }).each(reOrganizeLinks);
    } else {
        $(Abbyy.divContainer).html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
    }
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
        $(TdkSozluk.divContainer).html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
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
        $(".source-data").html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
    }
}

function loadWordReferenceSearchResults(data) {
    var $data = $(data);
    if ($data.find("#noEntryFound").length || $data.find(".tobetranslated").length) {
        $("#articleWRD").html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
        return;
    }

    var $tables = $data.find(".WRD");
    if ($tables.length) {
        $("#articleWRD").html($tables[0].outerHTML);

        // set the first audio source url.
        var $listenWidget = $data.find('#listen_widget');
        var audioSourceUrl = $listenWidget.length ?
                Wordreference.baseUrl + $listenWidget.find('audio:first source').attr('src') : '';
        Wordreference.defaultAudioUrl = audioSourceUrl;
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
        $("#articleWRD a").attr({ href: "javascript:;", target: null }).each(reOrganizeLinks);
    } else {
        $tables = $data.find("#article");
        if ($tables.length) {
            $("#articleWRD").html($tables[0].outerHTML);
            $("#articleWRD").find(".small1").remove();
            $("#articleWRD a").attr({ href: "javascript:;", target: null }).each(reOrganizeLinks);
        } else {
            $("#articleWRD").html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
        }
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
    var text = $(this).text();

    if (/\([^)]*\)/g.test(text)) {
        return;
    }

    //console.log($(this).text());
    text = text.replace(/[0-9"`\/|&?!:;.,_-]/g, " ");
    text = text.replace(/^\s+|\s+$/g, ""); // trim whitespaces.
    text = text.replace(/\s{2,128}/g, " "); // replace 2 or more white spaces into the one.
    text = text.replace("'", "\\'");
    $(this).on("click", function(e) {
        panelTab.translate(text);
    });

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
    var $data = $(data);
    var $tables = $data.find(".searchResultsTable");

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
        // set the first audio source url.
        Tureng.defaultAudioUrl = $data.find('.tureng-voice:first source').attr('src');
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
        $("#searchPage").find(".c0").remove();
        $("#searchPage").find(".c4").remove();
        $("#searchPage").find(".c5").remove();
        $("#searchPage").find(".rc0").remove();
        $("#searchPage").find(".rc4").remove();
        //$(".searchResultsTable").find("tr td:nth-child(2)").remove();
        // add white space for break-word in css.
        $("#searchPage").find(".even, .odd").each(function(index) {
            var $td = $(this).find("td:first");
            var text = $td.text();
            text = text.replace(/\//g, " / ");
            $td.html(text);
        });
    } else {
        $("#searchPage").html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
    }
    // add titles into the abbrevations.
    $(".visible-xs-inline").each(function() {
        $(this).attr("title", Tureng.abbrv[$(this).html()]);
    });
    // re-organize all results for panel application.
    $(".searchResultsTable td a").attr({href: "javascript:;", target: null}).each(reOrganizeLinks);
}

function yandexTranslate(word) {
    var queryword = word.replace(/\s/g, "+");
    var translateUrl = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + yandexApiKey;

    $("#TargetText").val(word);
    $("#DictionaryOutput").html("<h1>" + ExtensionCore.i18n("app.loading") + "</h1>");

    translateUrl = translateUrl + YandexTranslate.langs[userConfig.fromLang][userConfig.toLang] + queryword;
    $.get(translateUrl, function (data) {
        //console.log("yandex-translate error code: ", data.code);
        //console.log("yandex translate result: ", data.text.join(" "));
        $("#DictionaryOutput").html("<span>" + data.text.join(" ") + "</span>");
    }, "json");
}

NotSupported.loadFunc = function(data) {}
Tureng.loadFunc = loadTurengSearchResults;
Wordreference.loadFunc = loadWordReferenceSearchResults;
DictionaryReference.loadFunc = loadDictionaryReferenceSearchResults;
TdkSozluk.loadFunc = loadTdkSearchResults;
Abbyy.loadFunc = loadAbbyySearchResults;
SozlukNet.loadFunc = loadSozluknetSearchResults;