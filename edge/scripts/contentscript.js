"use strict";

(function () {
    var tId = setInterval(function () { if (document.readyState == "complete") ready() }, 1000);
    var chrome = browser;
    var lang = chrome.i18n.getMessage;
    var doubleClickEnabled = false;
    var mouseSelectEnabled = false;
    var iconInterval = 0;
    var iconViewed = false;
    var iconHovered = false;
    var Gestures = {Left: "left", Right: "right", Middle: "middle"};
    var mouseEvt = { x: 0, y: 0, grab: false, sel: "", occured: false, gesture: Gestures.Right };
    var maxSelection = 2048;
    var documentOndblclick, documentOnmousemove, documentOnmousedown, documentOnmouseup;

    console.log(lang("app_title"));

    function post(name, obj) {
        var msg = {};
        msg[name] = obj;
        chrome.runtime.sendMessage(msg, function (response) {
            //console.log(response.farewell);
        });
    }

    function ready() {
        clearInterval(tId);
        documentOndblclick = document.ondblclick;
        documentOnmousemove = document.onmousemove;
        documentOnmousedown = document.onmousedown;
        documentOnmouseup = document.onmouseup;

        post("retrieveMessage", "I'm in!");
        chrome.storage.local.get(null, function(result) {
            doubleClickEnabled = result["doubleClicked"];
            mouseSelectEnabled = result["mouseSelected"];
        });
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            //console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
            if (request.hasOwnProperty("getSettings")) {
                getSettings(request["getSettings"]);
            }
        });
    };

    function getSettings(obj) {
        doubleClickEnabled = obj["dblClick"];
        mouseSelectEnabled = obj["mouseSelect"];
        
        document.ondblclick = doubleClickEnabled ? doubleClicked : documentOndblclick;
        document.onmousemove = mouseSelectEnabled ? mouseMoving : documentOnmousemove;
        document.onmousedown = mouseSelectEnabled ? mouseDown : documentOnmousedown;
        document.onmouseup = mouseSelectEnabled ? mouseSelected : documentOnmouseup;
    };

    var samples = [];
    var maxSamples = 10;
    function mouseMoving(evt) {
        if (mouseEvt["grab"]) {
            //console.log("X: ", evt.pageX, ", Y: ", evt.pageY);
            mouseEvt["x"] = evt.pageX;
            mouseEvt["y"] = evt.pageY;
            var deltaX = 0;
            if (samples.length) {
                deltaX = samples.length ? (mouseEvt["x"] - samples[samples.length - 1].x) : 0;
            }
            samples.push({"x": mouseEvt["x"], "deltaX": deltaX});
        }

        if (samples.length >= maxSamples) {            
            mouseEvt["occured"] = true;
        }
    };

    function mouseSelected() {
        if (!mouseEvt["occured"]) {
            if (mouseEvt["grab"]) { mouseEvt["grab"] = false; }
            return;
        } else {
            grabGesture();
            samples = [];
            mouseEvt["grab"] = false;
            mouseEvt["occured"] = false;
        }

        var sel = getSelected();
        if (sel == "") { return; }

        if (!mouseSelectEnabled) {
            return;
        }

        addIcon();
        mouseEvt["sel"] = sel;
        showIcon();
    };

    function mouseDown() {
        mouseEvt["grab"] = true;
        if (iconViewed && !iconHovered) { hideIcon(); }
    };

    function doubleClicked() {
        var sel = getSelected();
        if (sel == "") { return; }

        if (!doubleClickEnabled) {
            return;
        }

        post("translate", sel);
    };

    function grabGesture() {
        // get last five delta x replacements.
        var deltas = 0;
        for (var i = samples.length - maxSamples; i < samples.length; i++) {
            //console.log("deltaX: ", samples[i].deltaX);
            if (samples[i].deltaX > 0) {
                deltas = deltas + samples[i].deltaX;
            } else if (samples[i].deltaX < 0) {
                deltas = deltas + samples[i].deltaX;
            }
        }

        var deltaX = samples[samples.length - 1].x - samples[0].x;
        if (deltas > 0 && deltaX > 0) {
            mouseEvt["gesture"] = Gestures.Right;
        } else if (deltas < 0 && deltaX < 0) {
            mouseEvt["gesture"] = Gestures.Left;
        } else if ((deltas < 0 && deltaX > 0) || (deltas > 0 && deltaX < 0)) {
            mouseEvt["gesture"] = Gestures.Middle;
        }
    };

    function getSelected() {
        var s = "";
        if (typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var container = document.createElement("div");
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }

                s = container.innerHTML;
            }
        } else if (typeof document.selection != "undefined") {
            if (document.selection.type == "Text") {
                s = document.selection.createRange().htmlText;
            }
        }

        //console.log("selected: ", s);
        // check and remove undesired chars.
        s = s.replace(/<\/?[^>]+(>|$)/g, ""); // remove html tags.
        if (s.match(/[#$%*+=^{}<>~]/g)) { return ""; }
        if (s.length > maxSelection) { return ""; }
        s = s.replace(/&\w+;/g, ""); // remove html codes like &nbsp;
        s = s.replace(/[0-9"`\/\(\)\[\]|&?!:;.,_-]/g, " "); // convert some chars to whitespace.
        s = s.replace(/^\s+|\s+$/g, ""); // trim whitespaces.
        s = s.replace(/\s{2,128}/g, " "); // replace 2 or more white spaces into the one.

        return s;
    };

    function addIcon() {
        var turengIcon = document.getElementById("turengWebIcon");
        if (turengIcon) {
            return;
        }
        
        //addOverlay();
        addStyle("@namespace url(http://www.w3.org/1999/xhtml); #turengWebIcon {box-sizing: border-box; display: inline-block;" +
        " height: 32px; width: 32px; margin: 0; border: 1px solid #999; padding: 0; position: absolute; text-align: left;" +
        " z-index: 9999; background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFRElEQVRYha2XT4wcRxXGf6+quntmdma9DgaDiYxIkJ0QAlFQFC4RyZETyhEJn5AQ4hKJQxAHooCUO0LiwJFDLnBE/LkAUoQsIUAcjA84B6NECYkjx2ZnZ2e6u+o9DtU907te28mEJ5XUM13V31f1/n0lq0u7xn3NwAyQPKQbyGCKDubZne/vYuH+wN13XAHOgwvgHIgbAFgmoAqa8rCY/7sPkXsQUDDJgL6EUHTgfkBgyFXzSB2B1EJsQNv8rePz70nALC8IFRQV+CIP5/MQd4ILDCyB7wl0a2Kdh6UTSdxJwDSDhHEHXoIPJxA47oLeDSmDpRaS36xpl6DxDhLhDnDxmB8z2h3BOIAUHYn+FEIeJ8WAJUgxH3t0oAIRmrlDTZC4zO8GJDYE+mMvxhSzEW/emvHP125TuQXIwO/iWWfC8RMYElGljUo1KXnqyRmjHYiHBo0ecUdYfwDAV7iywheBP/91CV97kQtPX9wQXAMN1hyxATGBmBzh7Stw9SfYdJRdagmaVbdh6QgY2c9FhRQFcSmkNvH1l7/LbHpy9H5gi5+j+dYrtDrDeSB0bkoNIIRcNFj72XyJn1ZIvMm1n7/KxWe//EHqyYmmCu7aZabLFtuD2o8QjRDKHJBmyOqbM8N5qKZQTqAYUY09f7nxcX67fIC9ieJUt9t8NELleOZLuzx+8zq89w5KgmYJ9QGktnOBGxaZQJo3fPHzY4pv/xALk60JAJgvuFKWpF/8mKeuX6PePbWpqKkl5OMf5KvztOMdyrfe5cnVHpw5tzX4xlreGY/y0YvbEBBHWBeVdZrlVDNxsP3Gj5gDpAdeE3AdAXrQLoWcEObK/t6DXNOIO9jf3gUGBMfVnZqLbQS1DljWmDkGRHqeWBPwD0eKh9+A11+AZoVtSUAKRdNpHrtxgUeuv0HcPcW6vQoDAj1dFZCIXrjN7NkX+MriHJvisoU5hb9dht//Ev3kOZrRBFktjkwJR6qbGlIuEQ0wvQTTne2AB5amU9rRr5EqIM2SfAKdzjAbEDiuaP5v1tX+Xi/YAM+MsO7jpuAUayos/Rf0V+Ae/4hkDP+xK/gHTrFqs2KSXjmZAtoR6GWUj0CFu/Eprv/sR/zptX8zCduHgAQ4XMETp5/hibOe5jBhvV7Q3DFzEKaYpVRISNmg/zJWt87z/kPfoRmXOIEP3xAMTHh3fsgf//AqP/1qyd7YUdexw2uBvh13CkZSgdeWen6bRz/7CR596fvbbf2Y/eAbV/jH1d/x3NPncdaiKeZmBAREclCkGlLB4rBgsYBb7y05a3S7394iMD9Y0MZAezuRYsRrjXZ6QFaXdg0zvDPmOmM/zjiz4/n7vOI38TPMSo8Mg0DIavnI7/7ZBjGbH24e1Pj/vM73vlAQYktsl5wu93EoxpFKaEhsILUctJ4Hy5rnb13Ge7/RgS7kyFqL0oGt0yx1vT772lT59GNnKFAWTaTUJs9xAjbQhMkck6LGuX0WrTLxFY+cP4u5AnxAnM+qSXxuLGtp3u22yybrItxSF2waSbGlqWum7pCd8hDvBO1O8ZgsFyZhxUgSrezQWkS1RK1AxWPRY3gQwYYl2gAUMUNQxBJiEWcRrw2lNOwUCwpqDEHtJFWcnUAyj1ikcnMq10KoUFdiLmDiMQm5VSMb1/erbQMuGhFtkVhDXGGWSAyl/AkENkQcKSmkFfiEhBbxJeJ9doXzgwsqR8qraS86IxrrnO/2Ya9m0C3I6WnagmvABay/nB7vkn0Q9gQ0dvpf7gp+bwKZxTpD8lWrHYiXu1zNhs3sHsC9/Q/jVLcrMWVTsQAAAABJRU5ErkJggg==') center no-repeat !important; cursor: pointer;}");

        var turengIcon = document.createElement("div");
        turengIcon.id = "turengWebIcon";
        turengIcon.title = lang("app_turengclick");
        turengIcon.style.left = "50%";
        turengIcon.style.top = "5%";
        turengIcon.style.display = "none";
        document.body.appendChild(turengIcon);
        turengIcon.addEventListener("click", function () {
            post("translate", mouseEvt["sel"]);
            hideIcon();
            //fadeEffect.init("turengWebIcon", 1); // fade out the "fade" element
        }, false);
        turengIcon.addEventListener("mouseover", function() {
            // reset interval
            iconHovered = true;
            clearInterval(iconInterval);
        });
        turengIcon.addEventListener("mouseout", function() {
            iconHovered = false;
            iconInterval = setInterval(hideIcon, 2000);
        });
    };

    function addOverlay() {
        if (parent.document.getElementById("unVisibleOverlay")) {
            return;
        }

        addStyle("@namespace url(http://www.w3.org/1999/xhtml); .unVisibleWebOverlay {position: fixed; top: 0; right: 0; bottom: 0;" +
        " left: 0; height: 100%; width: 100%; margin: 0; padding: 0; background: #000000; opacity: .15; filter: alpha(opacity=15);" +
		" -moz-opacity: .15; z-index: 101; display: none;}");

        var str = '<div id="unVisibleOverlay" class="unVisibleWebOverlay" style="display: none;"></div>';
        var newDiv = parent.document.createElement("div");
        newDiv.innerHTML = str;
        parent.document.body.appendChild(newDiv);
    };

    function addStyle(css) {
        if (typeof GM_addStyle != "undefined") {
            GM_addStyle(css);
        } else {
            var heads = document.getElementsByTagName("head");
            if (heads.length > 0) {
                var node = document.createElement("style");
                node.type = "text/css";
                node.innerHTML = css;
                heads[0].appendChild(node);
            }
        }
    };

    function showIcon() {
        var x = 2;
        var y = mouseEvt["y"] - 28;
        if (mouseEvt["gesture"] == Gestures.Right) {
            x = mouseEvt["x"] + 4;
        } else if (mouseEvt["gesture"] == Gestures.Left) {
            x = mouseEvt["x"] - (4 + 22);
        } else {
            x = mouseEvt["x"] - 9;
        }
        // check overflows for current web page's window.
        x = Math.max(2, Math.min(x, window.innerWidth - 24));
        y = Math.max(y, document.body.scrollTop + 2);
        
        var turengIcon = document.getElementById("turengWebIcon");
        turengIcon.style.left = x + "px";
        turengIcon.style.top = y + "px";
        turengIcon.style.display = "block";
        iconViewed = true;
        iconInterval = setInterval(hideIcon, 2000);
    };

    function hideIcon() {
        var turengIcon = document.getElementById("turengWebIcon");
        turengIcon.style.display = "none";
        iconViewed = false;
        clearInterval(iconInterval);
    };

    function showDialog(sel) {
        var overlay = document.getElementById("unVisibleOverlay");
        //var dialog = document.getElementById("tureng_web_dialog");

        //$("#overlay").show();
        overlay.style["display"] = "block";
        //$("#dialog").fadeIn(300);
        //fadeEffect.init("tureng_web_dialog", 1, 50); // fade in the "fade" element to 50% transparency

        //$("#overlay").click(function (e) {
        //hideDialog();
        //});

        overlay.onclick = function () {
            hideDialog();
        }
    };

    function hideDialog() {
        //$("#overlay").hide();
        document.getElementById("unVisibleOverlay").style["display"] = "none";
        //$("#dialog").fadeOut(300);
        fadeEffect.init("tureng_web_dialog", 1); // fade out the "fade" element
    };

    // http://www.scriptiny.com/2011/01/javascript-fade-in-out/
    var fadeEffect = function () {
        return {
            init: function (id, flag, target) {
                this.elem = document.getElementById(id);
                this.elem.style["display"] = "block"; // added.
                clearInterval(this.elem.si);
                this.target = target ? target : flag ? 100 : 0;
                this.flag = flag || -1;
                this.alpha = this.elem.style.opacity ? parseFloat(this.elem.style.opacity) * 100 : 0;
                this.elem.si = setInterval(function () { fadeEffect.tween() }, 20);
            },
            tween: function () {
                if (this.alpha == this.target) {
                    clearInterval(this.elem.si);
                    this.elem.style["display"] = "none"; // added.
                } else {
                    var value = Math.round(this.alpha + ((this.target - this.alpha) * .05)) + (1 * this.flag);
                    this.elem.style.opacity = value / 100;
                    this.elem.style.filter = 'alpha(opacity=' + value + ')';
                    this.alpha = value
                }
            }
        }
    } ();

})();
