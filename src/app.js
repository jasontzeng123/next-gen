/* =========================================================================
   APP — 狀態、路由、頂列
   ========================================================================= */
var APP = (function () {
  'use strict';
  var h = U.h;
  var A = {
    s: ENGINE.normalize(U.store.get('draft', {}) || {}),
    seen: U.store.get('seen', {}) || {},
    screen: 'cover', qi: U.store.get('qi', 0) || 0,
    res: null, th: null, comp: null, dirty: true,
    unlocked: !!U.store.get('unlocked', false),
    consent: U.store.get('consent', null),
    saves: { expense: [], income: [] },
    screens: {},
    lastResult: U.store.get('lastResult', null)
  };
  A.persist = function () {
    U.store.set('draft', strip(A.s)); U.store.set('seen', A.seen); U.store.set('qi', A.qi);
  };
  function strip(s) { var o = JSON.parse(JSON.stringify(s)); delete o.__norm; return o; }
  A.strip = strip;
  A.set = function (key, val) {
    if (key.indexOf('.') > 0) { var p = key.split('.'); A.s[p[0]][p[1]] = val; }
    else A.s[key] = val;
    A.s = ENGINE.normalize(strip(A.s));
    A.dirty = true; A.persist();
  };
  A.compute = function (force) {
    if (!A.dirty && !force && A.res) return;
    var s = ENGINE.normalize(strip(A.s)); s.__norm = true;
    A.th = ENGINE.threshold(s);
    if (s.incomeMode === 'full') {
      A.res = ENGINE.full(s); A.view = A.res; A.thView = null;
    } else {
      // 不填收入：以收入在中間（PR 50）的夫妻演示；另外保留「剛好達到門檻」的情境
      A.res = ENGINE.atPR(s, 50);
      A.thView = ENGINE.atPR(s, A.th.pr != null ? A.th.pr : 99.9);
      A.view = A.viewMode === 'threshold' ? A.thView : A.res;
    }
    A.wait = ENGINE.waitAge(s, s.incomeMode === 'full' ? {} : { pr: 50 });
    // 圖卡與分享文字一律用收入在中間（PR 50）的版本，方便互相比較
    A.waitMid = s.incomeMode === 'full' ? ENGINE.waitAge(s, { pr: 50 }) : A.wait;
    A.comp = null; // 需要時再算（較慢）
    A.dirty = false;
  };
  A.getComp = function () { if (!A.comp) { var s = ENGINE.normalize(strip(A.s)); s.__norm = true; A.comp = ENGINE.compromises(s); } return A.comp; };

  // ---------- 存檔 ----------
  var EXP_KEYS = ['county', 'district', 'partner', 'ageA', 'ageB', 'firstBirthAge', 'kids', 'spacing', 'room', 'housing', 'buyWhen', 'build', 'loan', 'reno', 'postpartum', 'leave', 'care', 'quitWho', 'quitUntil', 'preschool', 'school', 'after', 'cram', 'uni', 'uniAway', 'support', 'transport', 'lifestyle', 'travel', 'elder', 'elderCare'];
  var INC_KEYS = ['incomeMode', 'jobA', 'jobB', 'savings', 'giftOnce', 'giftMonthly', 'giftYears'];
  A.EXP_KEYS = EXP_KEYS; A.INC_KEYS = INC_KEYS;
  function pick(s, keys) { var o = {}; keys.forEach(function (k) { if (s && s[k] !== undefined) o[k] = JSON.parse(JSON.stringify(s[k])); }); return o; }
  A.pick = pick;
  A.expName = function (s) { var c = DATA.COUNTY[s.county].name; return c + '・' + ({ rent: '租屋', buy: '買房', family: '住長輩家' }[s.housing]) + '・' + s.kids + ' 胎'; };
  A.incName = function (s) {
    if (s.incomeMode !== 'full') return '只看門檻（不填收入）';
    var a = DATA.INDUSTRY[s.jobA.industry], t = (a.id === 'all' ? '' : a.name.replace(/（.*）/, '') + ' ') + 'PR' + U.pr(s.jobA.pr);
    if (s.partner) { var b = DATA.INDUSTRY[s.jobB.industry]; t += ' ＋ ' + (b.id === 'all' ? '' : b.name.replace(/（.*）/, '') + ' ') + 'PR' + U.pr(s.jobB.pr); }
    return t;
  };
  A.saveProfile = function (kind, name, auto) {
    var list = A.saves[kind] = (A.saves[kind] || []).slice();
    var data = pick(A.s, kind === 'expense' ? EXP_KEYS : INC_KEYS);
    if (auto) {
      var i = list.findIndex(function (x) { return x.auto; });
      var item = { id: 'auto', auto: true, name: '上次填寫的設定', ts: Date.now(), data: data };
      if (i >= 0) list[i] = item; else list.unshift(item);
    } else {
      list.push({ id: 'p' + Date.now().toString(36), name: name, ts: Date.now(), data: data });
      if (list.length > 20) list.splice(1, 1);
    }
    COMM.writeSaves({ expense: A.saves.expense, income: A.saves.income, unlocked: true });
  };
  A.deleteProfile = function (kind, id) {
    A.saves[kind] = (A.saves[kind] || []).filter(function (x) { return x.id !== id; });
    COMM.writeSaves({ expense: A.saves.expense, income: A.saves.income, unlocked: A.unlocked });
  };
  A.unlock = function () { A.unlocked = true; U.store.set('unlocked', true); };
  A.restart = function () {
    U.modal(function (box, close) {
      box.appendChild(h('h3', {}, '全部重新填寫？'));
      box.appendChild(h('p', {}, '目前的填寫內容和審查報告會清空，回到第一題。你在實驗室存下的支出與收入設定都會保留。'));
      box.appendChild(h('div', { class: 'actions' }, h('button', { class: 'btn ghost', onclick: close }, '取消'), h('button', { class: 'btn', onclick: function () {
        close(); A.s = ENGINE.normalize({}); A.seen = {}; A.qi = 0; A.dirty = true; A.submitted = null; A.undo = [];
        // 重新填寫：再看一次填寫須知
        U.store.set('submitted', null); U.store.set('noticeOk', null); A.persist(); A.go('notice');
      } }, '清空並重新填寫')));
    });
  };

  // ---------- 路由 ----------
  A.go = function (screen, opts) {
    if (A.cleanup) { try { A.cleanup(); } catch (e) { /* 忽略 */ } A.cleanup = null; }
    A.screen = screen; A.opts = opts || {};
    var token = { cover: '', notice: 'start', quiz: 'form', reveal: 'form', report: 'report', lab: 'lab', method: 'method' }[screen];
    try {
      var url = token ? '#' + token : location.pathname + location.search;
      var st = { screen: screen === 'reveal' ? 'report' : screen, qi: A.qi };
      if (A.opts.keepScroll || A.opts.fromPop || !history.state) history.replaceState(st, '', url);
      else if (history.state.screen !== st.screen || history.state.qi !== st.qi) history.pushState(st, '', url);
    } catch (e) { /* 部分環境不允許 */ }
    A.render();
    if (!A.opts.keepScroll) window.scrollTo(0, 0);
  };
  // 第一次開始填寫：先看填寫須知
  A.startQuiz = function () { A.qi = 0; A.go(U.store.get('noticeOk', null) ? 'quiz' : 'notice'); };
  A.render = function () {
    renderTop();
    var main = document.getElementById('main');
    U.clear(main);
    var fn = A.screens[A.screen] || A.screens.cover;
    fn(main, A.opts || {});
  };

  // ---------- 頂列 ----------
  function seal(size) {
    var t = document.createElement('template');
    t.innerHTML = '<svg class="brand-seal" viewBox="0 0 40 40" aria-hidden="true"><rect x="3" y="3" width="34" height="34" rx="4" fill="none" stroke="var(--seal)" stroke-width="2.6"/><text x="20" y="27" text-anchor="middle" font-family="var(--f-serif)" font-weight="900" font-size="19" fill="var(--seal)">審</text></svg>';
    return t.content.firstChild;
  }
  A.sealIcon = seal;
  function renderTop() {
    var bar = document.getElementById('topbar');
    U.clear(bar);
    var inner = h('div', { class: 'topbar-in' });
    inner.appendChild(h('button', { class: 'brand', onclick: function () { A.go('cover'); }, 'aria-label': '回到封面' }, seal(), h('span', { class: 'brand-name' }, '生育資格審查'), h('span', { class: 'brand-no' }, 'No.115-TW')));
    // 填寫進度：改成貼在頂列下緣的一條細線（三段＝三個部分），文字進度放在題目卡片上
    inner.appendChild(h('div', { class: 'top-spacer' }));
    var strip = null;
    if (A.screen === 'quiz') {
      var vis = QS.visible(A.s), cur = vis[Math.min(A.qi, vis.length - 1)];
      var fracs = [], bars = [];
      strip = h('div', { class: 'top-strip', role: 'progressbar', 'aria-label': '填寫進度', 'aria-valuemin': '1', 'aria-valuemax': String(vis.length), 'aria-valuenow': String(Math.min(A.qi, vis.length - 1) + 1) });
      [1, 2, 3].forEach(function (p) {
        var inPart = vis.filter(function (q) { return q.part === p; });
        var idx = inPart.indexOf(cur);
        var frac = cur.part > p ? 1 : cur.part < p ? 0 : (idx + 1) / inPart.length;
        var prev = A.pgPrev && A.pgPrev[p - 1] != null ? A.pgPrev[p - 1] : frac;
        var fill = h('i', { style: { width: (prev * 100).toFixed(1) + '%' } });
        strip.appendChild(h('div', { class: 'ts-seg', style: { flexGrow: String(inPart.length) } }, fill));
        fracs.push(frac); bars.push(fill);
      });
      // 從上一題的位置長到這一題（換題時有一點動感）
      A.pgPrev = fracs;
      U.task(function () { bars.forEach(function (b, i) { void b.offsetWidth; b.style.width = (fracs[i] * 100).toFixed(1) + '%'; }); });
    }
    var acts = h('div', { class: 'top-actions' });
    // 報告書：拿到審查結果後出現，隨時回到報告
    if (A.unlocked && (A.submitted || U.store.get('submitted', null))) acts.appendChild(h('button', { class: 'tbtn', 'aria-label': '審查報告書', 'aria-pressed': A.screen === 'report' ? 'true' : 'false', onclick: function () { if (A.screen === 'report') { window.scrollTo({ top: 0, behavior: U.reduceMotion() ? 'auto' : 'smooth' }); return; } A.compute(); A.go('report'); } }, U.icon('report'), h('span', { class: 'tl' }, '報告書')));
    acts.appendChild(h('button', { class: 'tbtn', 'aria-label': A.unlocked ? '實驗室' : '實驗室（尚未解鎖）', 'aria-pressed': A.screen === 'lab' ? 'true' : 'false', onclick: function () { if (A.unlocked) A.go('lab'); else lockedNotice(); } }, U.icon(A.unlocked ? 'lab' : 'lock', A.unlocked ? '' : 'lock'), h('span', { class: 'tl' }, '實驗室')));
    acts.appendChild(h('button', { class: 'tbtn', 'aria-label': '方法與資料', 'aria-pressed': A.screen === 'method' ? 'true' : 'false', onclick: function () { A.go('method'); } }, U.icon('book'), h('span', { class: 'tl' }, '方法與資料')));
    inner.appendChild(acts);
    bar.appendChild(inner);
    if (strip) bar.appendChild(strip);
  }
  function lockedNotice() {
    U.modal(function (box, close) {
      box.appendChild(h('h3', {}, '實驗室還沒開放'));
      box.appendChild(h('p', {}, '完成一次申請書、拿到審查結果後，實驗室就會解鎖。你可以載入自己的支出與收入設定，比較各縣市、不同收入水準，甚至回到 30 年前（1996 年）的台灣。'));
      box.appendChild(h('div', { class: 'actions' }, h('button', { class: 'btn ghost', onclick: close }, '知道了'), h('button', { class: 'btn', onclick: function () { close(); A.go('quiz'); } }, '開始填寫')));
    });
  }

  // ---------- 啟動 ----------
  A.start = function () {
    if (U.store.get('cvd', false)) document.documentElement.setAttribute('data-cvd', '1');
    // 任何未預期的錯誤：記錄並提示，不讓畫面默默卡住
    var lastErrToast = 0;
    U.onError(function () { COMM.diag('error'); var now = Date.now(); if (now - lastErrToast > 4000) { lastErrToast = now; U.toast('發生錯誤，已記錄下來。可以重新整理後再試一次。'); } });
    window.addEventListener('error', function (e) { U.report(e.error || e.message, 'window'); });
    window.addEventListener('unhandledrejection', function (e) { U.report(e.reason, 'promise'); });
    var app = document.getElementById('app');
    var hot = window.claude && window.claude.hot;
    if (hot && hot.snapshot) { try { hot.snapshot(function () { return { s: strip(A.s), seen: A.seen, qi: A.qi, screen: A.screen }; }); } catch (e) { /* 不支援時略過 */ } }
    var boot = function (data) {
      if (data && data.s) { A.s = ENGINE.normalize(data.s); A.seen = data.seen || A.seen; A.qi = data.qi || 0; }
      var hash = (location.hash || '').replace('#', '');
      var first = data && data.screen ? data.screen : (hash === 'lab' && A.unlocked ? 'lab' : hash === 'method' ? 'method' : hash === 'report' && A.unlocked ? 'report' : 'cover');
      if (first === 'reveal') first = 'report';
      if (first === 'report') A.compute(true);
      A.go(first);
    };
    if (hot && hot.ready) hot.ready(boot); else boot(hot && hot.data ? hot.data : null);
    COMM.on(function () { if (A.onComm) A.onComm(); });
    COMM.init().then(function () {
      return COMM.loadSaves().then(function (sv) {
        if (sv) { sv = JSON.parse(JSON.stringify(sv)); A.saves.expense = sv.expense || []; A.saves.income = sv.income || []; if (sv.unlocked && !A.unlocked) { A.unlock(); renderTop(); } }
      });
    });
    window.addEventListener('hashchange', function () {
      var tok = (location.hash || '').replace('#', '');
      var map = { start: 'notice', form: 'quiz', report: 'report', lab: 'lab', method: 'method', '': 'cover' };
      var scr = map[tok]; if (!scr || scr === A.screen) return;
      if ((scr === 'lab' || scr === 'report') && !A.unlocked) return;
      if (scr === 'report') A.compute();
      A.go(scr, { fromPop: true });
    });
    window.addEventListener('popstate', function (e) {
      var st = e.state; if (!st || !st.screen) return;
      if ((st.screen === 'lab' || st.screen === 'report') && !A.unlocked) return;
      if (typeof st.qi === 'number') A.qi = st.qi;
      if (st.screen === 'report') A.compute();
      A.go(st.screen, { fromPop: true });
    });
  };
  return A;
})();
