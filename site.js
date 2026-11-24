/* GXCのAIサイト 共通スクリプト: メニュー・フッター・速報帯・記事一覧・関連記事を各ページに描画します */
(function () {
  "use strict";

  var NEWS = (window.GXC_NEWS || []).slice().sort(function (a, b) {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });
  var LABEL = { ai: "AI", parts: "PCパーツ", info: "PC情報" };
  var PAGE_OF = { ai: "ai.html", parts: "parts.html", info: "info.html" };
  var NAV = [
    { id: "home", href: "index.html", label: "トップ" },
    { id: "all", href: "all.html", label: "ニュース一覧" },
    { id: "ai", href: "ai.html", label: "AI" },
    { id: "parts", href: "parts.html", label: "PCパーツ" },
    { id: "info", href: "info.html", label: "PC情報" },
    { id: "about", href: "about.html", label: "このサイトについて" }
  ];
  var WD = ["日", "月", "火", "水", "木", "金", "土"];

  var app = document.querySelector("[data-page]");
  if (!app) return;
  var page = app.getAttribute("data-page");

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function ymd(d) {
    var p = d.split("-");
    var w = WD[new Date(+p[0], +p[1] - 1, +p[2]).getDay()];
    return { y: +p[0], m: +p[1], d: +p[2], w: w };
  }
  function fmtDot(d) { var x = ymd(d); return x.y + "." + pad(x.m) + "." + pad(x.d) + " (" + x.w + ")"; }
  function fmtJa(d) { var x = ymd(d); return x.y + "年" + x.m + "月" + x.d + "日(" + x.w + ")"; }
  function fmtShort(d) { var x = ymd(d); return pad(x.m) + "." + pad(x.d); }
  function href(n) { return esc(n.slug) + ".html"; }

  function cardHtml(n, o) {
    o = o || {};
    var when = o.showDate ? '<time datetime="' + n.date + '">' + esc(fmtDot(n.date)) + "</time>" : "";
    return '<article class="card cat-' + n.cat + (o.featured ? " featured" : "") + '">' +
      '<div class="meta"><span class="pill">' + esc(LABEL[n.cat]) + "</span>" +
      (n.flash ? '<span class="badge-flash">速報</span>' : "") + when + "</div>" +
      '<h3><a href="' + href(n) + '">' + esc(n.title) + "</a></h3>" +
      "<p>" + esc(n.summary) + "</p>" +
      '<p class="read"><a href="' + href(n) + '">続きを読む →</a></p></article>';
  }

  function renderChrome() {
    var h = $("site-header");
    if (h) {
      h.innerHTML = '<div class="wrap head-inner">' +
        '<a class="logo" href="index.html" aria-label="GXCのAIサイト トップ">' +
        '<span class="logo-mark">GXC</span><span class="logo-text">のAIサイト</span></a>' +
        '<nav class="nav" aria-label="ページメニュー">' +
        NAV.map(function (x) {
          return '<a href="' + x.href + '"' + (x.id === page ? ' aria-current="page"' : "") + ">" + esc(x.label) + "</a>";
        }).join("") + "</nav></div>";
    }
    var f = $("site-footer");
    if (f) {
      f.innerHTML = '<div class="wrap foot-inner"><nav class="foot-nav" aria-label="フッターメニュー">' +
        NAV.map(function (x) { return '<a href="' + x.href + '">' + esc(x.label) + "</a>"; }).join("") +
        "</nav><span>© GXCのAIサイト</span></div>";
    }
  }

  function renderFlash() {
    var el = $("flash");
    if (!el || !NEWS.length) return;
    var item = NEWS.filter(function (n) { return n.flash; })[0] || NEWS[0];
    el.innerHTML = '<div class="wrap flash-inner"><span class="flash-badge">速報</span>' +
      '<a class="flash-link" href="' + href(item) + '">' + esc(item.title) + "</a>" +
      '<span class="flash-date">' + esc(fmtDot(item.date)) + "</span></div>";
    el.hidden = false;
  }

  function renderHome() {
    var latest = NEWS.slice(0, 7);
    var featured = latest.filter(function (n) { return n.flash; })[0] || latest[0];
    var rest = latest.filter(function (n) { return n !== featured; });
    var latestEl = $("latest");
    if (latestEl) {
      latestEl.innerHTML = '<div class="section-head"><h2>新着ニュース</h2>' +
        '<a class="more" href="all.html">ニュース一覧を見る →</a></div>' +
        (latest.length
          ? '<div class="feed">' + [featured].concat(rest).map(function (n, i) {
              return cardHtml(n, { featured: i === 0, showDate: true });
            }).join("") + "</div>"
          : '<div class="empty">まだ記事がありません。</div>');
    }
    var catsEl = $("cat-sections");
    if (catsEl) {
      catsEl.innerHTML = '<div class="section-head"><h2>カテゴリー別の最新</h2></div><div class="cat-grid">' +
        ["ai", "parts", "info"].map(function (c) {
          var items = NEWS.filter(function (n) { return n.cat === c; }).slice(0, 4);
          return '<section class="cat-panel cat-' + c + '"><h3>' + esc(LABEL[c]) + "</h3>" +
            (items.length
              ? '<ul class="compact">' + items.map(function (n) {
                  return '<li><time datetime="' + n.date + '">' + fmtShort(n.date) + "</time>" +
                    '<a href="' + href(n) + '">' + esc(n.title) + "</a></li>";
                }).join("") + "</ul>"
              : '<p class="count">まだ記事がありません。</p>') +
            '<a class="more" href="' + PAGE_OF[c] + '">' + esc(LABEL[c]) + "の記事をもっと見る →</a></section>";
        }).join("") + "</div>";
    }
    var stamp = $("latest-date");
    if (stamp && NEWS.length) stamp.textContent = "最新の記事: " + fmtJa(NEWS[0].date);
  }

  function renderList() {
    var listEl = $("list");
    if (!listEl) return;
    var cat = app.getAttribute("data-cat") || "all";
    var base = NEWS.filter(function (n) { return cat === "all" || n.cat === cat; });
    var countEl = $("count");
    var qEl = $("q");
    var q = "";

    function draw() {
      var items = base.filter(function (n) {
        if (!q) return true;
        return (n.title + " " + n.summary + " " + (n.kw || "")).toLowerCase().indexOf(q) !== -1;
      });
      if (!items.length) {
        listEl.innerHTML = '<div class="empty">' +
          (base.length ? "該当する記事がありません。キーワードを変えてみてください。" : "まだ記事がありません。") + "</div>";
      } else {
        var groups = [];
        items.forEach(function (n) {
          var last = groups[groups.length - 1];
          if (last && last.date === n.date) last.items.push(n);
          else groups.push({ date: n.date, items: [n] });
        });
        listEl.innerHTML = groups.map(function (g) {
          return '<section class="day"><h2 class="day-head"><time datetime="' + g.date + '">' +
            esc(fmtJa(g.date)) + '</time></h2><div class="feed">' +
            g.items.map(function (n) { return cardHtml(n, { showDate: false }); }).join("") +
            "</div></section>";
        }).join("");
      }
      if (countEl) countEl.textContent = items.length + "件の記事";
    }

    if (qEl) {
      qEl.addEventListener("input", function () {
        q = qEl.value.trim().toLowerCase();
        draw();
      });
    }
    draw();
  }

  function renderRelated() {
    var el = $("related");
    if (!el) return;
    var slug = app.getAttribute("data-slug");
    var cat = app.getAttribute("data-cat");
    var others = NEWS.filter(function (n) { return n.slug !== slug; });
    var same = others.filter(function (n) { return n.cat === cat; });
    var more = others.filter(function (n) { return n.cat !== cat; });
    var items = same.concat(more).slice(0, 3);
    if (!items.length) return;
    el.innerHTML = '<div class="section-head"><h2>関連記事</h2>' +
      '<a class="more" href="' + PAGE_OF[cat] + '">' + esc(LABEL[cat]) + "の記事をもっと見る →</a></div>" +
      '<div class="feed">' + items.map(function (n) { return cardHtml(n, { showDate: true }); }).join("") + "</div>";
  }

  renderChrome();
  renderFlash();
  if (page === "home") renderHome();
  else if (page === "article") renderRelated();
  else if (page === "all" || PAGE_OF[page]) renderList();
})();
