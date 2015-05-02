// Get the runtime object
var rt = window.external.mxGetRuntime();
var browser = rt.create("mx.browser");
var lang = rt.locale.t;
//console.log(rt.version);
//console.log(rt.locale.getSystemLocale()); // en, tr-tr
var dblclicked = false;
var mouseSelected = false;
var highlighted = false;
var highlightedText = "";
var $hoveredSpan;
var badgeNumber = 0;
var lastSelected = "";
var culture = "";
var turengAbbrv = {
    "v.": "verb",
    "f.": "yüklem",
    "n.": "noun",
    "i.": "isim",
    "adv.": "adverb",
    "zf.": "belirteç",
    "adj.": "adjective",
    "s.": "sıfat",
    "prep.": "preposition",
    "ed.": "ilgeç",
    "interj.": "interjection",
    "ünl.": "ünlem",
    "conj.": "conjunction",
    "bağ.": "bağlaç",
    "": null,
    "undefined": null
};

var urls = {
    "turengTab": "http://tureng.com/search/",
    "wordReferenceTab": "http://www.wordreference.com/entr/",
    "dictionaryTab": "http://dictionary.reference.com/browse/",
    "yandexTab": "https://ceviri.yandex.com.tr/?text="
};

var yandexApiKey = "trnsl.1.1.20150328T004518Z.482e8153ea2baa64.d0a5debb3b13637b9c6cd2b12a9398efb62fbd9b";

rt.onAppEvent = function (obj) {
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
            //rt.icon.showBadge(badgeNumber);
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
                rt.storage.setConfig("lastSearched", navHistory.backArr[navHistory.backArr.length - 1]);
            }
            break;
        case "ERROR":
            console.log(obj.errorMessage);
            break;
        case "LOCALE_CHANGED":
            rt.locale.setDisplayLocale(rt.locale.getSystemLocale());
            location.reload();
            break;
        default:
            console.log("appevent types out of " + obj.type + ".");
    }
};

rt.listen("showBadge", function (selected) {
    //lastSelected = selected;
    badgeNumber = badgeNumber + 1;
    //rt.icon.showBadge(badgeNumber);
});

rt.listen("retrieveMessage", function (msg) {
    //console.log("I got message from script action: ", msg);
    setTimeout(sendSettings, 100);
});

rt.listen("translate", function (searchKey) {
    turengTranslate(searchKey);
    //setTimeout(sendResults, 100);
});

function sendResults() {
    rt.post("results", $("#searchPage").html());
}

function sendSettings() {
    var obj = {"dblClick": dblclicked, "mouseSelect": mouseSelected};
    rt.post("getSettings", obj);
}

