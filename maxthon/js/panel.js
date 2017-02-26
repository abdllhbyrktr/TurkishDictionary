var dblclicked = false;
var mouseSelected = false;
var highlighted = false;
var tabClicked = false;
var highlightedText = "";
var $hoveredSpan;
var handleTimeout = 8000;
var maxNavigationHistory = 10;
var yandexApiKey = "trnsl.1.1.20150328T004518Z.482e8153ea2baa64.d0a5debb3b13637b9c6cd2b12a9398efb62fbd9b";

ExtensionCore.addAppListener(ExtensionCore.AppEvents.appShow, function () {
    //updateSwapLangs();
    //updateTabs();
});

ExtensionCore.addAppListener(ExtensionCore.AppEvents.appHide, function () {
    $('#imageResultModal').modal('hide');
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

ExtensionCore.listen("translateWithGoogle", function (searchKey) {
    GoogleTranslate.translate(searchKey, function (data) {
        ExtensionCore.post("sendTranslateResults", data);
    });
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

        $('#imageResultModal').modal('hide');
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

function playAudio() {
    var audioSource = getAudioSourceUrl(panelTab.getCurrentTab());
    if (audioSource) {
        var audio = new Audio(audioSource);
        audio.play();
    }
    
    $(".navigationSound").button('reset');
}

function displayImageResult(clicked) {
    if (!clicked && userConfig.lastImageSearchTerm == userConfig.lastSearchTerm) {
        return;
    }

    // load image from google images.
    var url = 'https://www.google.com/search?q=' + userConfig.lastSearchTerm + '&tbm=isch';
    var $modalImgDiv = $('#imageResultModal .modal-body div:first');
    getHtmlData(url, $modalImgDiv, function (data) {
        var firstMetaData = $(data).find('#rg_s > div:nth-child(1) > .rg_meta');
        if (firstMetaData.length) {
            var src = '';
            var firstMetaObj = JSON.parse(firstMetaData.text());
            if (firstMetaObj.hasOwnProperty('tu')) {
                src = firstMetaObj.tu;
            } else if (firstMetaObj.hasOwnProperty('ou')) {
                src = firstMetaObj.ou;
            }

            if (src.length) {
                $('#imageResultModal .modal-title').html(userConfig.lastSearchTerm.substring(0, 32));
                $modalImgDiv.html('<img src="' + src + '" alt="">');
                $('#imageResultModal').modal({ keyboard: false });
            }

            userConfig.lastImageSearchTerm = userConfig.lastSearchTerm;
            $(".navigationImageResult").button('reset');
        }
    });

    setTimeout(function() {
        $(".navigationImageResult").button('reset');
    }, 3000);
}

EventBus.on('ContainerLoaded', function () {
    if (userConfig.autoPlayAudio) {
        playAudio();
    }

    if (userConfig.autoDisplayImage) {
        displayImageResult(false);
    }
});

$(document).ready(function () {
    localizeHtml();
    // prevent right click on panel.
    //$(document).bind("contextmenu", function (e) { return false; });

    $("a[data-toggle='tab']").on("click", function (e) {
        tabClicked = true;
    });

    $("a[data-toggle='tab']").on("shown.bs.tab", function (e) {
        e.target // newly activated tab
        e.relatedTarget // previous active tab
        var tabId = $(e.target).attr("aria-controls");
        // set current tab index
        panelTab.setCurrentTab(tabId);
        // translate if clicked.
        if (tabClicked) {
            tabClicked = false;
            panelTab.translate(userConfig.lastSearchTerm);
        }
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
        $(this).button('loading');
        playAudio();
    });

    $(".navigationImageResult").click(function () {
        $(this).button('loading');
        displayImageResult(true);
    });

    sendSettings();
    //panelTab.translate(userConfig.lastSearchTerm);
    GoogleTranslate.init();
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

function loadDictCnSearchResults(data) {
    var $data = $(data);
    var $word = $data.find('.word');
    if ($word.length > 0) {
        // set the first audio source url.
        DictCn.defaultAudioUrl = 'http://audio.dict.cn/' + $word.find('.sound:first').attr('naudio');

        $word.find('.sound').remove();
        $word.find('.word-cont a').remove();
        $word.find('.wordbook').remove();
        $word.find('.level-title').remove();
        $word.find('.basic ul li:last').remove();
        $word.find('.dict-basic-ul li:last').remove();
        $word.find('.shape').remove();
        $word.find('.dict-chart').remove();
        $word.find("a").attr({ href: "javascript:;", target: null });
        $(DictCn.divContainer).html($word[0].outerHTML);
        EventBus.trigger('ContainerLoaded');
    } else {
        $(DictCn.divContainer).html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
    }
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
        EventBus.trigger('ContainerLoaded');
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
        EventBus.trigger('ContainerLoaded');
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
        EventBus.trigger('ContainerLoaded');
    } else {
        $(TdkSozluk.divContainer).html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
    }
}

function loadDictionaryReferenceSearchResults(data) {
    var $data = $(data);
    var $defList = $data.find(".def-list");
    if ($defList.length) {
        // set the first audio source url.
        DictionaryReference.defaultAudioUrl = $data.find('.source-box .audio-wrapper audio source:first').attr('src');
        $(".source-data").html($defList[0].outerHTML);
        // remove somethings for clean result.
        $('.source-data .def-pbk').each(function () {
            $(this).find('.def-set').slice(5).remove();
        });
        $('.source-data .def-number').remove();
        $('.source-data .luna-data-header').children(':not(.dbox-pg)').remove();
        // re-organize links.
        $('.source-data .def-content').each(function () {
            if ($(this).find('div').length <= 0) {
                $(this).html($(this).text());
            }

            // replace text content to a span
            var html = $(this).html();
            $(this).contents().filter(function () {
                return this.nodeType == Node.TEXT_NODE;
            }).each(function () {
                if (this.textContent && this.textContent.getOnlyWord() != '') {
                    html = html.replace(this.textContent, '<span class="replaced">' + this.textContent + '</span>');
                }
            });

            $(this).html(html);
            $(this).find('.replaced').each(function() {
                addHighlights($(this), false);
            });
            
            $(this).find('div span').each(function() {
                addHighlights($(this), false);
            });
            
            $(this).children('span:not(.replaced)').each(function() {
                addHighlights($(this), false);
            });
        });
        $(".source-data .def-content").find("a").attr({ href: "javascript:;", target: null }).each(reOrganizeLinks);
        EventBus.trigger('ContainerLoaded');
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
        EventBus.trigger('ContainerLoaded');
    } else {
        $tables = $data.find("#article");
        if ($tables.length) {
            $("#articleWRD").html($tables[0].outerHTML);
            $("#articleWRD").find(".small1").remove();
            $("#articleWRD a").attr({ href: "javascript:;", target: null }).each(reOrganizeLinks);
            EventBus.trigger('ContainerLoaded');
        } else {
            $("#articleWRD").html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
        }
    }
}

function addHighlights($elem, fireEvent) {
    var arr = $elem.text().trim().split(' ');
    if (arr.length > 1) {
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].replace('/', '</span>/<span class="click-available">');
        }

        var newText = arr.join('</span> <span class="click-available">');
        newText = '<span class="click-available">' + newText + "</span>";
        newText = newText.replace('<span class="click-available">(', '(<span class="click-available">');
        newText = newText.replace(')</span>', '</span>)');
        $elem.html(newText);
        
        if (!fireEvent) {
            $elem.find(".click-available").on("click", function(e) {
                panelTab.translate($(this).text().getOnlyWord());
            });
            return;
        }

        $elem.find("span").each(function (index) {
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

function reOrganizeLinks(item) {
    var text = $(this).text();

    if (/\([^)]*\)/g.test(text)) {
        return;
    }

    $(this).on("click", function(e) {
        panelTab.translate(text.getOnlyWord());
    });

    // add highlights if this is a sentence.
    addHighlights($(this), true);
}

function loadTurengSearchResults(data) {
    var $data = $(data);
    var $tables = $data.find(".searchResultsTable");

    if ($tables.length > 0) {
        // remove un-desired tr-columns.
        $tables.find(".visible-xs").each(function (index) {
            $($(this)[0].nextElementSibling).remove();
            $(this).remove();
        });
        // set the first audio source url.
        Tureng.defaultAudioUrl = $data.find('.tureng-voice:first source').attr('src');
        // add results.
        var results = 5;
        $("#searchPage").empty();
        for (var i = 0; i < $tables.length; i++) {
            $("#searchPage").append($tables[i].outerHTML);
            $(".searchResultsTable:eq(" + i + ")").find("tr").slice(results).remove();
        }
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
        // add titles into the abbrevations.
        $(".visible-xs-inline").each(function() {
            $(this).attr("title", Tureng.abbrv[$(this).html()]);
        });
        // re-organize all results for panel application.
        $(".searchResultsTable td a").attr({href: "javascript:;", target: null}).each(reOrganizeLinks);
        EventBus.trigger('ContainerLoaded');
    } else {
        $("#searchPage").html("<h1>" + ExtensionCore.i18n("app.notFound") + "</h1>");
    }
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

var GoogleTranslate = (function () {

    var tkk;

    function complete(a){var gf=function(a){return function(){return a}},hf=function(a,b){for(var c=0;c<b.length-2;c+=3){var d=b.charAt(c+2),d="a"<=d?d.charCodeAt(0)-87:Number(d),d="+"==b.charAt(c+1)?a>>>d:a<<d;a="+"==b.charAt(c)?a+d&4294967295:a^d}return a},jf=tkk,b=null;if(null!==jf)b=jf;else{b=gf(String.fromCharCode(84));var c=gf(String.fromCharCode(75));b=[b(),b()];b[1]=c();b=(jf=window[b.join(c())]||"")||""}var d=gf(String.fromCharCode(116)),c=gf(String.fromCharCode(107)),d=[d(),d()];d[1]=c();c="&"+d.join("")+"=";d=b.split(".");b=Number(d[0])||0;for(var e=[],f=0,g=0;g<a.length;g++){var k=a.charCodeAt(g);128>k?e[f++]=k:(2048>k?e[f++]=k>>6|192:(55296==(k&64512)&&g+1<a.length&&56320==(a.charCodeAt(g+1)&64512)?(k=65536+((k&1023)<<10)+(a.charCodeAt(++g)&1023),e[f++]=k>>18|240,e[f++]=k>>12&63|128):e[f++]=k>>12|224,e[f++]=k>>6&63|128),e[f++]=k&63|128)}a=b;for(f=0;f<e.length;f++)a+=e[f],a=hf(a,"+-a^+6");a=hf(a,"+-3^+b+-f");a^=Number(d[1])||0;0>a&&(a=(a&2147483647)+2147483648);a%=1E6;return c+(a.toString()+"."+(a^b))}

    function between(str, start, end) {
        var _start = str.indexOf(start);

        if(_start === -1) {
            return false;
        }

        _start = _start + start.length;

        var _end = str.slice(_start).indexOf(end);

        if(_end === -1) {
            return false;
        }

        return str.slice(_start, _start + _end);
    }
    
    function getTKK(callback) {
        $.get({
            url: 'https://translate.google.com/m/translate'
        }, function(data, status, xhr) {
            if (status !== 'success') {
                console.error('#getTKK error', status);
                return callback(false);
            }

            if (xhr.status != 200) {
                console.warn('#getTKK status code != 200', xhr);
                return callback(false);
            }

            var tkkFuncStr = between(data, "tkk:'", "',")
                .replace(/\\x3d/g, '=')
                .replace(/\\x27/g, "'");

            // global
            tkk = eval(tkkFuncStr);

            return callback(true)
        });
    }

    function handleData(res) {
        var data = {};

        data.from = res.src;
        data.translit = res.sentences[1] && res.sentences[1].src_translit;
        data.spell = res.spell && res.spell.spell_res;

        if (res.dict) {
            data.dict = res.dict.map(function(dict) {
                dict.terms = dict.terms.join(', ');
                return dict;
            });
        }

        if (res.sentences) {
            data.sentence = res.sentences.map(function(sentence) {
                return sentence.trans;
            }).join('').split('\n');
        }

        return data;
    }

    function getAudioUrl(text, src) {
        if (text.length > 100) {
            return false;
        }

        var query = {
            ie: 'UTF-8',
            client: 'webapp',
            q: text,
            tl: src
        };

        return 'https://translate.google.com/translate_tts?' + $.param(query) + complete(text);
    }

    function translate(word, callback) {
        var query = {
            client: 'webapp',
            sl: userConfig.fromLang,
            tl: userConfig.toLang,
            hl: userConfig.toLang,
            dj: 1,
            ie: 'UTF-8',
            oe: 'UTF-8',
            q: word
        };

        query = $.param(query);
        query = '?' + query + '&dt=bd&dt=ld&dt=qc&dt=rm&dt=t';
        query += complete(word);
        var translateUrl = 'https://translate.google.com/translate_a/single' + query;

        $.get(translateUrl, function (body, status, xhr) {
            data = handleData(body);
            data.audio = getAudioUrl(word, body.src);
            data.to = userConfig.toLang;
            data.src = 'google';
            data.from_word = word;

            //from word = to word
            if (word !== word.toLowerCase() && data.sentence) {
                if (data.sentence[0] === word) {
                    return translate(word.toLowerCase(), callback);
                }
            }

            return callback(data);
        }, "json");
    }

    function init() {
        getTKK(function (ok) {
            console.log('Google Translate token got.')
        });
    }

    return {
        translate: translate,
        init: init
    };

})();

NotSupported.loadFunc = function(data) {}
Tureng.loadFunc = loadTurengSearchResults;
Wordreference.loadFunc = loadWordReferenceSearchResults;
DictionaryReference.loadFunc = loadDictionaryReferenceSearchResults;
TdkSozluk.loadFunc = loadTdkSearchResults;
Abbyy.loadFunc = loadAbbyySearchResults;
SozlukNet.loadFunc = loadSozluknetSearchResults;
DictCn.loadFunc = loadDictCnSearchResults;
