/* =========================================================================
   UTIL — DOM 與格式化工具
   ========================================================================= */
var U = (function () {
  'use strict';
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') { for (var sk in v) el.style.setProperty(sk.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); }), v[sk]); }
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      }
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    if (typeof c === 'string' || typeof c === 'number') el.appendChild(document.createTextNode(String(c)));
    else el.appendChild(c);
  }
  function svg(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (var k in attrs) { if (attrs[k] == null) continue; if (k === 'text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]); }
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c) (Array.isArray(c) ? c : [c]).forEach(function (x) { if (x) el.appendChild(x); }); }
    return el;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

  // 金額
  function sep(n) { return Math.round(n).toLocaleString('en-US'); }
  function wan(n, opt) {
    opt = opt || {};
    if (n == null || isNaN(n)) return '—';
    var neg = n < 0, a = Math.abs(n), s;
    if (a >= 1e8) s = (a / 1e8).toFixed(a >= 1e9 ? 1 : 2).replace(/\.?0+$/, '') + ' 億';
    else if (a >= 1e4 || opt.forceWan) s = sep(a / 1e4) + ' 萬';
    else s = sep(a) + ' 元';
    if (opt.plain) return (neg ? '−' : '') + s;
    return (neg ? '−' : (opt.sign && n > 0 ? '+' : '')) + s;
  }
  function wan1(n) { // 一位小數的萬
    var a = Math.abs(n);
    if (a >= 1e8) return wan(n);
    if (a >= 1e5) return (n < 0 ? '−' : '') + sep(a / 1e4) + ' 萬';
    return (n < 0 ? '−' : '') + (a / 1e4).toFixed(1).replace(/\.0$/, '') + ' 萬';
  }
  function yuan(n) { return sep(n) + ' 元'; }
  function monthly(n) { return n >= 10000 ? (n / 1e4).toFixed(n % 10000 === 0 ? 0 : 1).replace(/\.0$/, '') + ' 萬/月' : sep(n) + ' 元/月'; }
  function prFmt(p) { if (p == null) return '—'; if (p >= 99) return p.toFixed(1); if (p < 1) return '<1'; return Math.round(p).toString(); }
  function topPct(p) { var t = 100 - p; if (t < 1) return t.toFixed(1); return Math.round(t).toString(); }
  // 門檻 PR 一律無條件進位到顯示的精度（50.3 → 51、99.12 → 99.2）：
  // 四捨五入會出現「門檻 PR 50」卻「PR 50 的夫妻撐不住」的矛盾
  function thUp(p) {
    if (p == null || !(p >= 1)) return p;
    if (p >= 99) return Math.min(99.9, Math.ceil(p * 10 - 1e-6) / 10);
    return Math.min(99, Math.ceil(p - 1e-6));
  }
  var CN = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'];
  function cn(n) { return CN[n] || String(n); }

  // 不依賴計時器的排程：MessageChannel 與 setTimeout 同時排，誰先到就執行（部分手機 App 會暫停計時器）
  var errHook = null;
  function onError(fn) { errHook = fn; }
  function report(e, where) { try { if (window.__diag) window.__diag.errors.push((where ? where + ': ' : '') + String(e && (e.stack || e.message) || e).slice(0, 600)); } catch (x) { /* 忽略 */ } if (errHook) try { errHook(e, where); } catch (x) { /* 忽略 */ } }
  function safe(fn, where) { try { return fn(); } catch (e) { report(e, where); return undefined; } }
  function task(fn, where) {
    var done = false;
    var run = function () { if (done) return; done = true; safe(fn, where || 'task'); };
    try { var ch = new MessageChannel(); ch.port1.onmessage = function () { ch.port1.close(); run(); }; ch.port2.postMessage(0); } catch (e) { /* 不支援時改用 setTimeout */ }
    setTimeout(run, 0);
  }
  function debounce(fn, ms) { var t; return function () { var a = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms); }; }
  var store = {
    get: function (k, d) { try { var v = window.localStorage.getItem('tw-kids:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { window.localStorage.setItem('tw-kids:' + k, JSON.stringify(v)); } catch (e) { /* 無法儲存時略過 */ } }
  };
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    // 用 CSS 動畫自動消失，不靠計時器
    toastEl.classList.remove('on'); void toastEl.offsetWidth; toastEl.classList.add('on');
  }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function reduceMotion() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  // 色盲友善模式（封面切換，存在本機）
  function cvd() { return document.documentElement.getAttribute('data-cvd') === '1'; }
  function setCvd(on) { if (on) document.documentElement.setAttribute('data-cvd', '1'); else document.documentElement.removeAttribute('data-cvd'); store.set('cvd', !!on); }
  function isDark() { try { return /dark/.test(getComputedStyle(document.documentElement).colorScheme || ''); } catch (e) { return false; } }
  function hex3(c) { c = String(c || '').trim(); if (c[0] === '#' && c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; var m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c); if (m) return [+m[1], +m[2], +m[3]]; return [1, 3, 5].map(function (i) { return parseInt(c.substr(i, 2), 16) || 0; }); }
  function mix(a, b, t) { var x = hex3(a), y = hex3(b); return 'rgb(' + x.map(function (v, i) { return Math.round(v + (y[i] - v) * t); }).join(',') + ')'; }
  // 複製：先用 Clipboard API；在嵌入框裡被擋時，改用選取＋execCommand；再不行就選取文字請使用者手動複製
  function copy(text, fallbackEl, msg) {
    var done = function () { toast(msg || '已複製'); };
    function legacy() {
      var el = fallbackEl, temp = false;
      if (!el) { el = h('textarea', { readonly: true, style: { position: 'fixed', top: '-1000px', opacity: '0' } }, text); document.body.appendChild(el); temp = true; }
      var ok = false;
      try { el.focus(); el.select(); ok = document.execCommand && document.execCommand('copy'); } catch (e) { ok = false; }
      if (temp) el.parentNode.removeChild(el);
      if (ok) done(); else if (!temp) toast('已選取文字，請手動複製'); else toast('無法自動複製，請手動複製網址');
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, legacy);
      else legacy();
    } catch (e) { legacy(); }
  }
  var modalN = 0;
  function modal(build) {
    var id = 'mdl' + (++modalN);
    var scrim = h('div', { class: 'modal-scrim', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': id + 'h' });
    var box = h('div', { class: 'modal fade-in' });
    scrim.appendChild(box);
    var opener = document.activeElement;
    var close = function () { if (scrim.parentNode) scrim.parentNode.removeChild(scrim); document.removeEventListener('keydown', onKey, true); if (opener && opener.focus) try { opener.focus(); } catch (e) { /* 忽略 */ } };
    var onKey = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        var f = box.querySelectorAll('button, select, input, textarea, a[href]');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
      }
      // 對話框開著時，其他快捷鍵不作用在背後的頁面
      if (!box.contains(e.target)) e.stopPropagation();
      else if (e.key !== 'Enter' && e.key !== ' ') e.stopPropagation();
    };
    document.addEventListener('keydown', onKey, true);
    scrim.addEventListener('click', function (e) { if (e.target === scrim) close(); });
    build(box, close);
    var hd = box.querySelector('h3'); if (hd) hd.id = id + 'h';
    document.body.appendChild(scrim);
    var f = box.querySelector('input, select, button'); if (f) f.focus();
    return close;
  }
  function modalOpen() { return !!document.querySelector('.modal-scrim'); }
  // 小圖示（線條）
  var ICONS = {
    lab: '<path d="M9 3h6M10 3v6.2L4.6 18.4A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.6L14 9.2V3"/><path d="M7.5 14h9"/>',
    book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5v-15Z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20"/><path d="M8 7h8M8 10.5h6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    redo: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    people: '<circle cx="8" cy="7" r="3"/><path d="M3 20v-3a5 5 0 0 1 10 0v3"/><circle cx="17" cy="8" r="2.5"/><path d="M15 20v-3.5a4 4 0 0 1 6 0V20"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    report: '<path d="M6 3h9l4 4v14H6z"/><path d="M14.5 3v4.5H19"/><path d="M9 12h7M9 15.5h7M9 8.5h3"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    download: '<path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M5 19h14"/>',
    code: '<path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8"/>'
  };
  function icon(name, cls) {
    var s = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') + '>' + (ICONS[name] || '') + '</svg>';
    var t = document.createElement('template'); t.innerHTML = s; return t.content.firstChild;
  }
  return { task: task, safe: safe, report: report, onError: onError, modalOpen: modalOpen, h: h, svg: svg, clear: clear, sep: sep, wan: wan, wan1: wan1, yuan: yuan, monthly: monthly, pr: prFmt, topPct: topPct, thUp: thUp, cn: cn, debounce: debounce, store: store, toast: toast, cssVar: cssVar, reduceMotion: reduceMotion, cvd: cvd, setCvd: setCvd, isDark: isDark, mix: mix, copy: copy, modal: modal, icon: icon };
})();
