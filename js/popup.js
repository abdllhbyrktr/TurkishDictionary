// ==UserScript==
// @author         	hd49
// @version         1.0.0
// @name 			Turkish Dictionary Popup.
// @description		English - Turkish, Turkish - English popup dialog dictionary.
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
    var mouseEvt = {x: 0, y: 0, grab: false, sel: "", occured: false, gesture: Gestures.Right};
    console.log(lang("app.title"));

    function ready() {
        clearInterval(tId);
        //document.body.addEventListener("dblclick", doubleClicked, false);
        //document.body.addEventListener("mousedown", mouseDown, false);
        //document.body.addEventListener("mouseup", mouseSelected, false);
        //document.body.addEventListener("mousemove", mouseMoving, false);
        document.onmousemove = mouseMoving;
        document.onmousedown = mouseDown;
        document.onmouseup = mouseSelected;
        document.ondblclick = doubleClicked;

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
    };
    
    var samples = [];
    var maxSamples = 10;
    function mouseMoving(evt) {
        if (mouseEvt.grab) {
            console.log("X: ", evt.pageX, ", Y: ", evt.pageY);
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
        else if (!mouseSelectEnabled) {
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
        else if (!doubleClickEnabled) {
            rt.post("showBadge", sel);
            return;
        }

        //addOverlay();
        rt.post("translate", sel);
        var app = rt.getActionByName("dict-panel");
        app.activate();
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
        if (s.length > 512) { return ""; }
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
        " z-index: 102; background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAB3RJTUUH3wUDEAUxxWZzywAABAtJREFUeJwFwVmIlVUAwPH/Od9y11nuOjozaS6jjgvI5GjU9FA6CRn6UEZGiw9RRBjaQyFE1FSPEoolplQ+pQ8mQmH2MIiCOMWI1VQY6jiLd/bxLt9dvnu/c06/n5iYmzX+yG2i2TT1QoHCnXtINwQCUIrYxnVYySQohTEGAIzB2CGkdLDdCI1qAZtkAu/rMyT3vUDx6jXy3/+AG42jlcLyKoSPfILz8m5MvgRCorXGcqMED+9Qnf8XFw+V6UPq2XnaPzpIpG8Lne+/y7rzZ3AyKaxICOIRAgxGawQBluUTjobQkz/jDQ9QoQUVVKiPfIUtM2kmD35M+97deL/dpHTuIsJ1iITC1Mt1Ei1w/ieJ7TUYz8VZ1rnI7Pgqdq1JkpR38UQK1bYcqYRGFYvIRkBQqeIv5rEtG4QgUAqtDMuXwYULUcbuF7h0Kcp0qZPWqKJ4+1di9VHiG15BokE5NjgWWikCNA2jMUJiuzbFiqCnJ2Bqqsa2rVXyXpzV2b+wRAWr71tihSEK17/AdmwXU/IIvApNa7soRmOUi3mM38Cp+KhaA6TDNyfLJNJNbHuySLwOC7M9pBJp8t2f4pTmEJNlz4weOUGspYnuN1/Dn1vgv5PfUZzMETQClrz6ItnHtyD8KgqJJcGvaxoB2KKOE25GWDZifHTUNKVizD2sIoMAy7XRjkM47CClIRxovHIDAK01xoDtWDTF4whpUatWqJTL2Jal2X90BNsJobRA2AITKEbul3EseKs/y/6+LCXfIIQg5DpUazXOnj2HV/bYsX0HmUwGeXemSntbKwUdZtWjrdixKGtXpFnxSILlyzKcv1UkX/YxqoFRinK1wonjx5mdmWF6appTp04xNjaGHM7V+Tsf8Fh3MzWgf0MzT69rYuPaZjLtIV56IotUGu2GiHR08vvwTS4PDbG5t5en+vrwfZ/BwUHsTR0R5owgV1Y0hx1WZyMMXJmhJeKwd32Si7ce0N+dJVEoEDl0iGdv3CBtWQT1Om0rV9KxdClSSuSteZ8f75aRjkVri0MgJP9UDXs2JVBa09/dSr5hSL7zNtFz50gcPsz2+6N0ff4Zx06fJpfLsXPnTmwtBK2JMB3JEIvKMONrnl/VzHRFEXYkgw8F/aFprCtX0QcOEGztRT63i8zlyzzzwYf0rF9PKpVCHPnlD/PlWAQRdvG1wXYE73VFqQea6UCwxq6xp63OktffILRxE3p8DCudpnLvHpVr1whyU1QbdWRvRtLdpLAtQ8bRxGzDyVGPkVKduUKNB4sliIRZGBigNnQDdf06tYlxiseOUpqZIVABrusiirlRMzyZ50/PwhGABsuVTHoBJlDs64qRDIcoJ1NYuRyhiQn05s2YSASxMA+2g9Ga/wHVpuUMrF9+WQAAAABJRU5ErkJggg==') center no-repeat !important; cursor: pointer;}");

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
            app.activate();
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