function checkCulture() {
    var locale = rt.locale.getSystemLocale();
    if (culture == "") {
        var timeout = null;
        var enableCallbacks = true;
        $.ajax({
            type: "GET",
            dataType: "html",
            url: "http://tureng.com/",
            beforeSend: function (xhr) {
                timeout = setTimeout(function() {
                  xhr.abort();
                  enableCallbacks = false;
                  // Handle the timeout
                  culture = "";
                  setTimeout(checkCulture, 5000);
                }, 2000);
            },
            success: function (data, textStatus, xhr) {
                clearTimeout(timeout);
                if (!enableCallbacks) return;
                var $culture = $(data).find("#topBarRight a[href^='/setculture']");
                if ($culture.length) {
                    var href = $culture.attr("href");
                    var arr = href.split("=");
                    culture = arr[1];
                    if (locale.indexOf(culture) > -1) {
                        // set tureng culture.
                        var tabs = rt.create("mx.browser.tabs");
                        var newUrl = "http://tureng.com/setculture?culture=" + culture;
                        tabs.newTab({ url: newUrl, activate: false });
                    } else {
                        culture = locale.split("-")[0];
                    }
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                clearTimeout(timeout);
                if (!enableCallbacks) return;
                console.log("error: ", xhr.status, " ", textStatus);
            }
        });
    } else if (locale.indexOf(culture) < 0) {
        // set tureng culture.
        var tabs = rt.create("mx.browser.tabs");
        var newUrl = "http://tureng.com/setculture?culture=" + culture;
        tabs.newTab({ url: newUrl, activate: false });
    }
}

$(document).ready(function () {
    $(".tabs .tab-links a").on("click", function (e) {
        var currentAttrValue = $(this).attr("href");

        // Show/Hide Tabs
        $(".tabs " + currentAttrValue).fadeIn(400).siblings().hide();

        // Change/remove current tab to active
        $(this).parent("li").addClass("active").siblings().removeClass("active");
        $(currentAttrValue).addClass("activeContent").siblings().removeClass("activeContent");

        e.preventDefault();
    });

    // Handler for .ready() called.
    $("#searchPage").html("<h1>" + lang("app.loading") + "</h1>");
    // Hide main page bottom.
    $("#mainPageBottom").hide();
    // check culture for websites.
    //checkCulture();
    // prevent right click on panel.
    //$(document).bind("contextmenu", function (e) { return false; });

    $("#searchWord").keypress(function (event) {
        // return key(enter).
        if (event.which == 13) {
            var searchTerm = $("#searchWord").val();

            if (searchTerm.length) {
                turengTranslate(searchTerm);
            }
        }
    });

    $("#searchButton").click(function () {
        var searchTerm = $("#searchWord").val();

        if (searchTerm.length) {
            turengTranslate(searchTerm);
        }
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
    if (rt.storage.getConfig("dblclicked")) {
        dblclicked = (rt.storage.getConfig("dblclicked") == "true") ? true : false;
    }
    if (rt.storage.getConfig("mouseSelected")) {
        mouseSelected = (rt.storage.getConfig("mouseSelected") == "true") ? true : false;
    }

    var checkedClick = dblclicked ? ' checked="checked"' : '';
    var checkedSelect = mouseSelected ? ' checked="checked"' : '';

    $("#settings").html('<div class="setDblClick"><span>' + lang("app.dblclick") + '</span><input type="checkbox" id="onOffDblClick"' + checkedClick + '/></div><div class="setSelection"><span>' + lang("app.selection") + '</span><input type="checkbox" id="onOffSelection"' + checkedSelect + '/></div><div class="settingsIcon" title="' + lang("app.settings") + '"></div>');

    $(".setDblClick :checkbox").iphoneStyle({checkedLabel: lang("app.on"), uncheckedLabel: lang("app.off"), onChange: function (e, checked) {
        dblclicked = checked;
        rt.storage.setConfig("dblclicked", dblclicked);
        sendSettings();
    }});

    $(".setSelection :checkbox").iphoneStyle({checkedLabel: lang("app.on"), uncheckedLabel: lang("app.off"), onChange: function (e, checked) {
        mouseSelected = checked;
        rt.storage.setConfig("mouseSelected", mouseSelected);
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
    var lastSearched = rt.storage.getConfig("lastSearched");
    if (!lastSearched) { lastSearched = "gezi parkı"; }
    setTimeout(turengTranslate(lastSearched), 100);
});

function replaceTurEng($trs) {
    for (var i = 0; i < $trs.length; i++) {
        var tr = $trs[i];
        $("table tbody").append("<tr>" +
        tr.children[0].outerHTML +
        tr.children[1].outerHTML +
        tr.children[2].outerHTML +
        tr.children[4].outerHTML +
        tr.children[3].outerHTML +
        tr.children[5].outerHTML +
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
            $("#searchPage").html("<h1>" + lang("app.loading") + "</h1>");
            timeout = setTimeout(function() {
              xhr.abort();
              enableCallbacks = false;
              // Handle the timeout
              $("#searchPage").html("<h1>" + lang("app.timeout") + "</h1>");
            }, 4000);
        },
        success: function (data, textStatus, xhr) {
            clearTimeout(timeout);
            if (!enableCallbacks) return;

            var englishResultIndex = -1, turkishResultIndex = -1, englishFullResultIndex = -1, turkishFullResultIndex = -1;
            var $tables = $(data).find(".searchResultsTable");
            if ($tables.length) {
                for (var i = 0; i < $tables.length; i++) {
                    if ($($tables[i]).find(".c2:contains('English')").length > 0) {
                        if (englishResultIndex == -1) {
                            englishResultIndex = i;
                            continue;
                        }
                        englishFullResultIndex = i;
                    }
                    else if ($($tables[i]).find(".c2:contains('Turkish')").length > 0) {
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
                $(".searchResultsTable").find("tr td:nth-child(2)").remove();
                // add white space for break-word in css.
                $(".even, .odd").each(function(index) {
                   var $td = $(this).find("td:first");
                   var text = $td.text();
                   text = text.replace(/\//g, " / ");
                   $td.html(text);
                });
            } else {
                $("#searchPage").html("<h1>" + lang("app.notFound") + "</h1>");
            }
            // add titles into the abbrevations.
            $(".visible-xs-inline").each(function() {
                $(this).attr("title", turengAbbrv[$(this).html()]);
            });
            // re-organize all results for panel application.
            $(".searchResultsTable td a[href^='/search/']").attr({href: "javascript:;", target: null}).each(function(index) {
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
        }
    });
}

function yandexTranslate(word) {
    word = word.replace(/\s/g, "+");
    var detectUrl = "https://translate.yandex.net/api/v1.5/tr.json/detect?key=" + yandexApiKey + "&text=" + word;
    var translateUrl = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + yandexApiKey;
    $.get(detectUrl, function (data) {
        console.log("yandex-detect error code: ", data.code);
        console.log("yandex detect result: ", data.lang);
        if (data.lang == "en") {
            translateUrl = translateUrl + "&lang=en-tr&text=" + word;
        } else {
            translateUrl = translateUrl + "&lang=tr-en&text=" + word;
        }
        $.get(translateUrl, function (data) {
            console.log("yandex-translate error code: ", data.code);
            console.log("yandex translate result: ", data.text.join(" "));
        }, "json");
    }, "json");
}

// get only search results container.
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

    //yandexTranslate(word);
    navHistory.add(word);
    loadTurengSearchResults("http://tureng.com/search/" + word.replace(/\s/g, "%20"));
    $("#searchWord").val(word.toLowerCase());
    $("#searchWord").attr("title", $("#searchWord").val());
    $("#searchWord").focus();
    $("#mainPageBottom").show();
}

var navHistory = {
    backArr: [],
    forwardArr: [],
    navigating: false,
    add: function(word) {
        if (!this.navigating) { this.backArr.push(word); }
        if (this.backArr.length > 10) { this.backArr.shift(); }
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
        turengTranslate(word);
    },
    prev: function() {
        if (!this.backArr.length) { return; }
        if (this.forwardArr.length == 0) { this.cssForward(true); }
        this.navigating = true;
        var toForward = this.backArr.pop();
        this.forwardArr.push(toForward);
        turengTranslate(this.backArr[this.backArr.length - 1]);
    },
    cssBack: function(active) {
        if (active) {
            $(".navigationBack").css({"cursor": "default", "-webkit-filter": "grayscale(0.1)"});
            $(".navigationBack").attr("title", lang("app.backward"));
        } else {
            $(".navigationBack").css({"cursor": "default", "-webkit-filter": "grayscale(1)"});
            $(".navigationBack").attr("title", null);
        }
    },
    cssForward: function(active) {
        if (active) {
            $(".navigationForward").css({"cursor": "default", "-webkit-filter": "grayscale(0.1)"});
            $(".navigationForward").attr("title", lang("app.forward"));
        } else {
            $(".navigationForward").css({"cursor": "default", "-webkit-filter": "grayscale(1)"});
            $(".navigationForward").attr("title", null);
        }
    }
};

function openMore() {
    var tabs = rt.create("mx.browser.tabs");
    var newUrl = urls[$(".activeContent").attr("id")];
    var word = $("#searchWord").val();

    if (word) {
        var queryWord = encodeURIComponent(word); //word.replace(/\s/g, "%20");
        newUrl = newUrl + queryWord;
    }

    tabs.newTab({ url: newUrl });
}

function clearSelection() {
    if (document.selection) {
        document.selection.empty();
    } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}
