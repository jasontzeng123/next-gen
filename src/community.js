/* =========================================================================
   COMMUNITY — 匿名分享設定、讀取其他人的統計、個人存檔同步
   兩種後端：
   - claude.ai Artifact 的 db / user / downloads 能力（作品發佈在 claude.ai 時）
   - 自架網站（GitHub Pages）時改用 Supabase：每台裝置一個隨機匿名代號＋只有這台裝置知道的密語
   都不可用時自動降級成本機模式。
   ========================================================================= */
var COMM = (function () {
  'use strict';
  var st = { ready: false, db: null, user: null, uid: null, canShare: false, rows: [], stats: null, loaded: false, downloads: undefined, backend: null };
  var subs = [];
  function on(fn) { subs.push(fn); }
  function emit() { subs.forEach(function (fn) { try { fn(st); } catch (e) { /* 忽略單一監聽錯誤 */ } }); }
  function hasClaude() { return typeof window !== 'undefined' && window.claude && typeof window.claude.use === 'function'; }
  // 自架網站的設定（建置時寫入 window.TWKIDS）
  var CFG = (typeof window !== 'undefined' && window.TWKIDS) || {};
  function sbOn() { return !!(CFG.sb && CFG.sb.url && CFG.sb.key); }

  // ---------- Supabase（自架網站） ----------
  function rnd(n) {
    var abc = 'abcdefghijklmnopqrstuvwxyz0123456789', out = '', buf = new Uint8Array(n), c = window.crypto || window.msCrypto;
    if (c && c.getRandomValues) c.getRandomValues(buf); else for (var j = 0; j < n; j++) buf[j] = Math.floor(Math.random() * 256);
    for (var i = 0; i < n; i++) out += abc[buf[i] % 36];
    return out;
  }
  // 匿名代號與密語：存在這台裝置的瀏覽器裡；換裝置或清除資料就是新的匿名代號
  function anon() {
    var a = U.store.get('anon', null);
    if (!a || !/^[a-z0-9]{24}$/.test(a.id || '') || !/^[a-z0-9]{40}$/.test(a.secret || '')) { a = { id: rnd(24), secret: rnd(40) }; U.store.set('anon', a); }
    return a;
  }
  function rpc(name, body) {
    var headers = { 'Content-Type': 'application/json', apikey: CFG.sb.key };
    // 舊版的 anon key 是 JWT，要另外放在 Authorization；新版 publishable key 只放 apikey
    if (/^eyJ/.test(CFG.sb.key)) headers.Authorization = 'Bearer ' + CFG.sb.key;
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 15000) : 0;
    return fetch(CFG.sb.url.replace(/\/+$/, '') + '/rest/v1/rpc/' + name, { method: 'POST', headers: headers, body: JSON.stringify(body || {}), signal: ctl ? ctl.signal : undefined, cache: 'no-store' })
      .then(function (r) {
        clearTimeout(timer);
        if (!r.ok) return r.text().then(function (t) { throw { code: 'http_' + r.status, message: String(t).slice(0, 200) }; });
        return r.json();
      }, function (e) { clearTimeout(timer); throw { code: 'network', message: (e && e.message) || 'network' }; });
  }
  // 模仿 claude.ai db 的介面（只實作這個作品用到的部分），讓下面的程式兩種後端共用
  function sbDb(me) {
    function query() {
      var lim = 2000, q = {
        orderBy: function () { return q; },
        limit: function (n) { lim = n; return q; },
        get: function () {
          return rpc('list_choices', { p_limit: lim }).then(function (rows) {
            // PostgREST 回傳 setof jsonb 時是物件陣列；保險起見也接受被函式名稱包起來的格式
            rows = Array.isArray(rows) ? rows : [];
            var docs = [];
            rows.forEach(function (r) { if (r && r.list_choices) r = r.list_choices; if (r && typeof r === 'object' && r._id) docs.push({ id: r._id, data: function () { return r; } }); });
            return { docs: docs };
          });
        }
      };
      return q;
    }
    return {
      collection: function () { return query(); },
      doc: function (path) {
        var own = path === 'submissions/' + me.id;
        return {
          get: function () { return Promise.resolve({ exists: false, data: function () { return null; } }); },
          set: function (d) {
            if (!own) return Promise.reject({ code: 'not_granted' });
            return rpc('submit_choice', { p_id: me.id, p_secret: me.secret, p_data: d }).then(function (ok) { if (ok && typeof ok === 'object' && 'submit_choice' in ok) ok = ok.submit_choice; if (ok !== true && ok !== 'true') throw { code: 'not_granted' }; });
          },
          delete: function () {
            if (!own) return Promise.reject({ code: 'not_granted' });
            return rpc('withdraw_choice', { p_id: me.id, p_secret: me.secret }).then(function () { /* 已經不存在也算成功 */ });
          }
        };
      }
    };
  }

  function init() {
    if (sbOn()) {
      st.backend = 'web';
      var me = anon();
      st.uid = me.id; st.db = sbDb(me); st.canWrite = true; st.canShare = true;
      return load().then(function () {
        // 連不上資料庫（例如專案暫停）時，不再邀請分享，避免送出後才失敗
        if (st.loadErr) { st.canShare = false; st.canWrite = false; }
        st.ready = true; emit(); return st;
      });
    }
    // 純本機版（claude.ai 上的舊連結）：不使用共享資料庫，也就不會跳出登入提示
    if (CFG.local) { st.backend = 'local'; st.ready = true; emit(); return Promise.resolve(st); }
    if (!hasClaude()) { st.ready = true; emit(); return Promise.resolve(st); }
    st.backend = 'claude';
    return Promise.all([window.claude.use('db'), window.claude.use('user')]).then(function (r) {
      st.db = r[0]; st.user = r[1];
      if (!st.user) return null;
      return Promise.all([st.user.id(), st.user.can('data.write')]).then(function (x) { st.uid = x[0]; st.canWrite = x[1]; });
    }).then(function () {
      // 只有能寫入的人（作者本人、組織成員）才能分享；從公開連結進來的外部訪客只能讀
      st.canShare = !!(st.db && st.uid) && st.canWrite !== false;
      if (st.db) return load();
    }).catch(function () { /* 能力不可用：維持本機模式 */ })
      .then(function () { st.ready = true; emit(); return st; });
  }
  function load() {
    if (!st.db) return Promise.resolve();
    if (st.backend === 'web') {
      // 只有分享過的裝置才帶上匿名代號（用來顯示「你已分享」）；沒分享過就什麼都不送
      return rpc('crowd_stats', { p_id: shared() ? st.uid : null }).then(function (r) {
        if (!r || typeof r !== 'object' || r.n == null) throw { code: 'bad_stats' };
        st.server = true; st.rows = []; st.mineFlag = !!r.mine;
        st.realN = r.realN || 0; st.demoN = r.demoN || 0; st.demoOn = !!r.demoOn;
        st.stats = { n: r.n, by: r.by || {}, thHist: r.thHist || [], thMedian: r.thMedian, perChildMedian: r.perChildMedian, byCounty: r.byCounty || {} };
        st.loaded = true; st.loadErr = null; emit();
      }).catch(function (e) {
        // 資料庫還沒升級（沒有 crowd_stats）或暫時失敗：改讀原始資料
        st.server = false; st.mineFlag = undefined;
        return loadRows();
      });
    }
    return loadRows();
  }
  function loadRows() {
    return st.db.collection('submissions').orderBy('ts', 'desc').limit(st.backend === 'web' ? 3000 : 1000).get().then(function (snap) {
      // 雲端讀回的資料是唯讀的，一律複製一份再使用
      var all = snap.docs.map(function (d) { var o = JSON.parse(JSON.stringify(d.data() || {})); o._id = d.id; return o; }).filter(function (o) { return o.v >= 2; });
      // 示範資料（作者產生、不是真人填的）：畫面上一律註明；真實分享滿 DEMO_OFF 筆後就不再計入
      var real = all.filter(function (o) { return !o.demo; });
      st.realN = real.length; st.demoN = all.length - real.length;
      st.demoOn = st.demoN > 0 && real.length < DEMO_OFF;
      st.rows = st.demoOn ? all : real;
      st.loaded = true; st.loadErr = null; st.stats = aggregate(st.rows); emit();
    }).catch(function (e) { st.loadErr = (e && (e.code || e.message)) || 'error';
      // 連不上資料庫是預期內的狀況（離線、專案暫停）：只記錄，不跳出錯誤提示
      try { if (window.__diag) window.__diag.errors.push('load: ' + st.loadErr); } catch (x) { /* 忽略 */ } st.stats = aggregate([]); emit(); });
  }
  // 分享規則：只有「第一次送出」會自動分享；之後重新送出或在報告裡調整設定都不會更新，
  // 要更新必須在報告的「其他人怎麼選？」按「更新」（避免一直覆蓋成參考價值較低的試玩設定）
  function sig(o) {
    var norm = function (v) { if (Array.isArray(v)) return v.map(norm); if (v && typeof v === 'object') { var r = {}; Object.keys(v).sort().forEach(function (k) { if (k !== '__norm') r[k] = norm(v[k]); }); return r; } return v; };
    try { return JSON.stringify(norm(o)); } catch (e) { return ''; }
  }
  function shared() { return U.store.get('shared', null); }
  function hasShared() { return !!shared() || !!mine(); }
  function submit(doc, from) {
    if (!st.db || !st.uid) return Promise.resolve(false);
    return st.db.doc('submissions/' + st.uid).set(doc).then(function () { U.store.set('shared', { ts: Date.now(), sig: from ? sig(from) : '' }); return load().then(function () { if (st.server) { st.mineFlag = true; emit(); } }).then(function () { return true; }); }, function (e) {
      if (e && (e.code === 'invalid_argument' || e.code === 'not_granted' || e.code === 'revoked')) { st.canShare = false; st.canWrite = false; }
      st.shareErr = e && e.code; emit(); return false;
    });
  }
  function withdraw() {
    if (!st.db || !st.uid) return Promise.resolve(false);
    return st.db.doc('submissions/' + st.uid).delete().then(function () { U.store.set('shared', null); return load().then(function () { if (st.server) { st.mineFlag = false; emit(); } }).then(function () { return true; }); }, function () { return false; });
  }
  function mine() {
    if (!st.uid) return null;
    if (st.mineFlag !== undefined) return st.mineFlag ? { _id: st.uid } : null;
    for (var i = 0; i < st.rows.length; i++) if (st.rows[i]._id === st.uid) return st.rows[i];
    return null;
  }

  // 只保留粗略、無法識別個人的欄位
  var KEYS = ['county', 'district', 'partner', 'kids', 'spacing', 'room', 'housing', 'buyWhen', 'build', 'loan', 'reno', 'postpartum', 'leave', 'care', 'quitUntil', 'preschool', 'school', 'after', 'cram', 'uni', 'uniAway', 'support', 'transport', 'lifestyle', 'travel', 'elder', 'elderCare', 'incomeMode'];
  function buildDoc(s, res, th) {
    var d = { v: 2, ts: Date.now() };
    KEYS.forEach(function (k) { d[k] = s[k]; });
    d.ageBand = Math.floor(s.ageA / 5) * 5;
    d.birthAge = s.firstBirthAge;
    d.indA = s.jobA.industry; d.indB = s.partner ? s.jobB.industry : null;
    if (s.incomeMode === 'full') { d.prA = Math.round(s.jobA.pr / 5) * 5; d.prB = s.partner ? Math.round(s.jobB.pr / 5) * 5 : null; }
    d.verdict = s.incomeMode === 'full' ? res.verdict : null;
    d.th = th && th.pr != null ? Math.round(th.pr * 10) / 10 : (th ? 100 : null);
    d.perChild = Math.round(res.perChild / 1e5) * 1e5;
    d.expPR = Math.round(res.hhExpensePR);
    d.childSubs = Math.round((res.childSubs || 0) / 1e5) * 1e5;
    return d;
  }
  // 意見與回報：送到資料庫的 feedback 表（只有作者看得到）
  function canFeedback() { return sbOn(); }
  function sendFeedback(kind, message, context, page) {
    if (!canFeedback()) return Promise.reject({ code: 'unavailable' });
    return rpc('submit_feedback', { p_kind: kind, p_message: message, p_context: context || null, p_page: page || null }).then(function (r) {
      if (r && typeof r === 'object' && 'submit_feedback' in r) r = r.submit_feedback;
      if (r !== true && r !== 'true') throw { code: 'failed' };
      return true;
    });
  }
  function demoNote() { return st.demoOn ? '目前的統計含 ' + st.demoN + ' 筆作者產生的示範資料（不是真人填的）；真實分享滿 ' + DEMO_OFF + ' 筆後，示範資料就不再計入。' : ''; }
  function median(a) { if (!a.length) return null; var b = a.slice().sort(function (x, y) { return x - y; }); var m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
  function aggregate(rows) {
    var by = {};
    rows.forEach(function (r) {
      KEYS.concat(['ageBand', 'birthAge', 'verdict']).forEach(function (k) {
        if (r[k] == null) return;
        var v = String(r[k]);
        by[k] = by[k] || {}; by[k][v] = (by[k][v] || 0) + 1;
      });
    });
    var ths = rows.map(function (r) { return r.th; }).filter(function (x) { return typeof x === 'number'; });
    var pcs = rows.map(function (r) { return r.perChild; }).filter(function (x) { return typeof x === 'number' && x > 0; });
    var hist = []; for (var i = 0; i <= 100; i++) hist.push(0);
    ths.forEach(function (v) { hist[Math.max(0, Math.min(100, Math.floor(v)))]++; });
    var byC = {}, byCounty = {};
    rows.forEach(function (r) { if (typeof r.th === 'number' && r.county) (byC[r.county] = byC[r.county] || []).push(r.th); });
    Object.keys(byC).forEach(function (k) { byCounty[k] = { n: byC[k].length, med: median(byC[k]) }; });
    return { n: rows.length, by: by, thHist: hist, thMedian: median(ths), perChildMedian: median(pcs), byCounty: byCounty };
  }
  function share(key, value) {
    var S = st.stats; if (!S || S.n < MIN_N) return null;
    var m = S.by[key]; if (!m) return null;
    var tot = 0; for (var k in m) tot += m[k];
    if (tot < MIN_N) return null;
    return { pct: (m[String(value)] || 0) / tot * 100, n: tot };
  }
  var MIN_N = 5, DEMO_OFF = 20;
  // 門檻 PR 比多少比例的人高（用 1 PR 一格的分布估算）
  function thRank(v) {
    var S = st.stats; if (!S || !S.thHist || !S.thHist.length) return null;
    var tot = 0, below = 0, b = Math.max(0, Math.min(100, Math.floor(v)));
    S.thHist.forEach(function (c, i) { tot += c; if (i < b) below += c; });
    if (!tot) return null;
    below += S.thHist[b] * (v - b);
    return below / tot * 100;
  }

  // 個人存檔（雲端：每人私有路徑；本機：localStorage）
  function loadSaves() {
    var local = U.store.get('saves', null);
    if (!st.db || !st.uid || st.backend !== 'claude') return Promise.resolve(local);
    return st.db.doc('data/users/' + st.uid + '/saves').get().then(function (snap) {
      var remote = snap.exists ? JSON.parse(JSON.stringify(snap.data() || null)) : null;
      if (!remote) return local;
      if (!local) return remote;
      return (remote.ts || 0) >= (local.ts || 0) ? remote : local;
    }, function () { return local; });
  }
  var saving = Promise.resolve();
  function writeSaves(obj) {
    obj.ts = Date.now();
    U.store.set('saves', obj);
    if (!st.db || !st.uid || st.canWrite === false || st.backend !== 'claude') return Promise.resolve();
    var copy = JSON.parse(JSON.stringify(obj));
    saving = saving.then(function () { return st.db.doc('data/users/' + st.uid + '/saves').set(copy); }).catch(function (e) { if (e && e.code === 'invalid_argument') st.canWrite = false; /* 雲端存檔失敗時保留本機版本 */ });
    return saving;
  }
  // 診斷紀錄：只寫在使用者自己的私人資料夾（其他人看不到），用來找出特定裝置上的問題
  var diagWrites = 0;
  function diag(event) {
    var g = window.__diag || {};
    if (!st.db || !st.uid || st.canWrite === false || st.backend !== 'claude' || diagWrites >= 12) return;
    diagWrites++;
    var doc = {
      ts: Date.now(), event: String(event).slice(0, 40), build: g.build || '', ua: String(navigator.userAgent || '').slice(0, 240),
      vis: document.visibilityState || '', timer: !!g.timer, mc: !!g.mc, raf: !!g.raf, sinceLoad: Date.now() - (g.t0 || Date.now()),
      errors: (g.errors || []).slice(-8)
    };
    try { var pr = st.db.doc('data/users/' + st.uid + '/diag').set(doc); if (pr && pr.catch) pr.catch(function () { /* 忽略 */ }); } catch (e) { /* 忽略 */ }
  }
  function downloads() {
    if (st.downloads !== undefined) return Promise.resolve(st.downloads);
    if (sbOn() || !hasClaude()) { st.downloads = webDownloads(); return Promise.resolve(st.downloads); }
    return window.claude.use('downloads').then(function (d) { st.downloads = d; return d; }, function () { st.downloads = null; return null; });
  }
  // 自架網站：手機用系統的分享選單（可以直接「儲存影像」），電腦直接下載
  function webDownloads() {
    if (typeof document === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) return null;
    var touch = (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches);
    // Threads（Barcelona）、Instagram、Facebook、LINE 的內建瀏覽器常常會忽略下載
    var inApp = /Barcelona|Threads|Instagram|FBAN|FBAV|FB_IAB|Line\//i.test(navigator.userAgent || '');
    return {
      inApp: inApp,
      save: function (o) {
        if (inApp) return inAppSave(o);
        var file = null;
        try { file = new File([o.data], o.filename, { type: o.data.type || 'image/png' }); } catch (e) { file = null; }
        if (touch && file && navigator.canShare && navigator.share) {
          try {
            if (navigator.canShare({ files: [file] })) {
              return navigator.share({ files: [file] }).then(function () { return 'shared'; }, function (e) {
                if (e && e.name === 'AbortError') throw { code: 'declined' };
                return direct(o);
              });
            }
          } catch (e) { /* 改用下載 */ }
        }
        return direct(o);
      }
    };
    // 內建瀏覽器：圖片直接顯示出來讓人長按儲存；其他檔案請對方改用一般瀏覽器開啟
    function inAppSave(o) {
      var isImg = /^image\//.test((o.data && o.data.type) || '');
      return new Promise(function (resolve) {
        U.modal(function (box, close) {
          var done = function () { close(); resolve('shown'); };
          if (isImg) {
            var url = URL.createObjectURL(o.data);
            box.appendChild(U.h('h3', {}, '長按圖片，就能儲存'));
            box.appendChild(U.h('p', { class: 'sm muted' }, '在 App 內建的瀏覽器裡沒辦法直接下載。長按下面的圖片，選「儲存影像」或「下載圖片」。'));
            box.appendChild(U.h('img', { src: url, alt: '審查結果圖卡', style: { width: '100%', borderRadius: '8px', marginTop: '10px', border: '1px solid var(--rule-soft)' } }));
          } else {
            box.appendChild(U.h('h3', {}, '請用瀏覽器開啟再下載'));
            box.appendChild(U.h('p', { class: 'sm' }, 'App 內建的瀏覽器沒辦法下載檔案。請按右上角的「⋯」，選「在瀏覽器中開啟」（Safari 或 Chrome），再按一次「下載逐年明細」。'));
          }
          box.appendChild(U.h('div', { class: 'actions' }, U.h('button', { class: 'btn', onclick: done }, '好')));
        });
      });
    }
    function direct(o) {
      var url = URL.createObjectURL(o.data), a = document.createElement('a');
      a.href = url; a.download = o.filename; a.rel = 'noopener'; a.style.display = 'none';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 4000);
      return Promise.resolve('downloaded');
    }
  }

  return { diag: diag, st: st, on: on, init: init, load: load, submit: submit, withdraw: withdraw, mine: mine, buildDoc: buildDoc, share: share, thRank: thRank, median: median, loadSaves: loadSaves, writeSaves: writeSaves, downloads: downloads, MIN_N: MIN_N, DEMO_OFF: DEMO_OFF, demoNote: demoNote, canFeedback: canFeedback, sendFeedback: sendFeedback, sig: sig, shared: shared, hasShared: hasShared };
})();
