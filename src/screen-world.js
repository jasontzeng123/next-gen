/* =========================================================================
   報告書：換到別的國家（第二波，試算版）
   ========================================================================= */
(function () {
  'use strict';
  var h = U.h, A = APP;

  // 當地幣值：一律用「萬」，加上約合台幣（市場匯率）
  function money(v, K) {
    if (K.id === 'TW') return U.wan(v);
    var w = v / 1e4, s;
    if (w >= 10000) s = (w / 10000).toFixed(w >= 100000 ? 0 : 1).replace(/\.0$/, '') + ' 億';
    else if (w >= 100) s = U.sep(w) + ' 萬';
    else s = w.toFixed(w >= 10 ? 0 : 1).replace(/\.0$/, '') + ' 萬';
    return s + K.curName;
  }
  function twd(v, K) { return K.id === 'TW' ? '' : '約台幣 ' + U.wan(Math.round(v * K.fx.toTWD / 1e4) * 1e4); }
  function pct(a, b) { return b > 0 ? Math.round(a / b * 100) + '%' : '—'; }

  // 9 個城市逐一試算，每算完一個就讓出主執行緒（手機上比較不會卡）
  function rowsFor(s, onProgress, done) {
    var raw = A.strip(s), key = COMM.sig(raw);
    if (A.world && A.world.key === key) return done(A.world.rows);
    var tw = ENGINE.normalize(raw), jobs = [['TW', tw.county]];
    ENGINE.countries().forEach(function (cid) { if (cid !== 'TW') ENGINE.country(cid).cities.forEach(function (cy) { jobs.push([cid, cy]); }); });
    var rows = [];
    (function next() {
      if (A.s !== s) return; // 設定已經改了：不用再算這一輪
      if (rows.length === jobs.length) { A.world = { key: key, rows: rows }; return done(rows); }
      U.task(function () {
        var j = jobs[rows.length];
        rows.push(WORLD.row(tw, j[0], j[1]));
        onProgress(rows.length, jobs.length);
        next();
      }, 'world-row');
    })();
  }

  // 你的選擇在當地怎麼對應
  var MAP_KEYS = [['housing', '住房'], ['build', '房子'], ['loan', '房貸'], ['postpartum', '坐月子'], ['care', '0–2 歲'], ['preschool', '幼兒園'], ['school', '學校'], ['after', '放學後'], ['cram', '補習'], ['uni', '大學'], ['transport', '交通'], ['leave', '育嬰假']];
  function mapList(K, s) {
    var ul = h('ul', { class: 'wd-map' });
    MAP_KEYS.forEach(function (kk) {
      var key = kk[0], v = s[key];
      if ((key === 'build' || key === 'loan') && s.housing !== 'buy') return;
      if (key === 'after' && (s.school === 'private' || s.school === 'intl')) return;
      var m = K.MAP && K.MAP[key] && K.MAP[key][v];
      if (m) ul.appendChild(h('li', {}, h('b', {}, kk[1]), m));
    });
    (K.notes || []).forEach(function (n) { ul.appendChild(h('li', { class: 'note' }, n)); });
    return ul;
  }

  A.worldSection = function (res, th, s) {
    var sec = h('section', { class: 'rsec', id: 'sec-world' });
    sec.appendChild(h('div', { class: 'rsec-k num' }));
    sec.appendChild(h('h2', {}, '換到別的國家，同樣的選擇要多少收入？'));
    sec.appendChild(h('p', { class: 'rsec-lede' }, '把你的每個選擇換成當地最接近的做法，看收入要贏過當地多少同齡的受僱者。'));
    var msg = h('p', { class: 'muted sm' }, '正在試算各國城市…');
    var box = h('div', {}, msg);
    sec.appendChild(box);
    var s0 = A.s;
    try {
      rowsFor(s0, function (i, n) { msg.textContent = '正在試算各國城市…（' + i + '／' + n + '）'; }, function (rows) {
        if (A.s !== s0 || !box.isConnected) return;
        U.clear(box);
        draw(box, rows, ENGINE.normalize(A.strip(s0)));
      });
    } catch (e) { U.clear(box); box.appendChild(h('p', { class: 'muted sm' }, '這部分暫時算不出來。')); if (U.report) U.report(e, 'world'); }
    return sec;
  };

  function draw(box, rows, s) {
    var full = s.incomeMode === 'full';
    var who = rows[0].who;
    var sorted = rows.slice().sort(function (a, b) { return (a.pr == null ? 101 : a.pr) - (b.pr == null ? 101 : b.pr); });
    var list = h('div', { class: 'wd-list', role: 'list' });
    sorted.forEach(function (r) {
      var K = ENGINE.country(r.cid), mine = r.cid === 'TW';
      var p = r.pr == null ? 100 : Math.max(1, r.pr);
      var sal = who === 'B' ? r.salaryB : r.salaryA;
      var name = mine ? r.name : (K.CITY[r.city].short || r.name);
      var sub = r.pr == null ? '收入再高也不夠' : r.pr <= 1 ? '幾乎任何收入都夠'
        : (s.partner && who === 'both' ? '每人' : '') + '年薪約 ' + money(sal, K) + (mine ? '' : '（' + twd(sal, K) + '）') +
          (r.ratio ? '，同齡中位數的 ' + r.ratio.toFixed(1) + ' 倍' : '');
      var verdict = null;
      if (full && r.verdict) {
        var ok = r.minS >= 0;
        verdict = h('span', { class: 'wd-ok ' + (ok ? 'ok' : 'no') }, (s.partner ? '你們' : '你') + '的排名：' + (ok ? '養得起' : '不夠'));
      }
      list.appendChild(h('div', { class: 'wd-row' + (mine ? ' mine' : ''), role: 'listitem' },
        h('div', { class: 'wd-name' }, h('b', {}, name), h('small', {}, mine ? '你選的縣市' : K.name)),
        h('div', { class: 'wd-bar', 'aria-hidden': 'true' }, h('i', { style: { width: p + '%' } })),
        h('div', { class: 'wd-pr' }, r.pr == null ? '>99.9' : 'PR ' + U.pr(r.pr)),
        h('div', { class: 'wd-sub' }, sub, verdict)));
    });
    box.appendChild(list);
    box.appendChild(h('p', { class: 'sm muted', style: { marginTop: '8px' } },
      (s.partner && who === 'both' ? '兩人都要達到的收入排名' : '要達到的收入排名') + '，以該國全國同年齡的受僱者計算' +
      (full ? '；「' + (s.partner ? '你們' : '你') + '的排名」是把你在台灣同齡受僱者中的排名直接搬過去' : '') +
      (s.jobA.industry !== 'all' || (s.partner && s.jobB.industry !== 'all') ? '（不分產業，所以台灣這一列可能和上面的門檻不同）' : '') + '。'));

    // 為什麼差這麼多：養孩子那些年，各項花費占家庭稅前收入的比例
    var why = h('details', { class: 'wd-why' }, h('summary', {}, '為什麼差這麼多？'));
    var tbl = h('table', { class: 'tbl' });
    tbl.appendChild(h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, '住房'), h('th', {}, '養孩子'), h('th', {}, '稅與社保'), h('th', {}, '政府給的錢'))));
    var tb = h('tbody', {});
    [rows[0]].concat(sorted.filter(function (r) { return r.cid !== 'TW'; })).forEach(function (r) {
      var K = ENGINE.country(r.cid), a = r.at, g = a.gross;
      tb.appendChild(h('tr', { class: r.cid === 'TW' ? 'mine' : '' },
        h('td', {}, r.cid === 'TW' ? r.name : (K.CITY[r.city].short || r.name)),
        h('td', {}, pct(a.housing, g)), h('td', {}, pct(a.kids, g)), h('td', {}, pct(a.tax + a.si, g)), h('td', {}, pct(a.cash, g))));
    });
    tbl.appendChild(tb);
    why.appendChild(h('p', { class: 'sm' }, '收入剛好達到門檻時，養孩子那些年各項花費占家庭稅前收入的比例。'));
    why.appendChild(h('div', { class: 'table-scroll' }, tbl));
    box.appendChild(why);

    // 你的選擇在各國怎麼對應
    var how = h('details', { class: 'wd-why' }, h('summary', {}, '你的選擇在各國怎麼對應'));
    var ids = ENGINE.countries().filter(function (c) { return c !== 'TW'; });
    var pane = h('div', {}), seg = h('div', { class: 'seg wd-seg', role: 'group', 'aria-label': '選擇國家' });
    function show(cid) {
      A.worldTab = cid;
      Array.prototype.forEach.call(seg.children, function (b) { b.setAttribute('aria-pressed', b.dataset.c === cid ? 'true' : 'false'); });
      U.clear(pane); pane.appendChild(mapList(ENGINE.country(cid), s));
    }
    ids.forEach(function (cid) { var b = h('button', { type: 'button', onclick: function () { show(cid); } }, ENGINE.country(cid).name); b.dataset.c = cid; seg.appendChild(b); });
    how.appendChild(seg); how.appendChild(pane);
    show(ids.indexOf(A.worldTab) >= 0 ? A.worldTab : ids[0]);
    box.appendChild(how);

    box.appendChild(h('p', { class: 'sm muted wd-note' }, '試算版：各國數字來自官方統計與新聞，部分是估計，仍在核對。各國薪資統計的範圍不完全相同，排名較低時的比較比較粗略。台幣以市場匯率換算；存款、長輩資助與孝親費依兩地薪資中位數換算。'));
  }

  A.worldMoney = money;
})();
