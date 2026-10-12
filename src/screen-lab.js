/* 實驗室 */
(function () {
  'use strict';
  var h = U.h, A = APP, D = DATA, E = ENGINE;
  var L = A.lab = A.lab || { exp: 'current', inc: 'current', tab: U.store.get('labTab', 'map'), metric: 'th', level: 'tw', sel: null, era: 'current', wsel: null };
  // 門檻 PR 分六級：綠（容易）→ 黃（中間收入附近）→ 橘紅（困難）→ 偏黑的深紅（PR 95 以上或再高也不夠）
  // 色盲友善模式改用藍 → 黃 → 橘 → 深咖啡紅（相鄰兩級的明暗差距夠大，深色模式下也看得到）
  var PAL = { normal: ['#0f8a73', '#6db36a', '#edc948', '#e86a2c', '#bf2c34', '#7a1424'], cvd: ['#2a6fb8', '#82b8e3', '#ecd060', '#e9792e', '#a8342a', '#5e1c12'] };
  var BINS = [{ max: 25, t: 'PR 25 以下' }, { max: 40, t: 'PR 25–40' }, { max: 60, t: 'PR 40–60' }, { max: 80, t: 'PR 60–80' }, { max: 95, t: 'PR 80–95' }, { max: Infinity, t: 'PR 95 以上' }];
  function pal() { return U.cvd() ? PAL.cvd : PAL.normal; }
  function heatIdx(pr) { if (pr == null) return 5; for (var i = 0; i < BINS.length; i++) if (pr <= BINS[i].max) return i; return 5; }
  function heat(pr) { return pal()[heatIdx(pr)]; }
  function heats() { var p = pal(); return BINS.map(function (b, i) { return { max: b.max, t: b.t, c: p[i] }; }); }
  function onDark(c) { var p = pal(); return c === p[0] || c === p[4] || c === p[5]; }
  var VKEYS = ['pass', 'tight', 'fail', 'broke'];
  function vcol(k) { var p = pal(); return { pass: p[0], tight: p[2], fail: p[4], broke: p[5] }[k]; }
  var VTXT = { pass: '核准', tight: '附條件核准', fail: '駁回（中途借錢）', broke: '駁回（入不敷出）' };

  function profiles(kind) { return (A.saves[kind] || []); }
  function labSettings() {
    var base = E.normalize(A.strip(A.s));
    var ep = profiles('expense').filter(function (p) { return p.id === L.exp; })[0];
    var ip = profiles('income').filter(function (p) { return p.id === L.inc; })[0];
    var x = A.strip(base);
    if (ep) for (var k in ep.data) x[k] = JSON.parse(JSON.stringify(ep.data[k]));
    if (ip) for (var k2 in ip.data) x[k2] = JSON.parse(JSON.stringify(ip.data[k2]));
    var n = E.normalize(x); n.__norm = true; return n;
  }
  function forCounty(s, id) {
    var x = E.clone(s); x.county = id; var dl = D.DISTRICTS[id];
    x.district = dl ? (dl.some(function (d) { return d.id === 'mid'; }) ? 'mid' : dl[0].id) : 'mid';
    var n = E.normalize(x); n.__norm = true; return n;
  }
  // 分批計算，避免卡住畫面
  function batch(items, fn, done, onProgress) {
    var i = 0, out = [], token = {};
    L.token = token;
    (function step() {
      if (L.token !== token) return;
      var t0 = performance.now();
      while (i < items.length && performance.now() - t0 < 24) { out.push(fn(items[i], i)); i++; }
      if (onProgress) onProgress(i, items.length);
      if (i < items.length) U.task(step, 'lab-batch'); else U.safe(function () { done(out); }, 'lab-done');
    })();
  }

  APP.screens.lab = function (main) {
    if (!A.unlocked) { A.go('cover'); return; }
    var wrap = h('div', { class: 'lab' + (A.opts && A.opts.keepScroll ? '' : ' fade-in') });
    var head = h('div', { class: 'lab-head' });
    head.appendChild(h('div', {}, h('div', { class: 'rsec-k' }, '實驗室'), h('h1', { class: 'lab-title' }, '換個條件，再審一次'), h('p', { class: 'muted', style: { marginTop: '4px', maxWidth: '40em' } }, '載入你存下的支出與收入設定，看看換到別的縣市、換個收入，或回到過去的台灣，結果會怎麼變。')));
    var loaders = h('div', { class: 'lab-loaders' });
    function loader(kind, label) {
      var list = profiles(kind);
      var sel = h('select', { class: 'select', id: 'ld-' + kind, onchange: function (e) { L[kind === 'expense' ? 'exp' : 'inc'] = e.target.value; A.go('lab', { keepScroll: true }); } });
      sel.appendChild(h('option', { value: 'current', selected: L[kind === 'expense' ? 'exp' : 'inc'] === 'current' }, '目前的設定（' + (kind === 'expense' ? A.expName(A.s) : A.incName(A.s)) + '）'));
      list.forEach(function (p) { sel.appendChild(h('option', { value: p.id, selected: L[kind === 'expense' ? 'exp' : 'inc'] === p.id }, p.name + (p.auto ? '' : '・' + new Date(p.ts).toLocaleDateString('zh-TW')))); });
      return h('div', { class: 'field' }, h('label', { for: 'ld-' + kind }, label), sel);
    }
    loaders.appendChild(loader('expense', '支出設定'));
    loaders.appendChild(loader('income', '收入設定'));
    head.appendChild(loaders);
    wrap.appendChild(head);
    var s = labSettings();
    wrap.appendChild(h('p', { class: 'sm muted' }, '目前組合：' + QS.placeName(s) + '・' + s.kids + ' 個孩子・' + QS.labelOf('housing', s.housing) + '・' + A.incName(s) + '。', h('button', { class: 'linkbtn', style: { marginLeft: '8px' }, onclick: function () { manageModal(); } }, '管理存檔')));
    var tabs = h('div', { class: 'tabs', role: 'tablist' });
    // 大家的資料：有足夠的共享資料、或自己能加入時才顯示
    var crowdOk = COMM.st.canShare || (COMM.st.stats && COMM.st.stats.n >= COMM.MIN_N);
    if (L.tab === 'crowd' && !crowdOk) L.tab = 'map';
    [['map', '地圖'], ['curve', '門檻分析'], ['time', '時光機']].concat(crowdOk ? [['crowd', '大家的資料']] : []).forEach(function (t) {
      tabs.appendChild(h('button', { role: 'tab', 'aria-selected': L.tab === t[0] ? 'true' : 'false', onclick: function () { L.tab = t[0]; U.store.set('labTab', t[0]); A.go('lab', { keepScroll: true }); } }, t[1]));
    });
    wrap.appendChild(tabs);
    var panel = h('div', { role: 'tabpanel' });
    wrap.appendChild(panel);
    main.appendChild(wrap);
    if (L.tab === 'map') mapTab(panel, s);
    else if (L.tab === 'curve') curveTab(panel, s);
    else if (L.tab === 'time') timeTab(panel, s);
    else crowdTab(panel, s);
    var prevC = A.cleanup; A.cleanup = function () { L.token = null; if (L.globe) { L.globe.destroy(); L.globe = null; } if (prevC) prevC(); };
  };

  function legendEl(metric, dots) {
    var box = h('div', { class: 'map-legend' });
    var lg = h('div', { class: 'legend-scale' });
    var sw = function (c) { return h('s', { style: { background: c, borderRadius: dots ? '50%' : '' } }); };
    if (metric === 'th') heats().forEach(function (x) { lg.appendChild(h('span', {}, sw(x.c), x.t)); });
    else VKEYS.forEach(function (k) { lg.appendChild(h('span', {}, sw(vcol(k)), VTXT[k])); });
    box.appendChild(lg);
    if (dots) {
      // 點的大小＝人口密度
      var sizes = [[100, '100'], [1000, '1,000'], [5000, '5,000'], [12000, '1.2 萬']];
      var x = 4, items = sizes.map(function (sz) { var r = TWMap.radius(sz[0]); var it = { r: r, cx: x + r, t: sz[1] }; x += r * 2 + 34; return it; });
      var maxR = TWMap.radius(12000), k = 1.15;
      var svg = U.svg('svg', { viewBox: '0 0 ' + (x * k).toFixed(0) + ' ' + ((maxR * 2 + 4) * k).toFixed(0), width: (x * k).toFixed(0), height: ((maxR * 2 + 4) * k).toFixed(0), class: 'size-legend', 'aria-hidden': 'true' });
      var g = U.svg('g', { transform: 'scale(' + k + ')' });
      items.forEach(function (it) {
        g.appendChild(U.svg('circle', { cx: it.cx, cy: maxR + 2, r: it.r, fill: 'var(--ink-3)' }));
        g.appendChild(U.svg('text', { x: it.cx + it.r + 4, y: maxR + 6, text: it.t }));
      });
      svg.appendChild(g);
      box.appendChild(h('div', { class: 'dens-scale' }, h('span', {}, '點的大小＝人口密度（人／平方公里）'), svg));
    }
    return box;
  }
  // 人口加權中位數：一半的人住在門檻比它高的縣市
  function popMedian(vals) {
    if (typeof POPGRID === 'undefined') return COMM.median(vals.map(function (r) { return r.v == null ? 100 : r.v; }));
    var arr = vals.map(function (r) { return { v: r.v == null ? 100 : r.v, p: POPGRID.pop[r.id] || 0 }; }).sort(function (a, b) { return a.v - b.v; });
    var tot = arr.reduce(function (a, x) { return a + x.p; }, 0), acc = 0;
    for (var i = 0; i < arr.length; i++) { acc += arr[i].p; if (acc >= tot / 2) return arr[i].v; }
    return arr[arr.length - 1].v;
  }

  function mapTab(panel, s) {
    var full = s.incomeMode === 'full';
    if (!full) L.metric = 'th';
    var grid = h('div', { class: 'lab-grid' });
    var left = h('div', { class: 'rsec' }), right = h('div', { class: 'rsec' });
    grid.appendChild(left); grid.appendChild(right); panel.appendChild(grid);
    var ctrl = h('div', { class: 'chart-ctrl' });
    ctrl.appendChild(h('div', { class: 'seg', role: 'group', 'aria-label': '地圖範圍' },
      h('button', { type: 'button', 'aria-pressed': L.level === 'tw' ? 'true' : 'false', onclick: function () { L.level = 'tw'; A.go('lab', { keepScroll: true }); } }, '台灣縣市'),
      h('button', { type: 'button', 'aria-pressed': L.level === 'world' ? 'true' : 'false', onclick: function () { L.level = 'world'; A.go('lab', { keepScroll: true }); } }, '世界')));
    if (full && L.level === 'tw') ctrl.appendChild(h('div', { class: 'seg', role: 'group', 'aria-label': '顯示指標' },
      h('button', { type: 'button', 'aria-pressed': L.metric === 'th' ? 'true' : 'false', onclick: function () { L.metric = 'th'; A.go('lab', { keepScroll: true }); } }, '門檻 PR'),
      h('button', { type: 'button', 'aria-pressed': L.metric === 'v' ? 'true' : 'false', onclick: function () { L.metric = 'v'; A.go('lab', { keepScroll: true }); } }, '用你們的收入')));
    left.appendChild(ctrl);
    if (L.level === 'world' && typeof WUI !== 'undefined') { worldView(left, right, s); return; }
    var status = h('p', { class: 'sm muted', 'aria-live': 'polite' }, '計算各縣市中…');
    var mapBox = h('div', { class: 'twmap-wrap' });
    left.appendChild(h('h2', { style: { fontSize: '20px', marginBottom: '4px' } }, L.metric === 'th' ? '同樣的標準，在哪裡養得起？' : '同樣的收入，搬到哪裡會核准？'));
    left.appendChild(status);
    left.appendChild(mapBox);
    var dotsOn = L.level === 'tw' && typeof POPGRID !== 'undefined';
    var lg = legendEl(L.metric, dotsOn);
    left.appendChild(lg);
    var popBox = h('div', { 'aria-live': 'polite' });
    left.appendChild(popBox);
    var detail = h('div');
    right.appendChild(detail);
    var ids = D.COUNTIES.map(function (c) { return c.id; });
    var result = {};
    var tip = h('div', { class: 'globe-tip' }); mapBox.appendChild(tip);

    function compute(cb) {
      batch(ids, function (id) {
        var x = forCounty(s, id);
        var r = { id: id };
        if (L.metric === 'th') { var t = E.threshold(x, { quick: true }); r.v = t.pr; r.gross = t.grossBirth; }
        else { var sim = E.simulate(x); r.v = sim.verdict; r.minS = sim.low.v; r.minAge = x.ageA + sim.low.t; }
        return r;
      }, function (out) { out.forEach(function (r) { result[r.id] = r; }); cb(); }, function (i, n) { status.textContent = '計算各縣市中… ' + i + '／' + n; });
    }
    function colorOf(id) { var r = result[id]; if (!r) return null; return L.metric === 'th' ? heat(r.v) : vcol(r.v); }
    function label(r) { if (!r) return '—'; if (L.metric === 'th') return r.v == null ? '>99.9' : 'PR ' + U.pr(r.v); return VTXT[r.v]; }

    compute(function () {
      var vals = ids.map(function (id) { return result[id]; });
      var med = null;
      if (L.metric === 'th') med = popMedian(vals);
      status.textContent = (L.metric === 'th' ? '顏色是門檻收入 PR' + (dotsOn ? '，點越大代表那裡住的人越密' : '') + '。一半的台灣人，住在門檻 PR ' + U.pr(med) + ' 以上的縣市。' : '以你們目前的收入，套用到每個縣市的結果' + (dotsOn ? '；點越大代表那裡住的人越密' : '') + '。');
      if (L.level === 'tw') {
        var map = TWMap.create(mapBox, {
          label: '各縣市結果地圖',
          onPick: function (id) { L.sel = id; paint(); showDetail(); },
          onHover: function (id, e) {
            if (!id) { tip.classList.remove('on'); return; }
            var r = mapBox.getBoundingClientRect();
            tip.textContent = D.COUNTY[id].name + '・' + label(result[id]);
            tip.style.left = ((e.clientX - r.left) / r.width * 100) + '%'; tip.style.top = ((e.clientY - r.top) / r.height * 100) + '%'; tip.classList.add('on');
          }
        });
        var paint = function () {
          if (dotsOn) {
            map.dots(colorOf, { bg: U.cssVar('--sheet') || '#fbfcfa' });
            map.paint(null, L.sel || s.county); return;
          }
          map.paint(colorOf, L.sel || s.county);
          map.setLabelColor(function (id) { return onDark(colorOf(id)) ? '#fff' : '#1b2420'; });
        };
        paint();
      }
      popSummary();
      showDetail();
      renderRank();
    });
    // 依人口加權：多少人住在多難的縣市
    function popSummary() {
      if (typeof POPGRID === 'undefined') return;
      U.clear(popBox);
      var P = POPGRID.pop, tot = 0; ids.forEach(function (id) { tot += P[id] || 0; });
      var cats = L.metric === 'th' ? heats().map(function (x, i) { return { c: x.c, t: x.t, test: function (r) { return heatIdx(r.v) === i; } }; })
        : VKEYS.map(function (k) { return { c: vcol(k), t: VTXT[k], test: function (r) { return r.v === k; } }; });
      cats.forEach(function (ct) { ct.pop = 0; ct.n = 0; ids.forEach(function (id) { if (result[id] && ct.test(result[id])) { ct.pop += P[id] || 0; ct.n++; } }); });
      var bar = h('div', { class: 'popbar', role: 'img', 'aria-label': '各類縣市的人口比例' });
      var leg = h('div', { class: 'popbar-legend' });
      cats.forEach(function (ct) {
        if (!ct.pop) return;
        var pct = ct.pop / tot * 100;
        bar.appendChild(h('i', { style: { width: pct.toFixed(2) + '%', background: ct.c }, title: ct.t + '：' + pct.toFixed(0) + '% 的人口' }));
        leg.appendChild(h('span', {}, h('s', { style: { background: ct.c } }), ct.t + '（' + ct.n + ' 縣市）', h('b', {}, pct.toFixed(0) + '%')));
      });
      var msg;
      if (L.metric === 'th') {
        var easyN = 0, easyP = 0, hardP = 0;
        // 收入要在前 50%（門檻 PR 50 以上）才養得起的縣市，住了多少人
        ids.forEach(function (id) { var r = result[id]; if (!r) return; if (r.v != null && r.v <= 40) { easyN++; easyP += P[id] || 0; } if (r.v == null || r.v > 50) hardP += P[id] || 0; });
        var hardPct = Math.round(hardP / tot * 100), easyPct = Math.round(easyP / tot * 100);
        msg = hardPct > 0 ? h('p', { class: 'pop-callout' }, '台灣有', h('b', {}, hardPct + '%'), '的人，住在收入要在前 50%（PR 50 以上）才養得起的縣市。')
          : h('p', { class: 'pop-callout' }, '這組標準下，每個縣市的門檻都在 PR 50 以下：收入在中間的人到哪裡都養得起。');
        if (easyN > 0 && easyN < ids.length && easyPct < 50) popBox.appendChild(h('p', { class: 'sm muted', style: { marginTop: '6px' } }, '22 個縣市裡，有 ' + easyN + ' 個的門檻在 PR 40 以下，但只住了 ' + easyPct + '% 的人。'));
      } else {
        var badP = 0; ids.forEach(function (id) { var r = result[id]; if (r && (r.v === 'fail' || r.v === 'broke')) badP += P[id] || 0; });
        msg = h('p', { class: 'pop-callout' }, '以你們的收入，台灣有', h('b', {}, Math.round(badP / tot * 100) + '%'), '的人住在會被駁回的縣市。');
      }
      popBox.insertBefore(msg, popBox.firstChild);
      popBox.appendChild(h('div', { class: 'sm', style: { marginTop: '12px', fontWeight: 700 } }, '依人口計算'));
      popBox.appendChild(bar); popBox.appendChild(leg);
      popBox.appendChild(h('p', { class: 'xs muted', style: { marginTop: '8px' } }, '人口：內政部戶政司 ' + POPGRID.month.replace('-', ' 年 ').replace(/^(\d+ 年 )0?/, '$1') + ' 月鄉鎮市區人口。每個點代表地圖上的一小格，點的大小依那一格的人口密度（各鄉鎮市區人口 ÷ 面積）。'));
    }
    function showDetail() {
      U.clear(detail);
      var id = L.sel || s.county, r = result[id], c = D.COUNTY[id];
      if (!r) return;
      var x = forCounty(s, id);
      detail.appendChild(h('div', { class: 'card-k' }, id === s.county ? '你設定的縣市' : '點選的縣市'));
      detail.appendChild(h('h2', { style: { fontSize: '22px' } }, c.name));
      var kv = h('dl', { class: 'kv', style: { marginTop: '10px' } });
      var rows = L.metric === 'th'
        ? [['門檻收入', r.v == null ? '再高也不夠' : 'PR ' + U.pr(r.v)], ['生第一胎那年合計年收入', r.gross ? U.wan(r.gross) : '—']]
        : [['審查結果', VTXT[r.v]], [r.minS < 0 ? '最多負債' : '孩子出生後的最低存款', U.wan(r.minS) + '（' + r.minAge + ' 歲）']];
      if (typeof POPGRID !== 'undefined' && POPGRID.pop[id]) rows.push(['人口', U.wan(POPGRID.pop[id]) + '（佔全台 ' + (POPGRID.pop[id] / POPGRID.total * 100).toFixed(1) + '%）']);
      rows = rows.concat([['大樓華廈均價', c.price.toFixed(1) + ' 萬/坪'], ['房價所得比', c.pir + ' 倍'], [QS.roomName(QS.maxRooms(x)) + '月租（約）', U.wan1(E.rentFor(c, QS.maxRooms(x), Math.pow(E.districtMult(x), 0.6)))]]);
      rows.forEach(function (rr) { kv.appendChild(h('dt', {}, rr[0])); kv.appendChild(h('dd', {}, rr[1])); });
      detail.appendChild(kv);
      if (id !== A.s.county) detail.appendChild(h('button', { class: 'btn ghost small', style: { marginTop: '12px' }, onclick: function () { A.undo.push(JSON.parse(JSON.stringify(A.strip(A.s)))); var ns = A.strip(A.s); ns.county = id; ns.district = x.district; A.s = E.normalize(ns); A.dirty = true; A.persist(); A.compute(true); A.go('report'); U.toast('報告已改成' + c.name + '，其他設定不變'); } }, '把我的報告改成' + c.name));
      detail.appendChild(h('hr', { style: { border: 0, borderTop: '1px solid var(--rule-soft)', margin: '18px 0 12px' } }));
    }
    function renderRank() {
      var list = h('div', { class: 'rank' });
      var arr = ids.map(function (id) { return result[id]; });
      if (L.metric === 'th') arr.sort(function (a, b) { return (a.v == null ? 101 : a.v) - (b.v == null ? 101 : b.v); });
      else { var ord = { pass: 0, tight: 1, fail: 2, broke: 3 }; arr.sort(function (a, b) { return ord[a.v] - ord[b.v] || b.minS - a.minS; }); }
      right.appendChild(h('div', { class: 'card-k' }, L.metric === 'th' ? '由易到難' : '由寬裕到困難'));
      arr.forEach(function (r, i) {
        list.appendChild(h('button', { class: 'rank-row' + ((L.sel || s.county) === r.id ? ' sel' : ''), type: 'button', onclick: function () { L.sel = r.id; A.go('lab', { keepScroll: true }); } },
          h('span', { class: 'rn' }, String(i + 1)), h('span', {}, D.COUNTY[r.id].name + (r.id === s.county ? '（你）' : ''), typeof POPGRID !== 'undefined' && POPGRID.pop[r.id] ? h('span', { class: 'rp' }, U.wan(POPGRID.pop[r.id]) + ' 人') : null),
          h('span', { class: 'rv' }, L.metric === 'th' ? (r.v == null ? '>99.9' : U.pr(r.v)) : U.wan(r.minS)), h('s', { style: { background: L.metric === 'th' ? heat(r.v) : vcol(r.v) } })));
      });
      right.appendChild(list);
    }
  }

  // ---------- 世界：各國主要城市（地球＋地球下方的城市列表；右邊是點選城市的詳細資料） ----------
  var A3INV = { JPN: 'JP', KOR: 'KR', FRA: 'FR', CHN: 'CN', USA: 'US', GBR: 'UK', DEU: 'DE', SWE: 'SE', CAN: 'CA' };
  function worldView(left, right, s) {
    var status = h('p', { class: 'sm muted', 'aria-live': 'polite' }, '正在試算各國城市…');
    var mapBox = h('div', { class: 'twmap-wrap' });
    var tip = h('div', { class: 'globe-tip' });
    var cv = h('canvas', { width: 520, height: 520, role: 'img', 'aria-label': '世界點陣地球，各國主要城市依門檻 PR 著色' });
    var gw = h('div', { class: 'globe-wrap' }, cv, tip);
    left.appendChild(h('h2', { style: { fontSize: '20px', marginBottom: '4px' } }, '同樣的標準，換到別的國家要多少收入？'));
    left.appendChild(status);
    left.appendChild(mapBox);
    mapBox.appendChild(gw);
    mapBox.appendChild(h('p', { class: 'globe-hint' }, '拖曳轉動地球，點城市看詳細比較。'));
    left.appendChild(legendEl('th', false));
    var listBox = h('div', { class: 'wd-listbox' });
    left.appendChild(listBox);
    var detail = h('div', { class: 'wd-detail-box' });
    right.appendChild(detail);
    var all = null, marks = [];
    function byKey(k) { for (var i = 0; i < all.length; i++) if (WUI.key(all[i]) === k) return all[i]; return null; }
    function placeTip(x, y) { tip.style.left = x / gw.clientWidth * 100 + '%'; tip.style.top = y / gw.clientHeight * 100 + '%'; tip.classList.add('on'); }
    function drawList() {
      U.clear(listBox);
      listBox.appendChild(h('div', { class: 'card-k', style: { marginTop: '16px' } }, '各國主要城市・由易到難'));
      listBox.appendChild(WUI.list(all, L.wsel, heat, function (k) { select(k, true, true); }));
    }
    function drawDetail() {
      U.clear(detail);
      var r = L.wsel ? byKey(L.wsel) : null;
      if (!r) {
        detail.appendChild(h('div', { class: 'card-k' }, '點選的城市'));
        detail.appendChild(h('p', { class: 'muted', style: { marginTop: '6px' } }, '點地球上的城市，或地球下方列表裡的城市，看那裡的收入門檻、需要的年薪，以及錢都花到哪裡。'));
        return;
      }
      detail.appendChild(WUI.detail(r, all[0], s, heat));
    }
    function select(k, fly, scroll) {
      var r = byKey(k); if (!r) return;
      L.wsel = k;
      marks.forEach(function (m) { m.sel = m.id === k; });
      drawList(); drawDetail();
      if (L.globe) { L.globe.select(WUI.A3[r.cid]); if (fly) { var c = WUI.COORD[r.city]; L.globe.flyTo(c[0], c[1], 1.5, 900); } }
      if (scroll && window.matchMedia('(max-width: 920px)').matches) detail.scrollIntoView({ behavior: U.reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    }
    WUI.rows(s, function (i, n) { status.textContent = '正在試算各國城市…（' + i + '／' + n + '）'; }, function (rows, err) {
      if (!gw.isConnected) return; // 已經離開這一頁
      if (err || !rows) { status.textContent = '這部分暫時算不出來，已記錄下來。'; return; }
      all = rows;
      if (L.wsel && !byKey(L.wsel)) L.wsel = null;
      var tw = all[0], twCol = heat(tw.pr), hi = U.cssVar('--ink-2');
      status.textContent = '顏色是門檻收入 PR，以各國全國同年齡的受僱者計算。';
      marks = all.filter(function (r) { return r.cid !== 'TW'; }).map(function (r) {
        var c = WUI.COORD[r.city];
        return { id: WUI.key(r), lon: c[0], lat: c[1], color: heat(r.pr), label: WUI.cityName(r, true), sel: L.wsel === WUI.key(r) };
      });
      var sel0 = L.wsel ? byKey(L.wsel) : null, c0 = sel0 ? WUI.COORD[sel0.city] : [121, 23.7];
      if (L.globe) { L.globe.destroy(); L.globe = null; }
      L.globe = Globe.create(cv, {
        lon: c0[0], lat: c0[1], zoom: 1.5, auto: false, selected: sel0 ? WUI.A3[sel0.cid] : 'TWN',
        colorFor: function (a3) { return a3 === 'TWN' ? twCol : A3INV[a3] ? hi : null; },
        markers: function () { return marks; },
        onHover: function (c, x, y) {
          if (!c) { tip.classList.remove('on'); return; }
          tip.textContent = c.a3 === 'TWN' ? '台灣・你選的' + tw.name + ' ' + WUI.prText(tw.pr) : A3INV[c.a3] ? c.n + '・點城市看比較' : c.n + '・資料建置中';
          placeTip(x, y);
        },
        onHoverMarker: function (m, x, y) { var r = byKey(m.id); tip.textContent = WUI.cityName(r) + '・' + WUI.prText(r.pr); placeTip(x, y); },
        onPick: function (c) {
          if (c.a3 === 'TWN') { L.level = 'tw'; A.go('lab', { keepScroll: true }); return; }
          var cid = A3INV[c.a3]; if (cid) select(cid + ':' + ENGINE.country(cid).cities[0], true, true);
        },
        onPickMarker: function (m) { select(m.id, false, true); }
      });
      drawList(); drawDetail();
    });
  }

  function curveTab(panel, s) {
    var sec = h('div', { class: 'rsec' });
    sec.appendChild(h('h2', {}, '收入 PR 從 1 到 99，存款會怎麼變？'));
    sec.appendChild(h('p', { class: 'rsec-lede' }, '把' + (s.partner ? '夫妻雙方' : '你') + '的收入 PR 從低往高調，看孩子獨立前「最低的存款」在哪裡跨過零。跨過零的那一點，就是門檻。'));
    var box = h('div'); sec.appendChild(box);
    panel.appendChild(sec);
    U.task(function () {
      var th = E.threshold(s, { quick: true });
      var data = E.curve(s);
      Charts.prCurve(box, data, { threshold: th.pr, me: s.incomeMode === 'full' ? Math.min(s.jobA.pr, s.partner ? s.jobB.pr : 99) : null });
      box.appendChild(h('p', { class: 'sm muted', style: { marginTop: '8px' } }, th.pr == null ? '這組標準，收入再高也不夠。' : '門檻 PR ' + U.pr(th.pr) + '：' + (s.partner ? '夫妻' : '你') + '生第一胎那年合計年收入約 ' + U.wan(th.grossBirth) + '。以現在的收入水準，家庭可支配所得約贏過 ' + U.pr(th.hhPR) + '% 的台灣家庭。'));
    }, 'lab-curve');
    // 熱度表
    var sec2 = h('div', { class: 'rsec' });
    sec2.appendChild(h('h2', {}, '幾個孩子、幾歲生，門檻差多少？'));
    sec2.appendChild(h('p', { class: 'rsec-lede' }, '格子裡是門檻收入 PR；藍框是你目前的設定。其他條件都不變。'));
    var t1 = h('div', { class: 'table-scroll' }, h('p', { class: 'sm muted' }, '計算中…'));
    sec2.appendChild(t1);
    panel.appendChild(sec2);
    var sec3 = h('div', { class: 'rsec' });
    sec3.appendChild(h('h2', {}, '租房、買房，還是住長輩家？'));
    sec3.appendChild(h('p', { class: 'rsec-lede' }, '同一個縣市、同樣的教養標準，只換住的方式。'));
    var t2 = h('div', { class: 'table-scroll' }, h('p', { class: 'sm muted' }, '計算中…'));
    sec3.appendChild(t2);
    panel.appendChild(sec3);
    var ages = []; for (var a = Math.max(s.ageA, 25); ages.length < 5 && a <= 42; a += 3) ages.push(a);
    var cells = [];
    [1, 2, 3, 4].forEach(function (k) { ages.forEach(function (fa) { cells.push({ t: 1, k: k, fa: fa }); }); });
    var hs = [['rent', null, '租屋'], ['buy', 'used', '買中古屋'], ['buy', 'new', '買新成屋'], ['family', null, '住長輩家']];
    hs.forEach(function (x) { [1, 2, 3, 4].forEach(function (k) { cells.push({ t: 2, k: k, hs: x }); }); });
    batch(cells, function (c) {
      var x = E.clone(s); x.kids = c.k;
      if (c.t === 1) x.firstBirthAge = c.fa; else { x.housing = c.hs[0]; if (c.hs[1]) x.build = c.hs[1]; }
      var n = E.normalize(x); n.__norm = true;
      return { c: c, pr: E.threshold(n, { quick: true }).pr };
    }, function (out) {
      var tb1 = h('table', { class: 'heat' });
      var hr = h('tr', {}, h('th', {}, '孩子數＼第一胎年齡'));
      ages.forEach(function (fa) { hr.appendChild(h('th', {}, fa + ' 歲')); });
      tb1.appendChild(hr);
      [1, 2, 3, 4].forEach(function (k) {
        var tr = h('tr', {}, h('th', {}, k + ' 個'));
        ages.forEach(function (fa) {
          var r = out.filter(function (o) { return o.c.t === 1 && o.c.k === k && o.c.fa === fa; })[0];
          tr.appendChild(cell(r.pr, k === s.kids && fa === s.firstBirthAge));
        });
        tb1.appendChild(tr);
      });
      U.clear(t1); t1.appendChild(tb1);
      var tb2 = h('table', { class: 'heat' });
      var hr2 = h('tr', {}, h('th', {}, '住房＼孩子數'));
      [1, 2, 3, 4].forEach(function (k) { hr2.appendChild(h('th', {}, k + ' 個')); });
      tb2.appendChild(hr2);
      hs.forEach(function (x) {
        var tr = h('tr', {}, h('th', {}, x[2]));
        [1, 2, 3, 4].forEach(function (k) {
          var r = out.filter(function (o) { return o.c.t === 2 && o.c.k === k && o.c.hs === x; })[0];
          var me = k === s.kids && s.housing === x[0] && (x[0] !== 'buy' || s.build === x[1]);
          tr.appendChild(cell(r.pr, me));
        });
        tb2.appendChild(tr);
      });
      U.clear(t2); t2.appendChild(tb2);
      t2.appendChild(legendEl('th'));
    });
    function cell(pr, me) {
      var c = heat(pr), dark = onDark(c);
      return h('td', { class: me ? 'me' : '', style: { background: c, color: dark ? '#fff' : '#1b2420' } }, pr == null ? '>99.9' : U.pr(pr));
    }
  }

  function timeTab(panel, s) {
    var H = D.HISTORY, years = H.years, Y0 = years[0], YN = years[years.length - 1];
    var isBuy = s.housing === 'buy';
    var sec = h('div', { class: 'rsec' });
    sec.appendChild(h('div', { class: 'rsec-k' }, '時光機・' + (YN - Y0) + ' 年＝一代人'));
    sec.appendChild(h('h2', {}, '同一組標準，放回 30 年前的台灣'));
    var key = H.sinyiMap[s.county];
    sec.appendChild(h('p', { class: 'rsec-lede' }, '你的父母大約就是在 30 年前生下你。時光機只換掉一件事：把' + (key ? D.COUNTY[s.county].name : '全台') + '的房價換回「當年相對於薪資」的水準。其他花費、補助、稅制和利率都維持今天的樣子，所以比的是：同樣的收入位置，房子相對有多貴。'));
    if (!isBuy) sec.appendChild(h('p', { class: 'qnote' }, '你的設定是' + QS.labelOf('housing', s.housing) + '。時光機只換房價，租金不變，所以這裡一律改成「買房」來比較，其他設定照舊。'));
    var tn = h('div', { class: 'thennow' }, h('p', { class: 'sm muted' }, '計算中…'));
    sec.appendChild(tn);
    panel.appendChild(sec);
    var sec2 = h('div', { class: 'rsec' });
    sec2.appendChild(h('h2', {}, '每 5 年一格：門檻與生育率'));
    var chartBox = h('div', { class: 'chart-box' });
    sec2.appendChild(chartBox);
    var grid = h('div', { class: 'era', style: { marginTop: '18px' } });
    sec2.appendChild(grid);
    panel.appendChild(sec2);
    var sec3 = h('div', { class: 'rsec' });
    panel.appendChild(sec3);
    var x = E.clone(s); x.housing = 'buy'; x = E.normalize(x); x.__norm = true;
    var c = D.COUNTY[x.county], wage26 = H.realWage[YN] * H.cpi[YN] / 100 * 12;
    batch(years, function (y) {
      var rel = E.eraRel(x, y), yrs = c.price * 1e4 * 30 * rel / wage26; // 在 withEra 之外計算（裡面的房價已換算過）
      return E.withEra(function () {
        var t = E.threshold(x, { quick: true });
        var need = t.pr == null ? null : E.grossAt({ industry: x.jobA.industry, pr: t.pr, mode: 'pr' }, x.ageA);
        var med = E.grossAt({ industry: x.jobA.industry, pr: 50, mode: 'pr' }, x.ageA);
        var w = E.waitAge(x, { pr: 50 });
        var sim = E.simulate(x);
        return { y: y, pr: t.pr, mult: need ? need / med : null, price: sim.house ? sim.house.total : null, earliest: w.earliest, rel: rel, yrs: yrs };
      }, x, y);
    }, function (out) {
      var first = out[0], last = out[out.length - 1];
      // 30 年前 vs 現在
      U.clear(tn);
      var prT = function (o) { return o.pr == null ? '再高也不夠' : 'PR ' + U.pr(o.pr); };
      var eT = function (o) { return o.earliest == null ? '存一輩子也生不起' : o.earliest <= x.ageA ? '現在就生得起' : o.earliest + ' 歲'; };
      var rows = [
        ['門檻收入', prT(first), prT(last), (first.pr || 100) < (last.pr || 100)],
        ['收入要是同齡中位數的', first.mult ? first.mult.toFixed(1) + ' 倍' : '—', last.mult ? last.mult.toFixed(1) + ' 倍' : '—', (first.mult || 9) < (last.mult || 9)],
        ['收入在中間的' + (x.partner ? '夫妻' : '人') + '，最早幾歲生得起', eT(first), eT(last), (first.earliest || 99) < (last.earliest || 99)],
        [c.name + ' 30 坪的房子，等於幾年的全台平均薪資', first.yrs.toFixed(0) + ' 年', last.yrs.toFixed(0) + ' 年', true],
        ['總生育率（每位女性一生平均生幾個）', String(H.tfr[Y0]), String(H.tfr[YN]), true],
        ['一年出生的嬰兒', U.wan(H.births[Y0]) + '人', U.wan(H.births[YN]) + '人', true]
      ];
      var tb = h('div', { class: 'tn-grid', role: 'table', 'aria-label': '30 年前與現在的比較' },
        h('div', { class: 'tn-h', role: 'row' }, h('span', { role: 'columnheader' }), h('span', { role: 'columnheader' }, Y0 + '・30 年前', H.est[Y0] ? h('small', {}, '房價為估計') : null), h('span', { role: 'columnheader', class: 'now' }, YN + '・現在')));
      rows.forEach(function (r) { tb.appendChild(h('div', { class: 'tn-r', role: 'row' }, h('span', { role: 'rowheader' }, r[0]), h('b', { role: 'cell' }, r[1]), h('b', { role: 'cell', class: 'now' + (r[3] ? ' worse' : '') }, r[2]))); });
      tn.appendChild(tb);
      tn.appendChild(h('p', { class: 'sm', style: { marginTop: '12px', color: 'var(--ink-2)' } }, '30 年來實質薪資只多了 ' + Math.round((H.realWage[YN] / H.realWage[Y0] - 1) * 100) + '%，' + (key ? c.name : '全台') + '的實質房價卻變成 ' + (E.timeMachine(x, Y0).priceF ? (1 / E.timeMachine(x, Y0).priceF).toFixed(1) : '—') + ' 倍。'));
      // 圖：門檻 PR（線）與總生育率（柱）
      drawEra(chartBox, out);
      // 每 5 年一格
      U.clear(grid);
      out.forEach(function (o, i) {
        grid.appendChild(h('div', { class: (o.y === YN ? 'now' : '') + (i === 0 ? ' first' : '') },
          h('span', { class: 'ey' }, String(o.y), o.y === YN ? h('small', {}, '現在') : i === 0 ? h('small', {}, '30 年前' + (H.est[o.y] ? '・估' : '')) : null),
          h('span', { class: 'ev' }, o.pr == null ? '>99.9' : 'PR ' + U.pr(o.pr)),
          h('span', { class: 'ed' }, o.mult ? '中位數的 ' + o.mult.toFixed(1) + ' 倍' : '再高的收入也不夠'),
          h('span', { class: 'ed' }, o.earliest == null ? '中間收入生不起' : '中間收入 ' + o.earliest + ' 歲可生'),
          h('span', { class: 'ed' }, '30 坪＝' + o.yrs.toFixed(0) + ' 年薪資'),
          h('span', { class: 'ed' }, '生育率 ' + H.tfr[o.y])));
      });
      // 說明
      sec3.appendChild(h('h2', {}, '這樣比，公平嗎？'));
      var ul = h('ul', { class: 'notes' });
      ul.appendChild(h('li', {}, '只有房價換成當年「相對於薪資」的水準；其餘支出、收入位置、補助、稅制、房貸利率都用今天的。所以 30 年前的數字是「假如當年就有今天的補助與利率」，實際上當年的房貸利率更高（1996 年約 7–8%），補助也少很多。'));
      ul.appendChild(h('li', {}, '房價：信義房價指數年平均，扣除通膨' + (key ? '（' + c.name + (key !== x.county ? '，套用' + D.COUNTY[key].name + '指數' : '') + '）' : '（你的縣市沒有獨立指數，套用全台指數）') + '。指數從 2001 年開始，1996 年依信義房屋 1995 年每坪均價推估，所以標示為估計。'));
      ul.appendChild(h('li', {}, '薪資：工業及服務業每人每月總薪資（含年終與加班），以消費者物價指數換成實質。房價所得比、總生育率與出生數來自內政部。2026 年的生育率與出生數是 2025 年的數字。'));
      sec3.appendChild(ul);
      sec3.appendChild(h('h3', { style: { fontSize: '16px', margin: '18px 0 8px' } }, '這 30 年才有的育兒支持'));
      var pl = h('div', { class: 'policy-tl' });
      H.newPolicies.slice().sort(function (a, b) { return a[1] - b[1]; }).forEach(function (p) { pl.appendChild(h('div', {}, h('b', {}, String(p[1])), h('span', {}, p[0]))); });
      sec3.appendChild(pl);
      var higher = (last.pr == null ? 100 : last.pr) > (first.pr == null ? 100 : first.pr) + 0.4;
      sec3.appendChild(h('p', { class: 'xs muted', style: { marginTop: '10px' } }, '這些補助在 ' + Y0 + ' 年都還沒有，但時光機為了只比房價，仍把它們算進每個年代。' + (higher ? '即使如此，現在的門檻還是比 30 年前高。' : '')));
    }, function (i, n) { if (tn.firstChild && tn.firstChild.tagName === 'P') tn.firstChild.textContent = '計算各年代中… ' + i + '／' + n; });
  }
  // 兩張上下對齊的小圖（不用雙 Y 軸）：上＝門檻 PR，下＝總生育率
  function drawEra(box, out) {
    var H = D.HISTORY;
    var Wd = Math.max(320, Math.min(1100, Math.round(box.clientWidth || 660))), L = 44, R = 16;
    var p1 = { top: 46, h: Wd < 480 ? 120 : 150 }, p2 = { top: 0, h: Wd < 480 ? 92 : 110 };
    p2.top = p1.top + p1.h + 56;
    var Hd = p2.top + p2.h + 30, pw = Wd - L - R, n = out.length, step = pw / n;
    var X = function (i) { return L + step * (i + 0.5); };
    var Y1 = function (p) { return p1.top + (1 - p / 100) * p1.h; }, Y2 = function (t) { return p2.top + (1 - t / 2) * p2.h; };
    var svg = U.svg('svg', { viewBox: '0 0 ' + Wd + ' ' + Hd, role: 'img', 'aria-label': '各年代的門檻 PR 與總生育率' });
    // 上：門檻 PR
    svg.appendChild(U.svg('text', { x: 0, y: 14, class: 'era-t', text: '養得起所需的收入 PR' }));
    [0, 50, 100].forEach(function (p) {
      svg.appendChild(U.svg('line', { x1: L, x2: Wd - R, y1: Y1(p), y2: Y1(p), stroke: 'var(--rule-faint)' }));
      svg.appendChild(U.svg('text', { x: L - 8, y: Y1(p) + 4, 'text-anchor': 'end', text: String(p) }));
    });
    var pts = out.map(function (o, i) { return [X(i), Y1(o.pr == null ? 100 : o.pr)]; });
    svg.appendChild(U.svg('path', { d: 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L'), fill: 'none', stroke: 'var(--seal)', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    out.forEach(function (o, i) {
      var g = U.svg('g', {});
      g.appendChild(U.svg('circle', { cx: pts[i][0], cy: pts[i][1], r: 4.5, fill: 'var(--sheet)', stroke: 'var(--seal)', 'stroke-width': 2 }));
      g.appendChild(U.svg('text', { x: pts[i][0], y: pts[i][1] - 10, 'text-anchor': 'middle', class: 'era-v', text: o.pr == null ? '>99.9' : U.pr(o.pr) }));
      g.appendChild(U.svg('title', { text: o.y + ' 年：門檻 PR ' + (o.pr == null ? '>99.9' : U.pr(o.pr)) }));
      svg.appendChild(g);
    });
    // 下：總生育率
    svg.appendChild(U.svg('text', { x: 0, y: p2.top - 26, class: 'era-t', text: '總生育率（每位女性一生平均生幾個）' }));
    [0, 1, 2].forEach(function (t) {
      svg.appendChild(U.svg('line', { x1: L, x2: Wd - R, y1: Y2(t), y2: Y2(t), stroke: t ? 'var(--rule-faint)' : 'var(--rule)' }));
      svg.appendChild(U.svg('text', { x: L - 8, y: Y2(t) + 4, 'text-anchor': 'end', text: t.toFixed(1) }));
    });
    var bw = Math.min(40, step * 0.5);
    out.forEach(function (o, i) {
      var t = H.tfr[o.y], y = Y2(t), x = X(i) - bw / 2, hh = Y2(0) - y;
      // 柱子上緣圓角、底部貼齊基線
      svg.appendChild(U.svg('path', { d: 'M' + x + ' ' + Y2(0) + 'V' + (y + 4) + 'Q' + x + ' ' + y + ' ' + (x + 4) + ' ' + y + 'H' + (x + bw - 4) + 'Q' + (x + bw) + ' ' + y + ' ' + (x + bw) + ' ' + (y + 4) + 'V' + Y2(0) + 'Z', fill: 'var(--pen)', opacity: o.y === out[out.length - 1].y ? 1 : .55 },
        U.svg('title', { text: o.y + ' 年：總生育率 ' + t })));
      svg.appendChild(U.svg('text', { x: X(i), y: y - 6, 'text-anchor': 'middle', class: 'era-v pen', text: String(t) }));
      svg.appendChild(U.svg('text', { x: X(i), y: Hd - 8, 'text-anchor': 'middle', text: String(o.y) }));
    });
    box.appendChild(svg);
  }

  function crowdTab(panel, s) {
    var st = COMM.st, S = st.stats;
    var sec = h('div', { class: 'rsec' });
    sec.appendChild(h('h2', {}, '所有人的門檻分布'));
    panel.appendChild(sec);
    if (!st.db || (st.backend === 'web' && st.loadErr)) { sec.appendChild(h('div', { class: 'empty' }, h('b', {}, st.backend === 'web' ? '暫時連不上資料庫' : '這個檢視無法讀取共享資料'), st.backend === 'web' ? '請稍後再試；你的試算不受影響。' : '在 claude.ai 登入後開啟，就能看到大家分享的資料。')); return; }
    if (st.demoOn) sec.appendChild(h('p', { class: 'xs muted demo-note', style: { marginBottom: '10px' } }, COMM.demoNote()));
    if (!S || S.n < COMM.MIN_N) { sec.appendChild(h('div', { class: 'empty' }, h('b', {}, '目前只有 ' + (S ? S.n : 0) + ' 人分享'), '累積到 ' + COMM.MIN_N + ' 人以上就會顯示。完成試算時選擇「匿名分享」，就能加入統計。')); return; }
    var th = A.th && A.th.pr;
    var bins = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    (S.thHist || []).forEach(function (c, v) { bins[Math.min(10, Math.floor(v / 10))] += c; });
    var mx = Math.max.apply(null, bins.concat([1]));
    var Wd = 640, Hh = 200, bw = Wd / 11;
    var svg = U.svg('svg', { viewBox: '0 0 ' + Wd + ' ' + (Hh + 30), role: 'img', 'aria-label': '大家的門檻 PR 分布' });
    bins.forEach(function (n, i) {
      var hh = n / mx * (Hh - 20), mine = th != null && Math.min(10, Math.floor(th / 10)) === i;
      svg.appendChild(U.svg('rect', { x: i * bw + 4, y: Hh - hh, width: bw - 8, height: Math.max(1, hh), rx: 3, fill: mine ? 'var(--pen)' : 'var(--rule)' }));
      svg.appendChild(U.svg('text', { x: i * bw + bw / 2, y: Hh + 18, 'text-anchor': 'middle', text: i === 10 ? '100' : (i * 10) + '–', style: 'font-size:11px;fill:var(--ink-3)' }));
      if (n) svg.appendChild(U.svg('text', { x: i * bw + bw / 2, y: Hh - hh - 6, 'text-anchor': 'middle', text: String(n), style: 'font-size:11px;fill:var(--ink-2)' }));
    });
    sec.appendChild(h('p', { class: 'rsec-lede' }, S.n + ' 位分享者，各自心中的養育標準需要的收入 PR。藍色是你所在的區間。'));
    sec.appendChild(h('div', { class: 'chart-box' }, svg));
    // 各縣市
    var byC = S.byCounty || {};
    var rows = Object.keys(byC).filter(function (k) { return D.COUNTY[k] && byC[k].n >= 3; }).map(function (k) { return [k, byC[k].med, byC[k].n]; }).sort(function (a, b) { return a[1] - b[1]; });
    if (rows.length) {
      var sec2 = h('div', { class: 'rsec' });
      sec2.appendChild(h('h2', {}, '各縣市分享者的門檻中位數'));
      var b = h('div', { class: 'bars' });
      rows.forEach(function (r) { b.appendChild(h('div', { class: 'bar-row' }, h('span', { class: 'bl' }, D.COUNTY[r[0]].name + '（' + r[2] + '）'), h('span', { class: 'bt' }, h('i', { style: { width: r[1] + '%', background: heat(r[1]) } })), h('span', { class: 'bv' }, 'PR ' + U.pr(r[1])))); });
      sec2.appendChild(b);
      panel.appendChild(sec2);
    }
  }

  function manageModal() {
    U.modal(function (box, close) {
      box.appendChild(h('h3', {}, '管理存檔'));
      ['expense', 'income'].forEach(function (kind) {
        box.appendChild(h('p', { style: { fontWeight: 700, marginTop: '12px' } }, kind === 'expense' ? '支出設定' : '收入設定'));
        var list = profiles(kind);
        if (!list.length) box.appendChild(h('p', { class: 'sm muted' }, '還沒有存檔。'));
        list.forEach(function (p) {
          box.appendChild(h('div', { class: 'src' }, h('span', { style: { color: 'var(--ink)' } }, p.name), p.auto ? h('span', {}, '自動') : h('button', { class: 'linkbtn', onclick: function () { A.deleteProfile(kind, p.id); close(); manageModal(); } }, '刪除')));
        });
      });
      box.appendChild(h('div', { class: 'actions' }, h('button', { class: 'btn', onclick: function () { close(); A.go('lab', { keepScroll: true }); } }, '完成')));
    });
  }
})();
