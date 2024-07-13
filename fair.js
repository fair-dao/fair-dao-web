
function getQuery(key) {
    var query = window.location.search.substring(1);
    var key_values = query.split("&");
    var params = {};
    key_values.map(function (key_val) {
        var key_val_arr = key_val.split("=");
        params[key_val_arr[0]] = key_val_arr[1];
    });
    if (typeof params[key] != "undefined") {
        return params[key];
    }
    return "";
}

function loadJS(url, callback) {
    var script = document.createElement('script'),
        fn = callback || function (state) { };
    script.type = 'text/javascript';

    if (script.readyState) {

        script.onreadystatechange = function () {

            if (script.readyState == 'loaded' || script.readyState == 'complete') {

                script.onreadystatechange = null;

                fn("ok");

            }

        };

    } else {
        script.onload = function () { fn("ok"); };
        script.onerror = function () {
            fn("error")
        };
    }
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
}


function translate(key) {
    if (typeof (key) === "undefined" || key === null || key === "") return "";
    let val = curData && curData.kvs[key];
    if (typeof (val) === "undefined" || val === null) {
        if (com) {
            val = com.kvs[key];
        }
    }
    if (typeof (val) === "undefined") return "";
    return val;
}
function loadData() {
    const BIND_IF = "data-bind-if";
    const BIND = "data-bind";
    const BIND_FOR = "data-bind-for"; //循环
    document.title = curData && curData.kvs["page-title"] || com.kvs["page-title"];
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
        meta.setAttribute('content', curData && curData.kvs["page-des"] || com.kvs["page-des"]);
    }
    //循环绑定
    document.querySelectorAll("[" + BIND_FOR + "]").forEach(e => {
        let html = e.innerHTML;
        let key = e.getAttribute(BIND_FOR);
        let items = translate(key);
        let newHtml = "";
        for (var i = 0; i < items.length; i++) {
            let item = items[i];
            var reg = new RegExp("\{\{[^\}]+?\}\}", "g");
            let itemHtml = html.replace(reg, function (s) {
                var old = s;
                s = s.replace(new RegExp(key + "\."), "").replace(/\}/g, "").replace(/\{/g, "");
                return eval("item."+s);
            });
            newHtml += itemHtml;
        }
        e.innerHTML = newHtml;
        e.removeAttribute(BIND_FOR);

    });

    document.querySelectorAll("[" + BIND_IF + "]").forEach(e => {
        let key = e.getAttribute(BIND_IF);

        if (subpage && key.indexOf("{subpage}") > 0) {
            key = key.replace(/\{subpage\}/g, subpage);
        }
        let val = translate(key);
        if (!val) {
            e.parentNode.removeChild(e);
        } else e.removeAttribute(BIND_IF);
    });


    document.querySelectorAll("[" + BIND + "]").forEach(e => {
        let key = e.getAttribute(BIND);
        if (key.indexOf("{subpage}") > 0) {
            key = key.replace(/\{subpage\}/g, subpage);
        }
        e.innerHTML = translate(key);
        e.removeAttribute(BIND);
    });

    document.querySelectorAll(".tabs").forEach((e) => {
        let contents = e.querySelectorAll("li");
        contents.forEach((e2, index) => {
            e2.onclick = function () {
                let tab = this.parentNode.querySelector(".is-active");
                if (tab) tab.classList.remove("is-active");
                this.classList.add("is-active");
                var contents = this.parentNode.parentNode.parentNode.querySelectorAll(".tabs-content>div");
                for (let i = 0; i < contents.length; i++) {
                    let cur = contents[i];
                    if (i != index) {
                        if (cur.classList.contains("is-active")) cur.classList.remove("is-active");
                    } else cur.classList.add("is-active");
                }
            }

        });

    });
    showpage();
}

function getLang() {
    let lang = getQuery("lang");
    let lsLang = localStorage.getItem("lang");
    if (!lang && lsLang) return lsLang;
    if (!lang) {
        lang = navigator.language;
    } else {
        lang = lang.toLowerCase();
    }
    let idx = lang.indexOf('-');
    if (idx > 0) lang = lang.substring(0, idx);
   
    if (lang != lsLang) {
        localStorage.setItem("lang", lang);
    }
    return lang;

}


function showpage() {
    let page = subpage;
    if (!page) page = "index";
    if (page) {
        let dom = document.getElementById(page);
        if (dom) {
            let title = translate("page-title-" + page);
            if (title) document.title = title;

            let des = translate("page-description-" + page);
            if (des) {
                const meta = document.querySelector('meta[name="description"]');
                if (meta) {
                    meta.setAttribute('content', des);
                }
            }
            var main = document.querySelector(".main-content");
            main.innerHTML = dom.innerHTML;
        }
    }
}



var subpage = getQuery("page");
var lang = getLang();

var eBuilding = document.getElementById("building");
//当前界面语言数据 
var curData = null;
var com = null;
var container = document.getElementById("container");


var enav ;
var elang;


document.addEventListener('DOMContentLoaded', async () => {
    let r = await fetch("/header.html");
    let html = await r.text();
    document.getElementById("header").innerHTML = html;
    r = await fetch("/footer.html");
    html = await r.text();
    document.getElementById("footer").innerHTML = html;
    enav = document.getElementById("dvnav");
    elang=enav.querySelector(".lang");
    var XyConfig = null;
    var strConfig = localStorage.getItem("config");

    if (strConfig) {
        XyConfig = JSON.parse(strConfig);
    } else {
        let response = await fetch("/lang/langs.json");
        XyConfig = await response.json();
        localStorage.setItem("config", JSON.stringify(XyConfig));
    }
    for (let i = 0; i < XyConfig.TgtLangs.length; i++) {
        let nav = XyConfig.TgtLangs[i];
        var el = document.createElement("a");
        el.setAttribute("class", "navbar-item");
        el.innerHTML = nav.DisplayName;
        el.setAttribute("code", nav.Name);
        elang.appendChild(el);
        el.onclick = function () {
            let code = this.getAttribute("code");
            localStorage.setItem("lang", code);
            location.href = location.href + location.href.indexOf('?')>0 ? "&":"?"+"lang=" + code;
        };
    }


    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    $navbarBurgers.forEach(el => {
        el.addEventListener('click', () => {
            const target = el.dataset.target;
            const $target = document.getElementById(target);
            el.classList.toggle('is-active');
            $target.classList.toggle('is-active');

        });
    });


    let response = await fetch("/lang/" + lang + "/nav.json");
    com = await response.json();
    let path = location.pathname.replace(/\//g, "-").replace(/\.html/g, "");
    if (path == "-") path = "index";
    if (path[0] == '-') path = path.substring(1);
    var dataKey = lang + "-" + path;
    var langfile = "/lang/" + lang + "/" + path + ".json";
    response = await fetch(langfile);
    curData = await response.json();
    localStorage.setItem(dataKey, JSON.stringify(curData));
    loadData();

});

