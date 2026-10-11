/* 填寫申請書 */
(function () {
  'use strict';
  var h = U.h, A = APP, D = DATA;
  var TICK = '<svg class="tick" viewBox="0 0 34 30" aria-hidden="true"><path d="M4 15.5c3 2.2 5.4 4.8 8 8.6C16.6 15.2 22.4 8 31 2.8"/></svg>';
  function tick() { var t = document.createElement('template'); t.innerHTML = TICK; return t.content.firstChild; }
  function needsAnswer(q) { return (q.key && q.options) || q.type === 'county'; }
  function isSeen(q) { return !!A.seen[q.id]; }

  function crowdFor(key, v) {
    var c = COMM.share(key, v); if (!c || Math.round(c.pct) < 1) return null;
    return h('div', { class: 'crowd' }, h('span', { class: 'crowd-bar' }, h('i', { style: { width: Math.max(2, c.pct).toFixed(0) + '%' } })), h('span', {}, '其他申請人 ' + Math.round(c.pct) + '%'));
  }
  function optEl(q, o, checked, onPick, showCrowd) {
    var s = A.s;
    var sub = typeof o.sub === 'function' ? o.sub(s) : o.sub;
    var b = h('button', { class: 'opt', role: 'radio', 'aria-checked': checked ? 'true' : 'false', type: 'button', 'data-focus': q.id + ':' + String(o.v), onclick: onPick },
      h('span', { class: 'box' }, tick()),
      h('span', { style: { minWidth: 0 } }, h('div', { class: 'opt-label' }, o.label), sub ? h('div', { class: 'opt-sub' }, sub) : null),
      o.ref ? h('span', { class: 'opt-ref', html: o.ref(s) }) : h('span'));
    if (showCrowd) { var cr = crowdFor(q.key, o.v); if (cr) b.appendChild(cr); }
    return b;
  }
  function chipEl(o, checked, onPick, s, id) {
    var sub = typeof o.sub === 'function' ? o.sub(s) : o.sub;
    return h('button', { class: 'chip', type: 'button', role: 'radio', 'aria-checked': checked ? 'true' : 'false', onclick: onPick, 'data-focus': id }, o.label, sub ? h('small', {}, sub) : null);
  }
  function stepper(label, val, unit, min, max, onChange, sub, id) {
    return h('div', { class: 'stepper' },
      h('div', { class: 'stepper-label', id: id + '-l' }, label),
      h('div', { class: 'stepper-row' },
        h('button', { class: 'stepbtn', type: 'button', 'aria-label': '減少' + label, disabled: val <= min, onclick: function () { onChange(val - 1); }, 'data-focus': id + '-' }, '−'),
        h('div', { class: 'stepper-val', 'aria-live': 'polite', 'aria-labelledby': id + '-l' }, String(val), h('small', {}, unit)),
        h('button', { class: 'stepbtn', type: 'button', 'aria-label': '增加' + label, disabled: val >= max, onclick: function () { onChange(val + 1); }, 'data-focus': id + '+' }, '＋')),
      h('div', { class: 'stepper-sub' }, sub || ''));
  }

  APP.screens.quiz = function (main) {
    var vis = QS.visible(A.s);
    if (A.qi >= vis.length) A.qi = vis.length - 1;
    if (A.qi < 0) A.qi = 0;
    var q = vis[A.qi], s = A.s;
    if (q.key && q.options && A.seen[q.id] && !q.options.some(function (o) { return QS.optVisible(o, s) && o.v === s[q.key]; })) delete A.seen[q.id];
    var wide = q.type === 'globe' || q.type === 'county' || q.type === 'job';
    var wrap = h('div', { class: 'quiz' + (wide ? ' wide' : '') + (A.opts && A.opts.keepScroll ? '' : ' fade-only') });
    var sheet = h('section', { class: 'sheet', 'aria-labelledby': 'qt' });
    var inn = h('div', { class: 'sheet-in' });
    var partQs = vis.filter(function (x) { return x.part === q.part; });
    inn.appendChild(h('div', { class: 'part-tag' }, h('span', {}, QS.PARTS[q.part].full), h('span', { class: 'part-count' }, (A.qi + 1) + '／' + vis.length)));
    inn.appendChild(h('div', { class: 'qhead' },
      h('div', { class: 'qno' }, '（' + U.cn(partQs.indexOf(q) + 1) + '）'),
      h('div', {}, h('h2', { class: 'qtitle', id: 'qt' }, QS.title(q, s)), q.hint ? h('p', { class: 'qhint' }, QS.hint(q, s)) : null)));
    var body = h('div', { class: 'qbody' });
    inn.appendChild(body);
    var noteBox = h('div');
    inn.appendChild(noteBox);
    var foot = h('div', { class: 'qfoot' });
    inn.appendChild(foot);
    sheet.appendChild(inn);
    wrap.appendChild(sheet);
    var side = wide ? h('aside', { class: 'side' }) : null;
    if (side) wrap.appendChild(side);
    main.appendChild(wrap);

    var focusKey = null;
    function refresh() {
      // 重新繪製本題（保留焦點）
      var ae = document.activeElement; focusKey = ae && ae.getAttribute && ae.getAttribute('data-focus');
      A.go('quiz', { keepScroll: true });
      if (focusKey) { var el = document.querySelector('[data-focus="' + focusKey.replace(/"/g, '') + '"]'); if (el) el.focus({ preventScroll: true }); }
    }
    // 輸入框失去焦點時（例如直接按「下一題」）不要馬上重畫：重畫會把按鈕換掉，第一次點擊就會落空
    function softRefresh() {
      var qi0 = A.qi;
      setTimeout(function () { if (A.screen === 'quiz' && A.qi === qi0 && !U.modalOpen()) refresh(); }, 300);
    }
    function setNote() {
      U.clear(noteBox);
      var html = q.note ? q.note(A.s) : '';
      if (html && (isSeen(q) || !needsAnswer(q))) noteBox.appendChild(h('div', { class: 'qnote', html: html }));
    }

    // ---- 依題型繪製 ----
    if (q.type === 'globe') renderGlobe();
    else if (q.type === 'county') renderCounty();
    else if (q.type === 'ages') renderAges();
    else if (q.type === 'plan') renderPlan();
    else if (q.type === 'multi') renderMulti();
    else if (q.type === 'elder') renderElder();
    else if (q.type === 'job') renderJob();
    else if (q.type === 'money') renderMoney();
    else renderChoice();
    setNote();

    // ---- 頁尾 ----
    var canNext = !needsAnswer(q) || isSeen(q);
    foot.appendChild(h('button', { class: 'btn ghost', type: 'button', onclick: prev }, U.icon('back'), A.qi === 0 ? '封面' : '上一題'));
    foot.appendChild(h('span', { class: 'spacer' }));
    if (!canNext) foot.appendChild(h('span', { class: 'xs muted' }, q.type === 'county' ? '請選一個縣市' : '請勾選一項'));
    var last = A.qi === vis.length - 1;
    foot.appendChild(h('button', { class: 'btn' + (last ? ' seal' : ''), type: 'button', disabled: !canNext, onclick: next, id: 'next-btn' }, last ? '送出審查' : '下一題', U.icon('next')));

    function next() {
      if (needsAnswer(q) && !isSeen(q)) return;
      A.seen[q.id] = true;
      var v2 = QS.visible(A.s);
      var idx = v2.indexOf(q);
      if (idx === v2.length - 1) { A.persist(); finish(); return; }
      A.qi = idx + 1; A.persist(); A.go('quiz');
    }
    function prev() { if (A.qi === 0) { A.go('cover'); return; } A.qi--; A.persist(); A.go('quiz'); }
    var onKey = function (e) {
      if (U.modalOpen()) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;
      var btn = e.target && e.target.closest ? e.target.closest('button') : null;
      if (e.key === 'Enter' && (!btn || ((btn.classList.contains('opt') || btn.classList.contains('chip')) && btn.getAttribute('aria-checked') === 'true'))) { e.preventDefault(); next(); return; }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') && btn && btn.closest('[role="radiogroup"]')) {
        var items = Array.prototype.slice.call(btn.closest('[role="radiogroup"]').querySelectorAll('button:not([disabled])'));
        var i = items.indexOf(btn), d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1;
        var nx = items[(i + d + items.length) % items.length]; if (nx) { e.preventDefault(); nx.focus(); }
        return;
      }
      if (/^[1-9]$/.test(e.key) && q.options) {
        var opts = q.options.filter(function (o) { return QS.optVisible(o, A.s); });
        var o = opts[+e.key - 1]; if (o) pick(o.v);
      }
    };
    document.addEventListener('keydown', onKey);
    var prevCleanup = A.cleanup;
    A.cleanup = function () { document.removeEventListener('keydown', onKey); if (prevCleanup) prevCleanup(); };

    function pick(v) { A.set(q.key, v); A.seen[q.id] = true; A.persist(); refresh(); }

    function renderChoice() {
      var list = h('div', { class: 'opts', role: 'radiogroup', 'aria-labelledby': 'qt' });
      q.options.filter(function (o) { return QS.optVisible(o, s); }).forEach(function (o) {
        var checked = isSeen(q) && s[q.key] === o.v;
        list.appendChild(optEl(q, o, checked, function () { pick(o.v); }, isSeen(q)));
      });
      body.appendChild(list);
      if (isSeen(q) && COMM.st.demoOn && list.querySelector('.crowd')) body.appendChild(h('p', { class: 'xs muted demo-note' }, '「其他申請人」的比例目前含作者產生的示範資料。'));
      if (q.subs) q.subs.forEach(function (sq) {
        if (sq.when && !sq.when(s)) return;
        if (!isSeen(q)) return;
        var grp = h('div', { class: 'subq' }, h('div', { class: 'subq-title' }, sq.title));
        var chips = h('div', { class: 'chips', role: 'radiogroup' });
        sq.options.forEach(function (o) {
          if (sq.key === 'quitWho' && !s.partner && o.v === 'B') return;
          chips.appendChild(chipEl(o, s[sq.key] === o.v, function () { A.set(sq.key, o.v); refresh(); }, s, sq.key + ':' + o.v));
        });
        grp.appendChild(chips); body.appendChild(grp);
      });
    }
    function renderMulti() {
      A.seen[q.id] = true;
      q.fields.forEach(function (f) {
        var grp = h('div', { class: 'subq' }, h('div', { class: 'subq-title' }, f.title));
        var chips = h('div', { class: 'chips', role: 'radiogroup' });
        f.options.forEach(function (o) { chips.appendChild(chipEl(o, s[f.key] === o.v, function () { A.set(f.key, o.v); refresh(); }, s, f.key + ':' + String(o.v))); });
        grp.appendChild(chips); body.appendChild(grp);
      });
    }
    function renderElder() {
      A.seen[q.id] = true;
      var grp = h('div', { class: 'subq' }, h('div', { class: 'subq-title' }, s.partner ? '每月孝親費（夫妻合計）' : '每月孝親費'));
      var chips = h('div', { class: 'chips', role: 'radiogroup' });
      [0, 5000, 10000, 15000, 20000, 30000].forEach(function (v) {
        chips.appendChild(chipEl({ label: v ? U.sep(v) + ' 元' : '不用給' }, s.elder === v, function () { A.set('elder', v); refresh(); }, s, 'elder:' + v));
      });
      grp.appendChild(chips); body.appendChild(grp);
      var c = COMM.share('elder', s.elder);
      if (c && Math.round(c.pct) >= 1) body.appendChild(h('p', { class: 'sm muted', style: { marginTop: '8px' } }, '其他申請人中有 ' + Math.round(c.pct) + '% 選了一樣的金額。'));
      var g2 = h('div', { class: 'subq' }, h('div', { class: 'subq-title' }, '長輩未來需要照顧時'));
      var ch2 = h('div', { class: 'chips', role: 'radiogroup' });
      ch2.appendChild(chipEl({ label: '不另外分擔' }, !s.elderCare, function () { A.set('elderCare', false); refresh(); }, s, 'ec:0'));
      ch2.appendChild(chipEl({ label: '分擔看護費', sub: '每月 1.5 萬，你 50–59 歲時' }, !!s.elderCare, function () { A.set('elderCare', true); refresh(); }, s, 'ec:1'));
      g2.appendChild(ch2); body.appendChild(g2);
    }
    function renderAges() {
      A.seen[q.id] = true;
      var box = h('div', { class: 'steppers' });
      var medA = ENGINE.grossAt({ industry: 'all', pr: 50 }, s.ageA);
      box.appendChild(stepper('你的年齡', s.ageA, '歲', 20, 45, function (v) { A.set('ageA', v); if (A.s.firstBirthAge < v) A.set('firstBirthAge', v); refresh(); }, '同齡受僱者年薪中位數約 ' + U.wan(medA), 'ageA'));
      if (s.partner) box.appendChild(stepper('伴侶的年齡', s.ageB, '歲', 20, 50, function (v) { A.set('ageB', v); refresh(); }, '同齡受僱者年薪中位數約 ' + U.wan(ENGINE.grossAt({ industry: 'all', pr: 50 }, s.ageB)), 'ageB'));
      body.appendChild(box);
    }
    function renderPlan() {
      A.seen[q.id] = true;
      var box = h('div', { class: 'steppers' });
      box.appendChild(stepper('第一胎出生時，你幾歲', s.firstBirthAge, '歲', s.ageA, 45, function (v) { A.set('firstBirthAge', v); refresh(); }, s.firstBirthAge === s.ageA ? '今年就生' : '再過 ' + (s.firstBirthAge - s.ageA) + ' 年', 'fb'));
      box.appendChild(stepper('打算生幾個', s.kids, '個', 1, 4, function (v) { A.set('kids', v); refresh(); }, crowdLine('kids', s.kids), 'kids'));
      if (s.kids > 1) box.appendChild(stepper('每胎間隔', s.spacing, '年', 1, 6, function (v) { A.set('spacing', v); refresh(); }, '最小的孩子在你 ' + (s.firstBirthAge + (s.kids - 1) * s.spacing) + ' 歲時出生', 'sp'));
      body.appendChild(box);
      body.appendChild(timeline(s));
    }
    function crowdLine(key, v) { var c = COMM.share(key, v); return c && Math.round(c.pct) >= 1 ? '其他申請人 ' + Math.round(c.pct) + '% 也選這個' : ''; }
    function timeline(s) {
      var end = ENGINE.supportEndAge(s.support);
      var births = []; for (var i = 0; i < s.kids; i++) births.push(s.firstBirthAge + i * s.spacing);
      var a0 = s.ageA, a1 = births[births.length - 1] + Math.max(end, 22);
      var Wd = Math.max(300, Math.min(700, (document.querySelector('.qbody') || {}).clientWidth || 640)), X = function (a) { return 24 + (a - a0) / Math.max(1, a1 - a0) * (Wd - 48); };
      var svg = U.svg('svg', { viewBox: '0 0 ' + Wd + ' 92', role: 'img', 'aria-label': '生育時間軸' });
      svg.appendChild(U.svg('line', { x1: X(a0), x2: X(a1), y1: 46, y2: 46, stroke: 'var(--rule)', 'stroke-width': 1.5 }));
      for (var a = Math.ceil(a0 / 5) * 5; a <= a1; a += 5) {
        svg.appendChild(U.svg('line', { x1: X(a), x2: X(a), y1: 42, y2: 50, stroke: 'var(--rule)' }));
        svg.appendChild(U.svg('text', { x: X(a), y: 84, 'text-anchor': 'middle', text: a + '歲', style: 'font-size:11px;fill:var(--ink-3)' }));
      }
      births.forEach(function (b, i) {
        svg.appendChild(U.svg('line', { x1: X(b), x2: X(b + end), y1: 46 - 0, y2: 46, stroke: 'var(--pen)', 'stroke-width': 4, 'stroke-opacity': 0.25 - i * 0.03 }));
        svg.appendChild(U.svg('circle', { cx: X(b), cy: 46, r: 9, fill: 'var(--pen)' }));
        svg.appendChild(U.svg('text', { x: X(b), y: 50, 'text-anchor': 'middle', text: String(i + 1), style: 'font-size:11px;font-weight:700;fill:var(--sheet)' }));
        svg.appendChild(U.svg('text', { x: X(b), y: 24 - (i % 2) * 10, 'text-anchor': 'middle', text: b + '歲', style: 'font-size:11.5px;fill:var(--pen);font-weight:700' }));
      });
      var lastIndep = births[births.length - 1] + end;
      svg.appendChild(U.svg('line', { x1: X(lastIndep), x2: X(lastIndep), y1: 34, y2: 58, stroke: 'var(--seal)', 'stroke-width': 2 }));
      svg.appendChild(U.svg('text', { x: Math.min(X(lastIndep), Wd - 4), y: 70, 'text-anchor': X(lastIndep) > Wd - 120 ? 'end' : 'middle', text: '最小的孩子獨立：你 ' + lastIndep + ' 歲', style: 'font-size:11.5px;fill:var(--seal-ink);font-weight:700' }));
      return h('div', { class: 'timeline' }, svg);
    }

    function renderGlobe() {
      A.seen[q.id] = true;
      var wrapG = h('div', { class: 'globe-wrap' });
      var cv = h('canvas', { width: 520, height: 520, role: 'img', 'aria-label': '可旋轉的點陣地球，台灣以紅色標示' });
      var tip = h('div', { class: 'globe-tip' });
      wrapG.appendChild(cv); wrapG.appendChild(tip);
      body.appendChild(wrapG);
      body.appendChild(h('p', { class: 'globe-hint' }, '拖曳旋轉・點選國家'));
      var picked = h('p', { class: 'sm', style: { textAlign: 'center', marginTop: '6px' } });
      body.appendChild(picked);
      var list = h('div', { class: 'country-list' });
      list.appendChild(chipEl({ label: '台灣', sub: '已開放' }, true, function () { selectTW(); }, s, 'c:TW'));
      ['日本', '韓國', '新加坡', '美國', '德國', '瑞典'].forEach(function (n) { list.appendChild(h('button', { class: 'chip', type: 'button', disabled: true }, n, h('small', {}, '建置中'))); });
      body.appendChild(list);
      var g = Globe.create(cv, {
        lon: 100, lat: 20, zoom: 1, selected: 'TWN',
        onHover: function (c, x, y) {
          if (!c) { tip.classList.remove('on'); return; }
          tip.textContent = c.a3 === 'TWN' ? '台灣・點選進入' : c.n + '・資料建置中';
          tip.style.left = x / cv.clientWidth * 100 + '%'; tip.style.top = y / cv.clientHeight * 100 + '%';
          tip.classList.add('on');
        },
        onPick: function (c) { if (c.a3 === 'TWN') selectTW(); else { picked.textContent = c.n + '的資料還在建置中，第一版先開放台灣。'; } }
      });
      var prevC = A.cleanup; A.cleanup = function () { g.destroy(); if (prevC) prevC(); };
      setTimeout(function () { g.flyTo(121, 23.7, 1.6, 1800); }, 400);
      function selectTW() { A.set('country', 'TW'); picked.textContent = '已選擇：台灣。台灣目前的養育補助列在旁邊（手機版在下方）。'; g.flyTo(121, 23.7, 3.2, 1100); }
      picked.textContent = '已選擇：台灣';
      // 側欄：台灣福利
      var card = h('div', { class: 'card' });
      card.appendChild(h('div', { class: 'card-k' }, '附件一　台灣的養育支持'));
      card.appendChild(h('h3', {}, '從出生到大學，政府會給什麼？'));
      var wfRow = function (w) {
        var src = D.SOURCES[w.src];
        return h('div', { class: 'wf' }, h('span', { class: 'wf-tag ' + w.tag }, w.t), h('div', { class: 'wf-name' }, w.name), h('div', { class: 'wf-amt' }, w.amt, src ? [' ', h('a', { href: src.u, target: '_blank', rel: 'noopener' }, '來源')] : null));
      };
      var tops = QS.WELFARE.filter(function (w) { return w.top; }), rest = QS.WELFARE.filter(function (w) { return !w.top; });
      var wl = h('div', { class: 'welfare' });
      tops.forEach(function (w) { wl.appendChild(wfRow(w)); });
      card.appendChild(wl);
      // 其餘項目：預設收合
      var more = h('div', { class: 'welfare wf-more', id: 'wf-more', hidden: !A.welfareOpen },
        h('div', { class: 'wf-sub' }, '其他 ' + rest.length + ' 項'), rest.map(wfRow));
      var moreBtn = h('button', { type: 'button', class: 'linkbtn wf-toggle', 'aria-expanded': A.welfareOpen ? 'true' : 'false', 'aria-controls': 'wf-more', onclick: function () {
        A.welfareOpen = !A.welfareOpen; more.hidden = !A.welfareOpen; peek.hidden = A.welfareOpen;
        moreBtn.setAttribute('aria-expanded', A.welfareOpen ? 'true' : 'false');
        moreBtn.firstChild.textContent = A.welfareOpen ? '收合' : '顯示完整（' + QS.WELFARE.length + ' 項）';
      } }, A.welfareOpen ? '收合' : '顯示完整（' + QS.WELFARE.length + ' 項）');
      var peek = h('p', { class: 'wf-peek', hidden: !!A.welfareOpen }, '還有：' + rest.map(function (w) { return w.name.replace(/（.*）/, ''); }).join('、') + '。');
      card.appendChild(peek);
      card.appendChild(more);
      card.appendChild(moreBtn);
      card.appendChild(h('p', { class: 'xs muted', style: { marginTop: '10px' } }, '這些補助都會依你的選擇自動計入結果。查核日期：2026 年 10 月。'));
      side.appendChild(card);
    }

    function renderCounty() {
      var mapWrap = h('div', { class: 'twmap-wrap' });
      body.appendChild(mapWrap);
      var sel = h('select', { class: 'select', id: 'county-sel', 'data-focus': 'county-sel', 'aria-label': '選擇縣市', onchange: function (e) { choose(e.target.value); } });
      sel.appendChild(h('option', { value: '' }, '從清單選擇縣市…'));
      D.COUNTIES.forEach(function (c) { sel.appendChild(h('option', { value: c.id, selected: isSeen(q) && c.id === s.county }, c.name)); });
      body.appendChild(h('div', { class: 'field' }, sel));
      var distBox = h('div');
      body.appendChild(distBox);
      var map = TWMap.create(mapWrap, { onPick: choose });
      var paint = function () { map.paint(function (id) { return id === A.s.county && isSeen(q) ? 'var(--sel-fill)' : null; }, isSeen(q) ? A.s.county : null); };
      paint();
      function choose(id) {
        if (!id) return;
        A.set('county', id); A.seen[q.id] = true;
        var dl = D.DISTRICTS[id]; if (dl) A.set('district', dl.length === 2 ? dl[0].id : 'mid');
        A.persist(); refresh();
      }
      if (isSeen(q)) {
        var dl = D.DISTRICTS[s.county];
        if (dl) {
          var grp = h('div', { class: 'subq' }, h('div', { class: 'subq-title' }, '在' + D.COUNTY[s.county].name + '的哪一區？'));
          var chips = h('div', { class: 'chips', role: 'radiogroup' });
          dl.forEach(function (d) { chips.appendChild(chipEl({ label: d.name, sub: d.ex }, s.district === d.id, function () { A.set('district', d.id); refresh(); }, s, 'd:' + d.id)); });
          grp.appendChild(chips); distBox.appendChild(grp);
        }
      }
      side.appendChild(countyCard(s, isSeen(q)));
    }

    function renderJob() {
      A.seen[q.id] = true;
      var who = q.who, key = who === 'A' ? 'jobA' : 'jobB', job = s[key], age = who === 'A' ? s.ageA : s.ageB;
      var sel = h('select', { class: 'select', id: key + '-ind', 'data-focus': key + '-ind', onchange: function (e) { A.set(key + '.industry', e.target.value); refresh(); } });
      D.INDUSTRIES.forEach(function (ind) {
        if (ind.id === 'none' && s.incomeMode !== 'full') return;
        sel.appendChild(h('option', { value: ind.id, selected: ind.id === job.industry }, ind.name));
      });
      body.appendChild(h('div', { class: 'field' }, h('label', { for: key + '-ind' }, '產業'), sel));
      var ind = D.INDUSTRY[job.industry];
      if (s.incomeMode !== 'full') {
        body.appendChild(h('p', { class: 'qnote' }, '不填收入時，系統會用這個產業、這個年齡的薪資分布，反推「收入至少要在 PR 多少」。不確定就選「不分產業」。'));
      } else if (ind.median > 0) {
        var mode = job.mode === 'salary' ? 'salary' : 'pr';
        var seg = h('div', { class: 'seg', role: 'group', 'aria-label': '收入填寫方式' },
          h('button', { type: 'button', 'aria-pressed': mode === 'pr' ? 'true' : 'false', onclick: function () { A.set(key + '.mode', 'pr'); refresh(); } }, '拉收入 PR'),
          h('button', { type: 'button', 'aria-pressed': mode === 'salary' ? 'true' : 'false', onclick: function () { var g = ENGINE.grossAt(job, age); A.set(key + '.salary', Math.round(g / 10000) * 10000); A.set(key + '.mode', 'salary'); refresh(); } }, '輸入年薪'));
        body.appendChild(h('div', { class: 'field' }, h('span', { class: 'flabel' }, '怎麼填？'), seg));
        var gross = ENGINE.grossAt(job, age);
        if (mode === 'pr') {
          var rd = h('div', { class: 'pr-readout' }, h('span', { class: 'pr-big' }, 'PR ' + U.pr(job.pr)), h('span', { class: 'pr-meta' }, '年薪約 ', h('b', {}, U.wan(gross)), '（含年終），月薪約 ' + U.wan1(gross / (12 + ind.bonus))));
          var rng = h('input', { type: 'range', class: 'range', min: 1, max: 99, step: 1, value: Math.round(job.pr), id: key + '-pr', 'data-focus': key + '-pr', 'aria-label': '收入 PR' });
          rng.addEventListener('input', function (e) {
            A.s[key].pr = +e.target.value; var g2 = ENGINE.grossAt(A.s[key], age);
            rd.firstChild.textContent = 'PR ' + e.target.value;
            rd.lastChild.innerHTML = '年薪約 <b>' + U.wan(g2) + '</b>（含年終），月薪約 ' + U.wan1(g2 / (12 + ind.bonus));
          });
          rng.addEventListener('change', function (e) { A.set(key + '.pr', +e.target.value); refresh(); });
          body.appendChild(h('div', { class: 'field' }, h('label', { for: key + '-pr' }, '在同產業、同年齡的人當中，你的收入贏過幾 % 的人？'), rd, rng, h('div', { class: 'pr-scale' }, h('span', {}, '1'), h('span', {}, '50（中間）'), h('span', {}, '99'))));
        } else {
          var inp = h('input', { type: 'number', class: 'input', id: key + '-sal', 'data-focus': key + '-sal', min: 0, step: 1, inputmode: 'numeric', value: Math.round((job.salary != null ? job.salary : gross) / 10000) });
          var out = h('p', { class: 'sm', style: { marginTop: '6px' } });
          var upd = function () { var v = Math.max(0, +inp.value || 0) * 10000; if (!v) { out.innerHTML = '年薪 0：以沒有薪資收入計算。'; return; } var p = ENGINE.prFromSalary(job.industry, age, v); out.innerHTML = '同產業、同年齡約 <b>PR ' + U.pr(p) + '</b>；在全體受僱者中約 PR ' + U.pr(ENGINE.overallPR(v)) + '。'; };
          inp.addEventListener('input', upd);
          inp.addEventListener('change', function () { A.set(key + '.salary', Math.max(0, +inp.value || 0) * 10000); A.set(key + '.mode', 'salary'); A.persist(); softRefresh(); });
          upd();
          body.appendChild(h('div', { class: 'field' }, h('label', { for: key + '-sal' }, '全年總薪資（萬元，含年終與獎金）'), inp, out));
        }
      } else {
        body.appendChild(h('p', { class: 'qnote' }, '這一方的收入以 0 計算。若是留職停薪或暫時離職，之後可在報告裡調整。'));
      }
      // 側欄：產業薪資
      var card = h('div', { class: 'card' });
      card.appendChild(h('div', { class: 'card-k' }, '附件二　薪資參考'));
      if (ind.median > 0) {
        card.appendChild(h('h3', {}, ind.name.replace(/（.*）/, '')));
        var kv = h('dl', { class: 'kv' });
        [[25, 'PR 25'], [50, 'PR 50（中位數）'], [75, 'PR 75'], [90, 'PR 90']].forEach(function (r) {
          kv.appendChild(h('dt', {}, r[1])); kv.appendChild(h('dd', {}, U.wan(ENGINE.grossAt({ industry: job.industry, pr: r[0] }, age))));
        });
        card.appendChild(kv);
        card.appendChild(h('p', { class: 'xs muted', style: { marginTop: '10px' } }, age + ' 歲、全年總薪資（含年終），2026 年水準。依主計總處 113 年薪資分布與各年齡中位數推估' + (ind.est ? '；本產業中位數為估計值' : '') + '。年終約 ' + ind.bonus + ' 個月。'));
      } else card.appendChild(h('p', { class: 'sm' }, '沒有薪資收入。'));
      side.appendChild(card);
      var c2 = h('div', { class: 'card' });
      c2.appendChild(h('div', { class: 'card-k' }, '什麼是 PR？'));
      c2.appendChild(h('p', { class: 'sm' }, 'PR 50 代表收入剛好在中間；PR 90 代表贏過 90% 的人。主計總處：2024 年全體受僱者全年總薪資中位數 54.6 萬、PR 90 為 133.6 萬；本試算再以 2025–2026 年的薪資成長（約 8%）換算成 2026 年水準。'));
      side.appendChild(c2);
    }

    function renderMoney() {
      A.seen[q.id] = true;
      function group(title, key, values, fmt, sub) {
        var grp = h('div', { class: 'subq' }, h('div', { class: 'subq-title' }, title, sub ? h('span', { class: 'xs muted' }, sub) : null));
        var chips = h('div', { class: 'chips', role: 'radiogroup' });
        values.forEach(function (v) { chips.appendChild(chipEl({ label: fmt(v) }, A.s[key] === v, function () { A.set(key, v); refresh(); }, A.s, key + ':' + v)); });
        var custom = values.indexOf(A.s[key]) < 0;
        var inp = h('input', { type: 'number', class: 'input', min: 0, step: 1, inputmode: 'numeric', style: { width: '9em', padding: '6px 10px' }, 'aria-label': title + '（萬元）', value: custom ? Math.round(A.s[key] / 10000) : '', placeholder: '其他（萬）' });
        inp.addEventListener('change', function () { A.set(key, Math.max(0, +inp.value || 0) * 10000); A.persist(); softRefresh(); });
        chips.appendChild(inp);
        grp.appendChild(chips); body.appendChild(grp);
      }
      var w = function (v) { return v ? U.wan(v) : '沒有'; };
      group('你們目前的存款', 'savings', [0, 300000, 500000, 1000000, 2000000, 5000000], function (v) { return v ? U.wan(v) : '0'; });
      group('長輩一次性資助', 'giftOnce', [0, 500000, 1000000, 3000000, 5000000], w, A.s.housing === 'buy' ? '買房時給（頭期款）' : '現在給');
      var grp = h('div', { class: 'subq' }, h('div', { class: 'subq-title' }, '長輩每月資助'));
      var chips = h('div', { class: 'chips' });
      [0, 5000, 10000, 20000].forEach(function (v) { chips.appendChild(chipEl({ label: v ? U.sep(v) + ' 元' : '沒有' }, A.s.giftMonthly === v, function () { A.set('giftMonthly', v); refresh(); }, A.s, 'gm:' + v)); });
      grp.appendChild(chips); body.appendChild(grp);
      if (A.s.giftMonthly) {
        var g2 = h('div', { class: 'subq' }, h('div', { class: 'subq-title' }, '持續幾年？'));
        var ch2 = h('div', { class: 'chips' });
        [5, 10, 20].forEach(function (y) { ch2.appendChild(chipEl({ label: y + ' 年' }, A.s.giftYears === y, function () { A.set('giftYears', y); refresh(); }, A.s, 'gy:' + y)); });
        g2.appendChild(ch2); body.appendChild(g2);
      }
    }
  };

  function countyCard(s, show) {
    var card = h('div', { class: 'card' });
    card.appendChild(h('div', { class: 'card-k' }, '附件二　縣市概況'));
    if (!show) { card.appendChild(h('p', { class: 'sm muted' }, '選一個縣市，這裡會顯示房價、租金和物價。')); return card; }
    var c = D.COUNTY[s.county];
    card.appendChild(h('h3', {}, c.name));
    var kv = h('dl', { class: 'kv' });
    var rows = [
      ['大樓華廈均價', c.price.toFixed(1) + ' 萬/坪'],
      ['房價所得比', c.pir + ' 倍'],
      ['2 房月租（約）', U.wan1(ENGINE.rentFor(c, 2, 1))],
      ['3 房月租（約）', U.wan1(ENGINE.rentFor(c, 3, 1))],
      ['每人每月消費', U.sep(c.cons) + ' 元'],
      ['最低生活費', U.sep(c.minLiving) + ' 元/月'],
      ['生育獎勵', c.birth ? (c.birth[0] === c.birth[c.birth.length - 1] ? '每胎 ' + U.wan(c.birth[0]) : U.wan(c.birth[0]) + ' 起') : '未收錄']
    ];
    rows.forEach(function (r) { kv.appendChild(h('dt', {}, r[0])); kv.appendChild(h('dd', {}, r[1])); });
    card.appendChild(kv);
    card.appendChild(h('p', { class: 'xs muted', style: { marginTop: '10px' } }, '房價：樂居近一年實價登錄；房價所得比：內政部 2026 Q1；租金：591 刊登中位數的九成；消費：主計總處家庭收支（2023）。' + (c.priceEst || c.rentEst ? '本縣市部分數字樣本少，為估計值。' : '')));
    return card;
  }
  APP.countyCard = countyCard;

  // ---------- 送出 ----------
  function finish() {
    var go = function () { A.go('reveal'); };
    if (COMM.st.canShare && A.consent == null) consentModal(go);
    else go();
  }
  function consentModal(after) {
    U.modal(function (box, close) {
      box.appendChild(h('h3', {}, '要匿名分享你的設定嗎？'));
      box.appendChild(h('p', {}, '分享後，其他申請人會在題目旁看到「大家怎麼選」，你也能在報告裡看到自己在所有申請人中的位置。'));
      box.appendChild(h('ul', {},
        h('li', {}, '會分享：縣市與區域、孩子數、每一題的選擇、收入 PR（四捨五入到 5）、年齡區間（每 5 歲一組）、審查結果。'),
        h('li', {}, '不會分享：姓名、帳號資料、確切年齡、確切年薪與存款金額。'),
        h('li', {}, '只會分享這次送出的申請書。之後修改或在報告裡調整設定都不會覆蓋，除非你在報告裡按「更新」。'),
        h('li', {}, COMM.st.backend === 'web' ? '隨時可以在報告頁取消分享，資料會刪除（請用同一台裝置的同一個瀏覽器）。' : '隨時可以在報告頁取消分享，資料會刪除。')));
      box.appendChild(h('div', { class: 'actions' },
        h('button', { class: 'btn ghost', onclick: function () { A.consent = false; U.store.set('consent', false); close(); after(); } }, '不分享'),
        h('button', { class: 'btn', onclick: function () { A.consent = true; U.store.set('consent', true); close(); after(); } }, '匿名分享')));
    });
  }
  APP.consentModal = consentModal;
})();
