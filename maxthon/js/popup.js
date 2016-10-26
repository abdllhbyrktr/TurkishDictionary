// ==UserScript==
// @author         	hd49
// @version         1.0.0
// @name 			Dictionary Popup.
// @description		popup dialog for dictionary.
// @include 		*
// @exclude     	about:*
// @grant       	none
// ==/UserScript==

(function () {
    var tId = setInterval(function () { if (document.readyState == "complete") ready() }, 1000);
    var rt = window.external.mxGetRuntime();
    var browser = rt.create("mx.browser");
    var lang = rt.locale.t;
    var doubleClickEnabled = false;
    var mouseSelectEnabled = false;
    var iconInterval = 0;
    var iconViewed = false;
    var iconHovered = false;
    var Gestures = {Left: "left", Right: "right", Middle: "middle"};
    var mouseEvt = { x: 0, y: 0, grab: false, sel: "", occured: false, gesture: Gestures.Right };
    var maxSelection = 2048;
    var documentOndblclick, documentOnmousemove, documentOnmousedown, documentOnmouseup;

    console.log(lang("app.title"));

    function ready() {
        clearInterval(tId);
        documentOndblclick = document.ondblclick;
        documentOnmousemove = document.onmousemove;
        documentOnmousedown = document.onmousedown;
        documentOnmouseup = document.onmouseup;
        // check panel application.
        var panelApp = rt.getActionByName("dict-panel");
        if (panelApp.state != "running") {
            //panelApp.activate();
            //panelApp.hide();
        }

        //rt.listen("results", addResults);
        rt.listen("getSettings", getSettings);
        rt.post("retrieveMessage", "I'm in!");
    };

    function addResults(results) {
        console.log("Result: ", results);
        document.getElementById("tureng_web_dialog").innerHTML = results;
    };

    function getSettings(obj) {
        doubleClickEnabled = obj["dblClick"];
        mouseSelectEnabled = obj["mouseSelect"];
        
        document.ondblclick = doubleClickEnabled ? doubleClicked : documentOndblclick;
        document.onmousemove = mouseSelectEnabled ? mouseMoving : documentOnmousemove;
        document.onmousedown = mouseSelectEnabled ? mouseDown : documentOnmousedown;
        document.onmouseup = mouseSelectEnabled ? mouseSelected : documentOnmouseup;
    };

    var panelIsStopped = function() {
        var app = rt.getActionByName("dict-panel");

        if (!app || app.state == "stopped") {
            return true;
        }

        return false;
    };

    var panelIsActive = function () {
        var app = rt.getActionByName("dict-panel");

        if (!app) {
            return false;
        }

        if (app.state == "active") {
            return true;
        }

        return false;
    };

    var samples = [];
    var maxSamples = 10;
    function mouseMoving(evt) {
        if (mouseEvt.grab) {
            //console.log("X: ", evt.pageX, ", Y: ", evt.pageY);
            mouseEvt.x = evt.pageX;
            mouseEvt.y = evt.pageY;
            var deltaX = 0;
            if (samples.length) {
                deltaX = samples.length ? (mouseEvt.x - samples[samples.length - 1].x) : 0;
            }
            samples.push({"x": mouseEvt.x, "deltaX": deltaX});
        }

        if (samples.length >= maxSamples) {            
            mouseEvt.occured = true;
        }
    };

    function mouseSelected() {
        if (!mouseEvt.occured) {
            if (mouseEvt.grab) { mouseEvt.grab = false; }
            return;
        } else {
            grabGesture();
            samples = [];
            mouseEvt.grab = false;
            mouseEvt.occured = false;
        }

        var sel = getSelected();
        if (sel == "") { return; }

        if (!mouseSelectEnabled || panelIsStopped()) {
            rt.post("showBadge", sel);
            return;
        }

        addIcon();
        mouseEvt.sel = sel;
        showIcon();
    };

    function mouseDown() {
        mouseEvt.grab = true;
        if (iconViewed && !iconHovered) { hideIcon(); }
    };

    function doubleClicked() {
        var sel = getSelected();
        if (sel == "") { return; }

        if (!doubleClickEnabled || panelIsStopped()) {
            rt.post("showBadge", sel);
            return;
        }

        //addOverlay();
        rt.post("translate", sel);
        var app = rt.getActionByName("dict-panel");
        panelIsActive() || app.activate();
        //showDialog(sel);
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
            mouseEvt.gesture = Gestures.Right;
        } else if (deltas < 0 && deltaX < 0) {
            mouseEvt.gesture = Gestures.Left;
        } else if ((deltas < 0 && deltaX > 0) || (deltas > 0 && deltaX < 0)) {
            mouseEvt.gesture = Gestures.Middle;
        }
        //console.log("gesture: ", mouseEvt.gesture);
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
        " height: 20px; width: 20px; margin: 0; border: 1px solid #999; padding: 0; position: absolute; text-align: left;" +
        " z-index: 9999; background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAADJklEQVQ4jYWUPW9cRRSGnzMzd+9d5+6uPwhEGIqAhEyiCKEUloiEjRAFBRI9pKCgh4aWhoaGv0CBFBQhOkQXgYAyIUSIQIMiQYJDzOK1d7P3a2YOxV7H68g4RxppPjTPvGfmzCvlxb5yKBS0bcaCOBAzNx8gBhBAhFnnINxhVmxBHUi74Dpgk3Zje5j34GtophDq2ZqYI4AtLO3lsNCHpAu206o0rZIIwUNowBfEyR71ZIIQH0BnQFWISrK0wnhaMdm6g8lOIC4Fk4DYg0NjA77CV/fp9gfkg5PEve3Zmhjc7G4inUHOv6OG7+LrLK+fIzUBja36uYz3x4V3nBpf5fnxtzRZjhZjEMWhEWwH6fW598uf5JsvsfHBu9DM7v/IMBATsJc/hMuXiM+eReoKQo2Ub+VK1qczWKSoLV/KOrJ2loVmjOqcpPkqQKiDo8eQzeJHFrbu0DRTKEY4jIEkpQoJ3TDmjXdeYefMa7hQPVwRh0XGyNbgKa5+/Qkvf/4x9BehtDiMBWuRNKH+O9LdWyE7cfI41n7WNMAwdUSxYB2YBIfMykIqS7K2zM3sK4Y3b5AV9+fq7wigi+zFJ3nu19+wvWWCAFb2X9kQyyG6cY6182+iwxKWjpEngnYEufQZ7to1qtUnYHcboH3loOB3weXY7FVYfUS++3H6D6rr36PeIy3HESNQYZJTcPc21794m/EwkCb+OIl4cXRv/c6Ly8/gw5QYA6jHEQP4BtdXzDe3uddfZXtwhtx49H9xirqUn4dLFDtXuHDaUTUlBI9DFGmmVBPH9K8h6x+9R+eF84/M1gD+yg1+ev9TLjz2OOJLVBSpLvbUENnxK9Qm54dmhT2b03WCGgsYZO7vKRGJkaCR0WiXzWyHp5OSrvkHZxWnCIqQsUuUhA29BWVAky64FBGHmtaeYgT1EGpiXZD3HJpmhGKEdYqqmblNxNBNPJnehcESIV0kmJTYOo3OKRQNmNhgYwepxlBuYdNAVIcy54dBLULEVDu4MMV1ZgoxDg4pDNCU0BTgKyJC0ANbPeTYiiGgUFfQ1DP7t3MGq63Banjgfw//pv8APXd3NgYsQvcAAAAASUVORK5CYII=') center no-repeat !important; cursor: pointer;}");

        var turengIcon = document.createElement("div");
        turengIcon.id = "turengWebIcon";
        turengIcon.title = lang("app.turengclick");
        turengIcon.style.left = "50%";
        turengIcon.style.top = "5%";
        turengIcon.style.display = "none";
        document.body.appendChild(turengIcon);
        turengIcon.addEventListener("click", function () {
            rt.post("translate", mouseEvt.sel);
            var app = rt.getActionByName("dict-panel");
            panelIsActive() || app.activate();
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
        var y = mouseEvt.y - 28;
        if (mouseEvt.gesture == Gestures.Right) {
            x = mouseEvt.x + 4;
        } else if (mouseEvt.gesture == Gestures.Left) {
            x = mouseEvt.x - (4 + 22);
        } else {
            x = mouseEvt.x - 9;
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

})()


