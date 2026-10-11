/* =========================================================================
   CHARTS — 手寫 SVG 圖表（現金流、門檻曲線、出生數點陣）
   ========================================================================= */
var Charts = (function () {
  'use strict';
  var S = U.svg;
  function niceStep(span, count) {
    var raw = span / Math.max(1, count), mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  }
  function ticks(min, max, count) {
    if (min === max) { min -= 1; max += 1; }
    var st = niceStep(max - min, count), a = Math.floor(min / st) * st, b = Math.ceil(max / st) * st, out = [];
    for (var v = a; v <= b + st * 0.5; v += st) out.push(Math.abs(v) < st * 1e-6 ? 0 : v);
    return out;
  }
  function moneyTick(v) {
    var a = Math.abs(v);
    if (a >= 1e8) return (v / 1e8).toFixed(a % 1e8 === 0 ? 0 : 1) + '億';
    if (a >= 1e4) return Math.round(v / 1e4).toLocaleString('en-US') + '萬';
    return v === 0 ? '0' : Math.round(v).toLocaleString('en-US');
  }
  var EVT = { birth: function (e) { return '第' + e.n + '胎出生'; }, buy: function () { return '買房'; }, kg: function (e) { return '老' + U.cn(e.n) + '上幼兒園'; }, es: function (e) { return '老' + U.cn(e.n) + '上小學'; }, jh: function (e) { return '老' + U.cn(e.n) + '上國中'; }, sh: function (e) { return '老' + U.cn(e.n) + '上高中'; }, uni: function (e) { return '老' + U.cn(e.n) + '上大學'; }, master: function (e) { return '老' + U.cn(e.n) + '讀研究所'; }, abroad: function (e) { return '老' + U.cn(e.n) + '出國留學'; }, indep: function (e) { return '老' + U.cn(e.n) + '獨立'; }, car: function () { return '買車'; }, car2: function () { return '換車'; }, grace: function () { return '房貸寬限期結束'; }, quit: function (e) { return (e.who === 'A' ? '你' : '伴侶') + '離職照顧'; }, back: function (e) { return (e.who === 'A' ? '你' : '伴侶') + '回到職場'; } };
  function evtText(e) { return typeof e === 'string' ? e : (EVT[e.k] ? EVT[e.k](e) : ''); }
  function income(y) { return y.gross - y.si - y.tax + y.transfers + y.gift; }
  function expense(y) { return y.expTotal - y.exp.debtInterest; }

  // ---- 人生現金流（上：存款；下：每年收入與支出） ----
  function cashflow(host, res, opts) {
    opts = opts || {};
    U.clear(host);
    host.classList.add('chart-box');
    var tip = U.h('div', { class: 'chart-tip', role: 'status' });
    var years = res.years.slice(0, Math.max(res.Tv + 6, Math.min(res.years.length, 65 - res.s.ageA)));
    var par = opts.parallel && res.parallel ? res.parallel.years.slice(0, years.length) : null;
    var Wd = Math.max(300, host.clientWidth || 700), narrow = Wd < 560;
    var m = { l: narrow ? 46 : 58, r: 14, t: 14 }, h1 = narrow ? 200 : 240, gap = 34, h2 = narrow ? 110 : 130, xb = 26;
    var Ht = m.t + h1 + gap + h2 + xb;
    var root = S('svg', { viewBox: '0 0 ' + Wd + ' ' + Ht, role: 'img', 'aria-label': '存款與收支隨年齡變化圖' });
    var x0 = years[0].ageA, x1 = years[years.length - 1].ageA;
    var X = function (age) { return m.l + (age - x0) / Math.max(1, x1 - x0) * (Wd - m.l - m.r); };
    var sv = years.map(function (y) { return y.S; }).concat([res.s.savings]);
    if (par) sv = sv.concat(par.map(function (y) { return y.S; }));
    var smin = Math.min(0, Math.min.apply(null, sv)), smax = Math.max(0, Math.max.apply(null, sv));
    var ty = ticks(smin, smax, narrow ? 4 : 5); smin = ty[0]; smax = ty[ty.length - 1];
    var Y1 = function (v) { return m.t + h1 - (v - smin) / (smax - smin) * h1; };
    var fl = years.map(function (y) { return Math.max(income(y), expense(y)); });
    var fmax = Math.max.apply(null, fl), ty2 = ticks(0, fmax, 3); fmax = ty2[ty2.length - 1];
    var top2 = m.t + h1 + gap;
    var Y2 = function (v) { return top2 + h2 - v / fmax * h2; };
    var col = { inc: 'var(--s-income)', exp: 'var(--s-expense)', sav: 'var(--s-save)', alt: 'var(--s-alt)', neg: 'var(--seal)' };

    // 孩子獨立後的區域
    var tvAge = res.s.ageA + res.Tv;
    if (tvAge < x1) {
      root.appendChild(S('rect', { x: X(tvAge), y: m.t, width: X(x1) - X(tvAge), height: h1 + gap + h2, fill: 'var(--sheet-2)' }));
      var nearEnd = X(x1) - X(tvAge) < 90;
      root.appendChild(S('text', { x: nearEnd ? X(x1) - 4 : X(tvAge) + 6, y: m.t + 12, 'text-anchor': nearEnd ? 'end' : 'start', text: '孩子都獨立了', style: 'font-size:11px' }));
    }
    // 格線與軸
    ty.forEach(function (v) {
      root.appendChild(S('line', { x1: m.l, x2: Wd - m.r, y1: Y1(v), y2: Y1(v), stroke: v === 0 ? 'var(--axis)' : 'var(--grid)', 'stroke-width': v === 0 ? 1.4 : 1 }));
      root.appendChild(S('text', { x: m.l - 8, y: Y1(v) + 4, 'text-anchor': 'end', text: moneyTick(v) }));
    });
    ty2.forEach(function (v) {
      root.appendChild(S('line', { x1: m.l, x2: Wd - m.r, y1: Y2(v), y2: Y2(v), stroke: v === 0 ? 'var(--axis)' : 'var(--grid)', 'stroke-width': 1 }));
      root.appendChild(S('text', { x: m.l - 8, y: Y2(v) + 4, 'text-anchor': 'end', text: moneyTick(v) }));
    });
    root.appendChild(S('text', { x: Wd - m.r, y: m.t + h1 + 22, 'text-anchor': 'end', text: '每年收入與支出', style: 'font-size:11.5px;font-weight:700;fill:var(--ink-2)' }));
    var stepX = narrow ? 10 : 5;
    for (var a = Math.ceil(x0 / stepX) * stepX; a <= x1; a += stepX) {
      root.appendChild(S('text', { x: X(a), y: Ht - 8, 'text-anchor': 'middle', text: a + '歲' }));
      root.appendChild(S('line', { x1: X(a), x2: X(a), y1: Y2(0), y2: Y2(0) + 4, stroke: 'var(--axis)' }));
    }
    // 存款面積（正：淡墨；負：淡紅）
    var pts = [[x0 - 0.0001, res.s.savings]].concat(years.map(function (y) { return [y.ageA + 1, y.S]; }));
    pts = pts.filter(function (p) { return p[0] <= x1 + 1; }).map(function (p) { return [Math.min(p[0], x1), p[1]]; });
    function path(arr, X_, Y_) { return arr.map(function (p, i) { return (i ? 'L' : 'M') + X_(p[0]).toFixed(1) + ',' + Y_(p[1]).toFixed(1); }).join(''); }
    var areaD = path(pts, X, Y1) + 'L' + X(pts[pts.length - 1][0]).toFixed(1) + ',' + Y1(0) + 'L' + X(pts[0][0]).toFixed(1) + ',' + Y1(0) + 'Z';
    var uid = 'c' + Math.random().toString(36).slice(2, 7);
    var defs = S('defs', {},
      S('clipPath', { id: uid + 'p' }, S('rect', { x: 0, y: 0, width: Wd, height: Y1(0) })),
      S('clipPath', { id: uid + 'n' }, S('rect', { x: 0, y: Y1(0), width: Wd, height: Ht })));
    root.appendChild(defs);
    root.appendChild(S('path', { d: areaD, fill: 'var(--s-save)', 'fill-opacity': '0.08', 'clip-path': 'url(#' + uid + 'p)' }));
    root.appendChild(S('path', { d: areaD, fill: 'var(--seal)', 'fill-opacity': '0.16', 'clip-path': 'url(#' + uid + 'n)' }));
    if (par) {
      var pp = [[x0 - 0.0001, res.s.savings]].concat(par.map(function (y) { return [y.ageA + 1, y.S]; })).filter(function (p) { return p[0] <= x1 + 1; }).map(function (p) { return [Math.min(p[0], x1), p[1]]; });
      root.appendChild(S('path', { d: path(pp, X, Y1), fill: 'none', stroke: col.alt, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    }
    root.appendChild(S('path', { d: path(pts, X, Y1), fill: 'none', stroke: col.sav, 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    // 收支線（以每年中點繪製）
    var inc = years.map(function (y) { return [y.ageA + 0.5, income(y)]; }), exp = years.map(function (y) { return [y.ageA + 0.5, expense(y)]; });
    var clipX = function (arr) { return arr.filter(function (p) { return p[0] <= x1; }); };
    root.appendChild(S('path', { d: path(clipX(exp), X, Y2), fill: 'none', stroke: col.exp, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    root.appendChild(S('path', { d: path(clipX(inc), X, Y2), fill: 'none', stroke: col.inc, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    // 最低點標記
    if (res.minS < 0 || opts.markMin) {
      var my = years[res.minT];
      if (my && my.ageA + 1 <= x1) {
        var mx = X(my.ageA + 1), myy = Y1(my.S);
        root.appendChild(S('circle', { cx: mx, cy: myy, r: 5, fill: res.minS < 0 ? col.neg : col.sav, stroke: 'var(--sheet)', 'stroke-width': 2 }));
        var lab = (res.minS < 0 ? '最多負債 ' : '最低 ') + U.wan(Math.abs(res.minS), { plain: true });
        var tx = Math.min(Wd - m.r - 4, Math.max(m.l + 60, mx));
        root.appendChild(S('text', { x: tx, y: myy + (res.minS < 0 ? 20 : -10), 'text-anchor': mx > Wd * 0.7 ? 'end' : 'middle', text: lab, style: 'font-size:12px;font-weight:700;fill:' + (res.minS < 0 ? 'var(--seal-ink)' : 'var(--ink)') }));
      }
    }
    if (res.firstNeg >= 0 && res.firstNeg !== res.minT) {
      var fy = years[res.firstNeg];
      if (fy) root.appendChild(S('circle', { cx: X(fy.ageA + 1), cy: Y1(fy.S), r: 4, fill: 'var(--sheet)', stroke: col.neg, 'stroke-width': 2 }));
    }
    // 事件標記（出生、買房）
    years.forEach(function (y) {
      y.events.forEach(function (e) {
        if (e.k !== 'birth' && e.k !== 'buy') return;
        var ex = X(y.ageA + 0.5), ey = Y2(0) + 13;
        if (e.k === 'birth') {
          root.appendChild(S('circle', { cx: ex, cy: m.t + h1 + 6, r: 7.5, fill: 'var(--pen)' }));
          root.appendChild(S('text', { x: ex, y: m.t + h1 + 9.5, 'text-anchor': 'middle', text: String(e.n), style: 'fill:var(--sheet);font-size:10px;font-weight:700' }));
        } else {
          root.appendChild(S('rect', { x: ex - 13, y: m.t + h1 - 1, width: 26, height: 15, rx: 3, fill: 'var(--ink)' }));
          root.appendChild(S('text', { x: ex, y: m.t + h1 + 10, 'text-anchor': 'middle', text: '買房', style: 'fill:var(--sheet);font-size:9.5px;font-weight:700' }));
        }
      });
    });
    // 十字線
    var cross = S('line', { y1: m.t, y2: top2 + h2, stroke: 'var(--ink-3)', 'stroke-width': 1, opacity: 0 });
    var dotS = S('circle', { r: 4.5, fill: col.sav, stroke: 'var(--sheet)', 'stroke-width': 2, opacity: 0 });
    var dotI = S('circle', { r: 4, fill: col.inc, stroke: 'var(--sheet)', 'stroke-width': 2, opacity: 0 });
    var dotE = S('circle', { r: 4, fill: col.exp, stroke: 'var(--sheet)', 'stroke-width': 2, opacity: 0 });
    [cross, dotS, dotI, dotE].forEach(function (n) { root.appendChild(n); });
    var hit = S('rect', { x: m.l, y: m.t, width: Wd - m.l - m.r, height: h1 + gap + h2, fill: 'transparent', tabindex: 0, 'aria-label': '移動以檢視各年數字' });
    root.appendChild(hit);
    var cur = -1;
    function showAt(i) {
      if (i < 0 || i >= years.length) return;
      cur = i;
      var y = years[i], cx = X(y.ageA + 0.5);
      if (y.ageA > x1) return;
      cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.setAttribute('opacity', 1);
      dotS.setAttribute('cx', X(Math.min(y.ageA + 1, x1))); dotS.setAttribute('cy', Y1(y.S)); dotS.setAttribute('opacity', 1);
      dotS.setAttribute('fill', y.S < 0 ? col.neg : col.sav);
      dotI.setAttribute('cx', cx); dotI.setAttribute('cy', Y2(income(y))); dotI.setAttribute('opacity', 1);
      dotE.setAttribute('cx', cx); dotE.setAttribute('cy', Y2(expense(y))); dotE.setAttribute('opacity', 1);
      U.clear(tip);
      tip.appendChild(U.h('div', { class: 'tt-h' }, (y.ageA) + ' 歲（' + y.year + ' 年）'));
      var rows = [['var(--s-save)', '年底存款', U.wan(y.S)], ['var(--s-income)', '收入（稅後＋補助）', U.wan(income(y))], ['var(--s-expense)', '支出', U.wan(expense(y))]];
      if (par && par[i]) rows.splice(1, 0, ['var(--s-alt)', '不生小孩的存款', U.wan(par[i].S)]);
      if (y.exp.debtInterest > 0) rows.push(['var(--seal)', '借款利息', U.wan(y.exp.debtInterest)]);
      rows.forEach(function (r) { var ii = U.h('i'); ii.style.background = r[0]; tip.appendChild(U.h('div', { class: 'tt-r' }, ii, U.h('span', {}, r[1]), U.h('b', {}, r[2]))); });
      var ev = y.events.map(evtText).filter(Boolean);
      if (y.kids.length) ev.unshift('孩子 ' + y.kids.filter(function (k) { return k < res.endAge; }).map(function (k) { return k + '歲'; }).join('、'));
      if (ev.length) tip.appendChild(U.h('div', { class: 'tt-e' }, ev.join('・')));
      var bw = host.clientWidth, px = cx / Wd * bw;
      tip.style.left = Math.min(bw - 200, Math.max(0, px + (px > bw / 2 ? -214 : 14))) + 'px';
      tip.style.top = '10px';
      tip.classList.add('on');
    }
    function hide() { cross.setAttribute('opacity', 0); dotS.setAttribute('opacity', 0); dotI.setAttribute('opacity', 0); dotE.setAttribute('opacity', 0); tip.classList.remove('on'); }
    hit.addEventListener('pointermove', function (e) {
      var r = root.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * Wd;
      var age = x0 + (px - m.l) / (Wd - m.l - m.r) * (x1 - x0);
      showAt(Math.max(0, Math.min(years.length - 1, Math.floor(age - x0))));
    });
    hit.addEventListener('pointerleave', hide);
    hit.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { showAt(Math.min(years.length - 1, cur + 1)); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { showAt(Math.max(0, cur - 1)); e.preventDefault(); }
    });
    hit.addEventListener('blur', hide);
    host.appendChild(root);
    host.appendChild(tip);
    if (!host._ro) {
      var lastW = Wd;
      host._ro = new ResizeObserver(U.debounce(function () { var w = host.clientWidth; if (Math.abs(w - lastW) > 30 && host._redraw) { lastW = w; host._redraw(); } }, 120));
      host._ro.observe(host);
    }
    host._redraw = function () { cashflow(host, res, opts); };
  }

  // ---- 門檻曲線：PR → 最低存款 ----
  function prCurve(host, data, opts) {
    opts = opts || {};
    U.clear(host); host.classList.add('chart-box');
    var tip = U.h('div', { class: 'chart-tip' });
    var Wd = Math.max(300, host.clientWidth || 600), narrow = Wd < 560;
    var m = { l: narrow ? 50 : 62, r: 16, t: 16, b: 40 }, h = narrow ? 220 : 260;
    var root = S('svg', { viewBox: '0 0 ' + Wd + ' ' + (h + m.t + m.b), role: 'img', 'aria-label': '收入 PR 與最低存款的關係' });
    var X = function (p) { return m.l + p / 100 * (Wd - m.l - m.r); };
    var vals = data.map(function (d) { return d.minS; });
    var lo = Math.min(0, Math.min.apply(null, vals)), hi = Math.max(0, Math.max.apply(null, vals));
    var ty = ticks(lo, hi, 5); lo = ty[0]; hi = ty[ty.length - 1];
    var Y = function (v) { return m.t + h - (v - lo) / (hi - lo) * h; };
    ty.forEach(function (v) {
      root.appendChild(S('line', { x1: m.l, x2: Wd - m.r, y1: Y(v), y2: Y(v), stroke: v === 0 ? 'var(--axis)' : 'var(--grid)', 'stroke-width': v === 0 ? 1.5 : 1 }));
      root.appendChild(S('text', { x: m.l - 8, y: Y(v) + 4, 'text-anchor': 'end', text: moneyTick(v) }));
    });
    [0, 20, 40, 60, 80, 100].forEach(function (p) { root.appendChild(S('text', { x: X(p), y: m.t + h + 20, 'text-anchor': 'middle', text: 'PR ' + p })); });
    root.appendChild(S('text', { x: Wd - m.r, y: m.t + h + 36, 'text-anchor': 'end', text: '收入 PR（同產業、同年齡）', style: 'font-size:11px' }));
    // 負值區塊底色
    root.appendChild(S('rect', { x: m.l, y: Y(0), width: Wd - m.l - m.r, height: Math.max(0, Y(lo) - Y(0)), fill: 'var(--seal)', 'fill-opacity': 0.05 }));
    var d = data.map(function (p, i) { return (i ? 'L' : 'M') + X(p.p).toFixed(1) + ',' + Y(p.minS).toFixed(1); }).join('');
    root.appendChild(S('path', { d: d, fill: 'none', stroke: 'var(--s-income)', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }));
    if (opts.threshold != null) {
      var tx = X(opts.threshold);
      root.appendChild(S('line', { x1: tx, x2: tx, y1: m.t, y2: m.t + h, stroke: 'var(--seal)', 'stroke-width': 1.5 }));
      root.appendChild(S('circle', { cx: tx, cy: Y(0), r: 5.5, fill: 'var(--seal)', stroke: 'var(--sheet)', 'stroke-width': 2 }));
      root.appendChild(S('text', { x: tx + (tx > Wd * 0.75 ? -8 : 8), y: m.t + 14, 'text-anchor': tx > Wd * 0.75 ? 'end' : 'start', text: '門檻 PR ' + U.pr(opts.threshold), style: 'font-size:12.5px;font-weight:700;fill:var(--seal-ink)' }));
    }
    if (opts.me != null) {
      var mx = X(opts.me);
      root.appendChild(S('line', { x1: mx, x2: mx, y1: m.t + 20, y2: m.t + h, stroke: 'var(--pen)', 'stroke-width': 1.5 }));
      root.appendChild(S('text', { x: mx + (mx > Wd * 0.75 ? -8 : 8), y: m.t + 40, 'text-anchor': mx > Wd * 0.75 ? 'end' : 'start', text: '你們 PR ' + U.pr(opts.me), style: 'font-size:12.5px;font-weight:700;fill:var(--pen)' }));
    }
    var dot = S('circle', { r: 4.5, fill: 'var(--s-income)', stroke: 'var(--sheet)', 'stroke-width': 2, opacity: 0 });
    root.appendChild(dot);
    var hit = S('rect', { x: m.l, y: m.t, width: Wd - m.l - m.r, height: h, fill: 'transparent' });
    root.appendChild(hit);
    hit.addEventListener('pointermove', function (e) {
      var r = root.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * Wd, p = (px - m.l) / (Wd - m.l - m.r) * 100;
      var best = data[0]; data.forEach(function (q) { if (Math.abs(q.p - p) < Math.abs(best.p - p)) best = q; });
      dot.setAttribute('cx', X(best.p)); dot.setAttribute('cy', Y(best.minS)); dot.setAttribute('opacity', 1);
      U.clear(tip);
      tip.appendChild(U.h('div', { class: 'tt-h' }, '雙方收入 PR ' + U.pr(best.p)));
      tip.appendChild(U.h('div', { class: 'tt-r' }, U.h('i', { style: { background: 'var(--s-income)' } }), U.h('span', {}, '最低存款'), U.h('b', {}, U.wan(best.minS))));
      if (best.gross) tip.appendChild(U.h('div', { class: 'tt-e' }, '生第一胎那年，夫妻合計年收入約 ' + U.wan(best.gross)));
      var bw = host.clientWidth, x = X(best.p) / Wd * bw;
      tip.style.left = Math.min(bw - 200, Math.max(0, x + (x > bw / 2 ? -214 : 14))) + 'px'; tip.style.top = '10px'; tip.classList.add('on');
    });
    hit.addEventListener('pointerleave', function () { dot.setAttribute('opacity', 0); tip.classList.remove('on'); });
    host.appendChild(root); host.appendChild(tip);
  }

  // ---- 封面：出生數（極簡線條圖＋重點標註） ----
  var BIRTHS = [[2000, 305312], [2001, 260354], [2002, 247530], [2003, 227070], [2004, 216419], [2005, 205854], [2006, 204459], [2007, 204414], [2008, 198733], [2009, 191310], [2010, 166886], [2011, 196627], [2012, 229481], [2013, 199113], [2014, 210383], [2015, 213598], [2016, 208440], [2017, 193844], [2018, 181601], [2019, 177767], [2020, 165249], [2021, 153820], [2022, 138986], [2023, 135571], [2024, 134856], [2025, 107812]];
  function births(host, opt) {
    opt = opt || {};
    var data = BIRTHS, est = opt.est; // est = [2026, 估計值]
    var Wd = 360, Hh = opt.h || 300, L = 6, R = 52, T = 40, B = 58;
    var y0 = 2000, y1 = est ? est[0] : 2025;
    var X = function (y) { return L + (y - y0) / (y1 - y0) * (Wd - L - R); };
    var Y = function (v) { return T + (1 - v / 320000) * (Hh - T - B); };
    var root = S('svg', { viewBox: '0 0 ' + Wd + ' ' + Hh, class: 'births-chart', role: 'img', 'aria-label': '台灣每年出生數：2000 年 30.5 萬，2010 年虎年 16.7 萬，2012 年龍年 22.9 萬，2025 年 10.8 萬' });
    // 0 的基準線（淡虛線），讓跌幅有參照
    root.appendChild(S('line', { x1: X(2000), x2: X(y1), y1: Y(0), y2: Y(0), class: 'bc-ref' }));
    root.appendChild(S('text', { x: X(y1) + 6, y: Y(0) + 4, class: 'bc-sub', text: '0' }));
    var d = data.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join('');
    root.appendChild(S('path', { d: d, class: 'bc-line' }));
    var last = data[data.length - 1];
    if (est) root.appendChild(S('path', { d: 'M' + X(last[0]).toFixed(1) + ' ' + Y(last[1]).toFixed(1) + 'L' + X(est[0]).toFixed(1) + ' ' + Y(est[1]).toFixed(1), class: 'bc-est' }));
    // 標註：細的引導線＋文字（滑過圖時先隱藏，避免和提示重疊）
    var notes = S('g', { class: 'bc-notes' }); root.appendChild(notes);
    function note(year, val, text, sub, below) {
      var x = X(year), y = Y(val), ly = below ? Hh - 32 : T - 16;
      notes.appendChild(S('line', { x1: x, x2: x, y1: below ? y + 5 : y - 5, y2: below ? ly - 13 : ly + 6, class: 'bc-lead' }));
      notes.appendChild(S('text', { x: x, y: ly, 'text-anchor': 'middle', class: 'bc-note', text: text }));
      if (sub) notes.appendChild(S('text', { x: x, y: ly + (below ? 15 : -14), 'text-anchor': 'middle', class: 'bc-sub', text: sub }));
    }
    note(2010, 166886, '虎年', '16.7 萬', true);
    note(2012, 229481, '龍年', '22.9 萬', false);
    // 起點與終點
    root.appendChild(S('circle', { cx: X(2000), cy: Y(data[0][1]), r: 3, class: 'bc-start' }));
    root.appendChild(S('text', { x: X(2000) + 8, y: Y(data[0][1]) - 8, class: 'bc-val', text: '30.5 萬' }));
    root.appendChild(S('circle', { cx: X(last[0]), cy: Y(last[1]), r: 4, class: 'bc-end' }));
    root.appendChild(S('text', { x: X(last[0]) + 7, y: Y(last[1]) - 8, class: 'bc-val end', text: '10.8 萬' }));
    if (est) {
      root.appendChild(S('circle', { cx: X(est[0]), cy: Y(est[1]), r: 3, class: 'bc-estdot' }));
      root.appendChild(S('text', { x: Wd - 2, y: Y(est[1]) + 18, 'text-anchor': 'end', class: 'bc-sub', text: '2026 估 ' + (est[1] / 1e4).toFixed(1) + ' 萬' }));
    }
    // 年份（只標頭尾）
    root.appendChild(S('text', { x: X(2000), y: Hh - 4, class: 'bc-year', text: '2000' }));
    root.appendChild(S('text', { x: X(2025), y: Hh - 4, 'text-anchor': 'middle', class: 'bc-year', text: '2025' }));
    // 滑過看每一年
    var hover = S('g', { class: 'bc-hover', opacity: 0 });
    var hl = S('line', { y1: T - 6, y2: Hh - B + 8, class: 'bc-lead' }), hd = S('circle', { r: 3.5, class: 'bc-end' });
    var ht = S('text', { y: T - 22, 'text-anchor': 'middle', class: 'bc-tip' });
    hover.appendChild(hl); hover.appendChild(hd); hover.appendChild(ht); root.appendChild(hover);
    var hit = S('rect', { x: 0, y: 0, width: Wd, height: Hh, fill: 'transparent' });
    root.appendChild(hit);
    hit.addEventListener('pointermove', function (e) {
      var r = root.getBoundingClientRect(), yr = Math.round(y0 + ((e.clientX - r.left) / r.width * Wd - L) / (Wd - L - R) * (y1 - y0));
      var p = data.filter(function (q) { return q[0] === yr; })[0]; if (!p) { hover.setAttribute('opacity', 0); return; }
      var x = X(p[0]); hl.setAttribute('x1', x); hl.setAttribute('x2', x); hd.setAttribute('cx', x); hd.setAttribute('cy', Y(p[1]));
      ht.setAttribute('x', Math.min(Wd - 60, Math.max(40, x))); ht.textContent = p[0] + ' 年　' + U.sep(p[1]) + ' 人';
      hover.setAttribute('opacity', 1); notes.setAttribute('opacity', 0.15);
    });
    hit.addEventListener('pointerleave', function () { hover.setAttribute('opacity', 0); notes.setAttribute('opacity', 1); });
    host.appendChild(root);
  }

  return { cashflow: cashflow, prCurve: prCurve, births: births, ticks: ticks, moneyTick: moneyTick, evtText: evtText, income: income, expense: expense };
})();
