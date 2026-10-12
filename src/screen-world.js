/* =========================================================================
   實驗室「地圖 → 世界」：各國主要城市的比較（第二波，試算版）
   這裡只放共用的零件：試算（有快取）、城市列表、城市詳細資料。
   版面與地球在 screen-lab.js。
   ========================================================================= */
var WUI = (function () {
  'use strict';
  var h = U.h, A = APP, E = ENGINE;

  // 城市位置（地球上的標記）
  var COORD = { tokyo: [139.69, 35.69], osaka: [135.50, 34.69], seoul: [126.98, 37.57], busan: [129.08, 35.18], paris: [2.35, 48.86], lyon: [4.84, 45.76], shanghai: [121.47, 31.23], chengdu: [104.07, 30.57], nyc: [-74.01, 40.71], houston: [-95.37, 29.76], london: [-0.13, 51.51], manchester: [-2.24, 53.48], berlin: [13.40, 52.52], leipzig: [12.37, 51.34], stockholm: [18.07, 59.33], gothenburg: [11.97, 57.71], toronto: [-79.38, 43.65], calgary: [-114.07, 51.05], sydney: [151.21, -33.87], melbourne: [144.96, -37.81], singapore: [103.82, 1.35], hongkong: [114.17, 22.32], rome: [12.50, 41.90], turin: [7.69, 45.07], madrid: [-3.70, 40.42], valencia: [-0.38, 39.47], telaviv: [34.78, 32.09], haifa: [34.99, 32.79], amsterdam: [4.90, 52.37], rotterdam: [4.48, 51.92], auckland: [174.76, -36.85], christchurch: [172.64, -43.53], zurich: [8.54, 47.37], bern: [7.45, 46.95] };
  var A3 = { JP: 'JPN', KR: 'KOR', FR: 'FRA', CN: 'CHN', US: 'USA', UK: 'GBR', DE: 'DEU', SE: 'SWE', CA: 'CAN', AU: 'AUS', SG: 'SGP', HK: 'HKG', IT: 'ITA', ES: 'ESP', IL: 'ISR', NL: 'NLD', NZ: 'NZL', CH: 'CHE' };

  // 當地幣值：一律用「萬」，加上約合台幣（市場匯率）
  function money(v, K) {
    if (K.id === 'TW') return U.wan(v);
    var w = v / 1e4, s;
    if (Math.abs(w) >= 10000) s = (w / 10000).toFixed(Math.abs(w) >= 100000 ? 0 : 1).replace(/\.0$/, '') + ' 億';
    else if (Math.abs(w) >= 100) s = U.sep(w) + ' 萬';
    else s = w.toFixed(Math.abs(w) >= 10 ? 0 : 1).replace(/\.0$/, '') + ' 萬';
    return s + K.curName;
  }
  function twd(v, K) { return K.id === 'TW' ? '' : '約台幣 ' + U.wan(Math.round(v * K.fx.toTWD / 1e4) * 1e4); }
  function pct(a, b) { return b > 0 ? Math.round(a / b * 100) + '%' : '—'; }
  function key(r) { return r.cid + ':' + r.city; }
  function cityName(r, short) { return r.cid === 'TW' ? r.name : (short ? (E.country(r.cid).CITY[r.city].short || r.name) : r.name); }
  function prText(pr) { return pr == null ? '>99.9' : 'PR ' + U.pr(pr); }

  // ---------- 試算：9 個城市逐一算，每算完一個就讓出主執行緒；同一組設定只算一次 ----------
  var cache = null, job = null;
  function rows(s, onProgress, done) {
    var k = COMM.sig(A.strip(s));
    if (cache && cache.key === k) return done(cache.rows);
    if (job && job.key === k) { job.waiters.push(done); job.progress.push(onProgress); return; }
    var tw = E.normalize(A.strip(s)), jobs = [['TW', tw.county]];
    E.countries().forEach(function (cid) { if (cid !== 'TW') E.country(cid).cities.forEach(function (cy) { jobs.push([cid, cy]); }); });
    var me = job = { key: k, waiters: [done], progress: [onProgress] }, out = [];
    function finish(r, err) { if (job === me) job = null; me.waiters.forEach(function (w) { U.safe(function () { w(r, err); }, 'world-draw'); }); }
    (function next() {
      if (job !== me) return;
      if (out.length === jobs.length) { cache = { key: k, rows: out }; return finish(out); }
      U.task(function () {
        if (job !== me) return;
        try { var j = jobs[out.length]; out.push(WORLD.row(tw, j[0], j[1])); }
        catch (e) { if (U.report) U.report(e, 'world-row'); return finish(null, e); }
        me.progress.forEach(function (p) { if (p) p(out.length, jobs.length); });
        next();
      }, 'world-row');
    })();
  }

  // ---------- 城市列表（放在地球下面）：只有城市與 PR 條 ----------
  function list(all, sel, heat, onPick) {
    var sorted = all.slice().sort(function (a, b) { return (a.pr == null ? 101 : a.pr) - (b.pr == null ? 101 : b.pr); });
    var box = h('div', { class: 'wd-list', role: 'list', 'aria-label': '各國主要城市的門檻 PR' });
    sorted.forEach(function (r) {
      var mine = r.cid === 'TW', p = r.pr == null ? 100 : Math.max(1.5, r.pr);
      var inner = [
        h('span', { class: 'wd-name' }, cityName(r, true), h('small', {}, mine ? '你選的縣市' : E.country(r.cid).name === cityName(r, true) ? '' : E.country(r.cid).name)),
        h('span', { class: 'wd-bar', 'aria-hidden': 'true' }, h('i', { style: { width: p + '%', background: heat(r.pr) } })),
        h('span', { class: 'wd-pr' }, prText(r.pr))
      ];
      if (mine) box.appendChild(h('div', { class: 'wd-li mine', role: 'listitem' }, inner));
      else box.appendChild(h('button', { type: 'button', class: 'wd-li' + (sel === key(r) ? ' sel' : ''), role: 'listitem', 'aria-pressed': sel === key(r) ? 'true' : 'false', onclick: function () { onPick(key(r)); } }, inner));
    });
    return box;
  }

  // ---------- 你的選擇在當地怎麼對應 ----------
  var MAP_KEYS = [['housing', '住房'], ['build', '房子'], ['loan', '房貸'], ['postpartum', '坐月子'], ['leave', '育嬰假'], ['care', '0–2 歲'], ['preschool', '幼兒園'], ['school', '學校'], ['after', '放學後'], ['cram', '補習'], ['uni', '大學'], ['transport', '交通']];
  function mapList(K, s) {
    var ul = h('ul', { class: 'wd-map' });
    MAP_KEYS.forEach(function (kk) {
      var k = kk[0], v = s[k];
      if ((k === 'build' || k === 'loan') && s.housing !== 'buy') return;
      if (k === 'after' && (s.school === 'private' || s.school === 'intl')) return;
      var m = K.MAP && K.MAP[k] && K.MAP[k][v];
      if (m) ul.appendChild(h('li', {}, h('b', {}, kk[1]), m));
    });
    (K.notes || []).forEach(function (n) { ul.appendChild(h('li', { class: 'note' }, n)); });
    return ul;
  }

  // ---------- 城市詳細資料 ----------
  var CATS = [
    ['住房', function (a) { return a.housing; }, 'var(--s-expense)'],
    ['養孩子', function (a) { return a.kids; }, 'var(--s-alt)'],
    ['大人生活', function (a) { return a.living; }, 'var(--s-income)'],
    ['交通', function (a) { return a.transport; }, 'var(--warn)'],
    ['稅與社保', function (a) { return a.tax + a.si; }, 'var(--ink-3)']
  ];
  function shares(at) {
    var v = CATS.map(function (c) { return Math.max(0, c[1](at)); }), tot = v.reduce(function (x, y) { return x + y; }, 0);
    return v.map(function (x) { return tot > 0 ? x / tot : 0; });
  }
  function stackBar(label, sh) {
    var bar = h('span', { class: 'wd-stack' });
    sh.forEach(function (f, i) { if (f > 0) bar.appendChild(h('i', { style: { width: (f * 100).toFixed(2) + '%', background: CATS[i][2] }, title: CATS[i][0] + ' ' + Math.round(f * 100) + '%' })); });
    return h('div', { class: 'wd-stack-row' }, h('span', { class: 'wd-stack-l' }, label), bar);
  }
  function detail(r, tw, s, heat) {
    var K = E.country(r.cid), C = K.CITY[r.city], box = h('div', { class: 'wd-detail' });
    var full = s.incomeMode === 'full', both = s.partner && r.who === 'both';
    box.appendChild(h('div', { class: 'card-k' }, '點選的城市'));
    box.appendChild(h('h2', { style: { fontSize: '22px' } }, C.name, K.name === C.name ? null : h('small', { class: 'wd-country' }, K.name)));
    // 門檻 PR 與 100 人圖
    box.appendChild(h('div', { class: 'wd-big' },
      h('s', { style: { background: heat(r.pr) } }), h('b', {}, prText(r.pr)),
      h('span', {}, '你選的' + tw.name + '：' + prText(tw.pr))));
    var n = People.count(r.pr);
    box.appendChild(h('figure', { class: 'wd-pp' },
      People.svg(r.pr, { n: n, label: '每 100 個同齡受僱者，有 ' + n + ' 個收入養得起' }),
      h('figcaption', {}, '每 100 個當地同齡受僱者，有 ', h('b', {}, String(n)), ' 個收入養得起')));
    // 需要的年薪
    if (r.pr != null && r.pr > 1) {
      var sal = r.who === 'B' ? r.salaryB : r.salaryA;
      box.appendChild(h('p', { class: 'wd-line' }, (both ? '每人' : '') + '年薪要約 ', h('b', {}, money(sal, K)), '（' + twd(sal, K) + '），是當地同齡中位數的 ' + (r.ratio ? r.ratio.toFixed(1) : '—') + ' 倍。'));
    } else if (r.pr == null) box.appendChild(h('p', { class: 'wd-line' }, '收入再高也不夠。'));
    else box.appendChild(h('p', { class: 'wd-line' }, '幾乎任何收入都夠。'));
    if (full && r.verdict) {
      var ok = r.minS >= 0;
      box.appendChild(h('p', { class: 'wd-line' }, '把' + (s.partner ? '你們' : '你') + '在台灣的收入排名搬過去：', h('b', { class: ok ? 'wd-yes' : 'wd-no' }, ok ? '養得起' : '不夠'), ok ? '' : '（存款最低 ' + money(r.minS, K) + '）'));
    }
    // 錢花到哪裡：收入剛好達到門檻時，養孩子那些年各項支出的比例
    box.appendChild(h('h3', { class: 'wd-h3' }, '收入剛好夠時，錢花到哪裡'));
    var shC = shares(r.at), shT = shares(tw.at);
    box.appendChild(stackBar(C.short || C.name, shC));
    box.appendChild(stackBar(tw.name, shT));
    var leg = h('div', { class: 'wd-leg' }, h('span', {}), h('span', {}), h('b', {}, C.short || C.name), h('b', {}, tw.name));
    CATS.forEach(function (c, i) {
      leg.appendChild(h('s', { style: { background: c[2] } }));
      leg.appendChild(h('span', {}, c[0]));
      leg.appendChild(h('span', { class: 'v' }, Math.round(shC[i] * 100) + '%'));
      leg.appendChild(h('span', { class: 'v muted' }, Math.round(shT[i] * 100) + '%'));
    });
    box.appendChild(leg);
    // 存款：不畫進長條（收入高的人長條會幾乎都是存款），另外用一句話說
    var a = r.at, yrs = Math.max(1, a.years), per = a.saved / yrs, inc = (a.gross + a.cash) / yrs;
    var save = h('p', { class: 'wd-save' });
    if (per > 0.05 * inc) {
      save.appendChild(document.createTextNode('上面只算花掉的錢。收入剛好夠時，到最小的孩子獨立（你 ' + a.endAge + ' 歲）前，平均每年還能存下約 '));
      save.appendChild(h('b', {}, money(per, K)));
      save.appendChild(document.createTextNode('（' + twd(per, K) + (K.id === 'TW' ? '' : '，') + '約占收入 ' + Math.round(per / inc * 100) + '%）。' +
        (a.deposit > 0.05 * a.saved ? '其中約 ' + money(a.deposit, K) + ' 放在租屋押金裡（全稅押金會退回，但不能隨時動用）。' : '')));
    } else save.appendChild(document.createTextNode('收入剛好夠時，存款最低會降到接近 0，幾乎沒有餘裕。'));
    box.appendChild(save);
    if (r.bind) {
      var b = r.bind;
      box.appendChild(h('p', { class: 'wd-bind' },
        h('b', {}, '門檻卡在買房那年'), '（你 ' + b.age + ' 歲' + (b.beforeKid ? '，第一胎出生前' : '') + '）：要一次拿出約 ', h('b', {}, money(b.cash, K)),
        '（頭期款 ' + money(b.down, K) + '，稅費與裝修 ' + money(b.fees, K) + '）' + (b.refund ? '，其中約 ' + money(b.refund, K) + '可以用退回的租屋押金' : '') + '。房價約 ' + money(b.price, K) + '，最多貸 ' + money(b.loan, K) + '。' +
        (per > 0.25 * inc ? '收入要高到存得出這筆錢，所以買完房之後會有很多餘裕，稅在上面的長條裡也顯得特別多。' : '')));
    }
    box.appendChild(h('p', { class: 'sm muted', style: { marginTop: '8px' } }, '政府給的錢（生育、育兒、托育等現金補助）：占收入 ' + pct(r.at.cash, r.at.gross) + '，' + tw.name + ' ' + pct(tw.at.cash, tw.at.gross) + '。'));
    // 你的選擇在當地怎麼對應
    var how = h('details', { class: 'wd-why' }, h('summary', {}, '你的選擇在' + K.name + '怎麼對應'));
    how.appendChild(mapList(K, s));
    box.appendChild(how);
    box.appendChild(h('p', { class: 'xs muted wd-note' }, '試算版：各國數字來自官方統計與新聞，部分是估計，仍在核對。收入排名以該國全國同年齡的受僱者計算；台幣以市場匯率換算；存款、長輩資助與孝親費依兩地薪資中位數換算。'));
    return box;
  }

  return { COORD: COORD, A3: A3, rows: rows, list: list, detail: detail, mapList: mapList, money: money, key: key, cityName: cityName, prText: prText };
})();
