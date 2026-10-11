/* 審查揭曉與審查報告 */
(function () {
  'use strict';
  var h = U.h, A = APP, D = DATA;

  // ---------- 印章 ----------
  var uidN = 0;
  function stampSVG(kind, lines, sub) {
    var id = 'ink' + (++uidN);
    var t = document.createElement('template');
    var col = 'var(--seal)';
    var txt = '';
    if (lines.length === 1) txt = '<text x="100" y="' + (sub ? 112 : 124) + '" text-anchor="middle" font-family="var(--f-serif)" font-weight="900" font-size="' + (lines[0].length > 2 ? 46 : 70) + '" fill="' + col + '" letter-spacing="4">' + lines[0] + '</text>';
    else txt = lines.map(function (l, i) { return '<text x="100" y="' + (88 + i * 52) + '" text-anchor="middle" font-family="var(--f-serif)" font-weight="900" font-size="44" fill="' + col + '" letter-spacing="3">' + l + '</text>'; }).join('');
    if (sub) txt += '<text x="100" y="' + (lines.length === 1 ? 152 : 168) + '" text-anchor="middle" font-family="var(--f-sans)" font-weight="700" font-size="17" fill="' + col + '">' + sub + '</text>';
    var shape = kind === 'round'
      ? '<circle cx="100" cy="100" r="88" fill="none" stroke="' + col + '" stroke-width="7"/><circle cx="100" cy="100" r="77" fill="none" stroke="' + col + '" stroke-width="2"/>'
      : '<rect x="14" y="14" width="172" height="172" rx="10" fill="none" stroke="' + col + '" stroke-width="8"/><rect x="26" y="26" width="148" height="148" rx="4" fill="none" stroke="' + col + '" stroke-width="2"/>';
    t.innerHTML = '<svg viewBox="0 0 200 200" aria-hidden="true"><defs><filter id="' + id + '" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="' + (uidN * 7) + '" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.05 1.32" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter></defs><g filter="url(#' + id + ')" opacity=".92">' + shape + txt + '</g></svg>';
    return t.content.firstChild;
  }
  function verdictInfo(s, res, th) {
    var you = s.partner ? '你們' : '你';
    if (s.incomeMode !== 'full') {
      if (th.pr == null) return { stamp: { k: 'square', l: ['駁回'] }, title: '再高的收入，也撐不住這組標準。', line: '就算' + you + '的收入是同齡同業的前 0.1%，存款還是會在孩子獨立前跌破零。', tone: 'bad' };
      if (th.pr <= 1) return { stamp: { k: 'square', l: ['核准'] }, title: '幾乎任何收入都養得起。', line: '這組標準在' + D.COUNTY[s.county].name + '的花費，絕大多數受僱者都負擔得了。', tone: 'good' };
      return {
        stamp: { k: 'round', l: ['門檻'], sub: 'PR ' + U.pr(th.pr) },
        title: th.pr < 50 ? '收入贏過 ' + U.pr(th.pr) + '% 的人，就養得起。' : '收入要在前 ' + U.topPct(th.pr) + '%，才養得起。',
        line: (s.partner ? '夫妻雙方' : '你') + '的收入，都要贏過 <b>' + U.pr(th.pr) + '%</b> 的同齡、同產業受僱者。生第一胎那年，' + (s.partner ? '夫妻合計' : '') + '稅前年收入約 <b>' + U.wan(th.grossBirth) + '</b>。',
        tone: th.pr >= 80 ? 'bad' : th.pr >= 55 ? 'warn' : 'good'
      };
    }
    // 年齡一律用「那一年你幾歲」（與存摺明細相同）
    var negAge = res.firstNeg >= 0 ? s.ageA + res.firstNeg : null;
    var buyHint = '';
    if (res.house && res.firstNeg >= 0 && res.firstNeg === res.house.tb) buyHint = '缺口從買房那年開始：頭期款、稅費與裝潢一次要拿出 ' + U.wan(res.house.down + res.house.closing + res.house.reno) + '。';
    if (res.verdict === 'pass') return { stamp: { k: 'square', l: ['核准'] }, title: '核准：' + you + '養得起。', line: '從生產到孩子獨立，存款最低時仍有 <b>' + U.wan(res.minRaise) + '</b>（你 ' + (s.ageA + res.minRaiseT) + ' 歲那年），超過半年的家庭開銷。', tone: 'good' };
    if (res.verdict === 'tight') return { stamp: { k: 'square', l: ['附條件', '核准'] }, title: '勉強可以，但沒有退路。', line: '你 ' + (s.ageA + res.minRaiseT) + ' 歲那年，存款只剩 <b>' + U.wan(res.minRaise) + '</b>，不到半年的家庭開銷。一場病或一次失業，就會跌破零。', tone: 'warn' };
    if (res.verdict === 'fail') return { stamp: { k: 'square', l: ['駁回'] }, title: '駁回：中途得靠借錢。', line: '你 ' + negAge + ' 歲那年存款開始變成負的，最多欠下 <b>' + U.wan(-res.minS) + '</b>' + (res.repayT >= 0 ? '，到你 ' + (s.ageA + res.repayT) + ' 歲才還清' : '') + '。' + (buyHint ? '<br>' + buyHint : ''), tone: 'bad' };
    var nw = res.netWorthTv;
    return { stamp: { k: 'square', l: ['駁回'] }, title: '駁回：' + you + '撐不住這組標準。', line: '你 ' + negAge + ' 歲那年起入不敷出，到孩子獨立時仍負債 <b>' + U.wan(-res.endS) + '</b>。' + (buyHint ? '<br>' + buyHint : '') + (res.house && nw > 0 ? '<br>不過房子扣掉房貸後，帳面淨值約 ' + U.wan(nw) + '：錢都卡在房子裡，日常現金不夠用。' : ''), tone: 'black' };
  }
  // 不填收入時：收入在中間（PR 50）的人會怎樣
  function midLine(res, s) {
    var who = '收入在中間（PR 50）的' + (s.partner ? '夫妻' : '人');
    if (res.minS >= 0) return who + '：存款最低時還有 <b>' + U.wan(res.minRaise) + '</b>，撐得過去。';
    return who + '：你 ' + (s.ageA + res.firstNeg) + ' 歲那年存款就跌破零，最多欠下 <b>' + U.wan(-res.minS) + '</b>。';
  }
  // 同樣的標準最早幾歲生得起（一句話）
  function waitLine(s) {
    var W = A.waitMid || A.wait; if (!W) return '';
    var base = s.incomeMode === 'full' ? '收入在中間（PR 50）的話，' : '這樣的收入，';
    if (W.earliest == null) return base + '<b>存一輩子也生不起</b>：就算等到 ' + W.maxAge + ' 歲才生，還是不夠。';
    if (W.earliest <= s.ageA) return base + '<b>現在就生得起</b>。';
    if (W.earliest > W.planned) return base + '要存到 <b>' + W.earliest + ' 歲</b>才生得起，比你計畫的晚 ' + (W.earliest - W.planned) + ' 年。';
    return base + '最早 <b>' + W.earliest + ' 歲</b>就生得起。';
  }
  A.verdictInfo = verdictInfo;
  A.stampSVG = stampSVG;

  // ---------- 揭曉 ----------
  APP.screens.reveal = function (main) {
    var wrap = h('div', { class: 'reveal fade-in' });
    var sheet = h('div', { class: 'sheet' }), inn = h('div', { class: 'sheet-in' });
    sheet.appendChild(inn); wrap.appendChild(sheet); main.appendChild(wrap);
    // 送出時就直接試算（不等計時器）
    var err = null;
    try { A.compute(true); } catch (e) { err = e; U.report(e, 'reveal-compute'); }
    if (err || !A.res) {
      inn.appendChild(h('div', { class: 'form-head' }, h('div', {}, h('div', { class: 'form-kicker' }, '審查程序'), h('h2', { style: { fontSize: '24px', marginTop: '4px' } }, '試算時發生錯誤'))));
      inn.appendChild(h('p', { class: 'qnote warn' }, '很抱歉，試算沒有完成。錯誤訊息已記錄下來。你可以再試一次，或回到申請書修改。'));
      inn.appendChild(h('p', { class: 'xs muted', style: { marginTop: '8px', wordBreak: 'break-all' } }, String(err && err.message || err || '沒有結果')));
      inn.appendChild(h('div', { class: 'cover-cta', style: { marginTop: '18px' } },
        h('button', { class: 'btn seal', onclick: function () { A.go('reveal'); } }, '再試一次'),
        h('button', { class: 'btn ghost', onclick: function () { A.qi = 0; A.go('quiz'); } }, '回到申請書')));
      COMM.diag('reveal-error');
      return;
    }
    var res = A.res, th = A.th, s = res.s;
    // 自動存檔、解鎖、分享（各自獨立，任何一步失敗都不影響結果顯示）
    U.safe(function () { A.unlock(); }, 'unlock');
    U.safe(function () { A.saveProfile('expense', null, true); A.saveProfile('income', null, true); }, 'save');
    U.safe(function () {
      U.store.set('lastResult', { v: res.verdict, th: th.pr, ts: Date.now() });
      A.submitted = JSON.parse(JSON.stringify(A.strip(A.s)));
      U.store.set('submitted', A.submitted);
    }, 'store');
    // 只有第一次送出會自動分享；之後要在報告裡按「更新」
    U.safe(function () { if (A.consent && COMM.st.canShare && !COMM.hasShared()) COMM.submit(COMM.buildDoc(s, res, th), A.submitted); }, 'submit');
    COMM.diag('reveal');

    var rows = res.years.slice(0, res.Tv + 1);
    var n = rows.length, delay = U.reduceMotion() ? 0 : Math.min(70, 1800 / n);
    var T = Math.round(n * delay + 350);
    wrap.style.setProperty('--t', T + 'ms');
    var skip = h('button', { class: 'linkbtn skip-btn', onclick: function () { wrap.classList.add('skip'); ledgerBox.scrollTop = ledgerBox.scrollHeight; } }, '直接看結果');
    inn.appendChild(h('div', { class: 'form-head' },
      h('div', {}, h('div', { class: 'form-kicker' }, '審查程序'),
        h('h2', { class: 'phase-wrap', style: { fontSize: '24px', marginTop: '4px' } }, h('span', { class: 'phase-a' }, '正在逐年試算你的存摺…'), h('span', { class: 'phase-b' }, '審查完成'))),
      h('div', { class: 'form-no' }, '收件 ' + new Date().toISOString().slice(0, 10), h('br'), skip)));
    var vi = verdictInfo(s, res, th);
    var st = h('div', { class: 'stamp drop' }); st.appendChild(stampSVG(vi.stamp.k, vi.stamp.l, vi.stamp.sub));
    var thMode = s.incomeMode !== 'full';
    var vt = h('div', { class: 'verdict-text later', style: { '--t': (T + 150) + 'ms' } }, h('h2', { class: 'verdict-title' }, vi.title), h('p', { class: 'verdict-line', html: vi.line }),
      thMode ? h('p', { class: 'verdict-line sm', html: midLine(res, s) }) : null,
      waitLine(s) ? h('p', { class: 'verdict-line sm', html: waitLine(s) }) : null,
      (vi.tone === 'bad' || vi.tone === 'black') ? h('p', { class: 'verdict-line sm muted' }, s.incomeMode === 'full' ? '被駁回的不是你，是這組條件在台灣的價格。' : '做不到的話，不是你不夠努力，是這組條件在台灣太貴了。') : null);
    // 蓋章與結論：印完存摺前不佔空間，存摺就在標題正下方逐行印出
    inn.appendChild(h('div', { class: 'reveal-slot' }, h('div', { class: 'verdict-head' }, st, vt)));
    if (thMode) inn.appendChild(h('p', { class: 'ledger-cap' }, U.icon('info'), '你沒有填收入，存摺以收入在中間（PR 50）的' + (s.partner ? '夫妻' : '人') + '演示'));
    var ledgerBox = h('div', { class: 'ledger-scroll', style: { marginTop: thMode ? '8px' : '18px' } });
    inn.appendChild(ledgerBox);
    var led = ledger(rows, res, true);
    ledgerBox.appendChild(led);
    Array.prototype.forEach.call(led.querySelectorAll('.ledger-row:not(.head)'), function (r, i) { r.style.animationDelay = Math.round(i * delay) + 'ms'; });
    inn.appendChild(h('div', { class: 'cover-cta later', style: { marginTop: '22px', '--t': (T + 300) + 'ms' } },
      h('button', { class: 'btn seal', onclick: function () { A.go('report'); } }, '查看完整審查報告', U.icon('next')),
      h('button', { class: 'btn ghost', onclick: function () { A.qi = 0; A.go('quiz'); } }, '修改申請書'),
      h('span', { class: 'sm muted' }, '實驗室已解鎖。')));
    // 存摺捲動跟著「正在印的那一行」走（純裝飾，不影響結果）
    var rowEls = led.querySelectorAll('.ledger-row:not(.head)');
    var t0 = null, lastIdx = -1;
    var follow = function (now) {
      if (!wrap.isConnected) return;
      if (t0 == null) t0 = now;
      if (wrap.classList.contains('skip') || !delay) { ledgerBox.scrollTop = ledgerBox.scrollHeight; return; }
      var idx = Math.min(rowEls.length - 1, Math.floor((now - t0) / delay));
      if (idx !== lastIdx && rowEls[idx]) {
        lastIdx = idx;
        var r = rowEls[idx], target = ledgerBox.scrollTop + (r.getBoundingClientRect().bottom - ledgerBox.getBoundingClientRect().bottom) + 6;
        if (target > ledgerBox.scrollTop) ledgerBox.scrollTo({ top: target, behavior: 'smooth' });
      }
      if (idx < rowEls.length - 1) requestAnimationFrame(follow);
    };
    try { requestAnimationFrame(follow); } catch (e) { /* 不支援時不捲動 */ }
  };

  function ledger(rows, res, printing) {
    var box = h('div', { class: 'ledger' + (printing ? ' printing' : '') });
    box.appendChild(h('div', { class: 'ledger-row head' }, h('span', {}, '年'), h('span', {}, '年齡'), h('span', {}, '摘要'), h('span', { class: 'r c-out' }, '支出'), h('span', { class: 'r c-in' }, '存入'), h('span', { class: 'r' }, '結餘')));
    rows.forEach(function (y) {
      var memo = y.events.map(Charts.evtText).filter(Boolean).join('、');
      if (!memo && y.kids.length) memo = '孩子 ' + y.kids.filter(function (k) { return k < res.endAge; }).join('・') + ' 歲';
      var cls = 'ledger-row' + (y.t === res.minT && res.minS < 0 ? ' hl' : '') + (y.t > res.Tv ? ' dim' : '');
      box.appendChild(h('div', { class: cls },
        h('span', {}, String(y.year)), h('span', {}, String(y.ageA)), h('span', { class: 'memo' }, memo),
        h('span', { class: 'r c-out' }, U.wan(Charts.expense(y), { plain: true })),
        h('span', { class: 'r c-in' }, U.wan(Charts.income(y), { plain: true })),
        h('span', { class: 'r' + (y.S < 0 ? ' neg' : '') }, U.wan(y.S))));
    });
    return box;
  }

  // ---------- 報告 ----------
  A.undo = A.undo || [];
  APP.screens.report = function (main) {
    if (!A.submitted) A.submitted = U.store.get('submitted', null) || JSON.parse(JSON.stringify(A.strip(A.s)));
    var grid = h('div', { class: 'report' });
    var side = h('aside', { class: 'report-side drawer', 'aria-label': '調整設定' });
    var mainCol = h('div', { class: 'report-main' });
    grid.appendChild(side); grid.appendChild(mainCol);
    main.appendChild(grid);
    var scrim = null;
    var drawerBtn = h('button', { class: 'btn drawer-btn', 'aria-expanded': 'false', onclick: function () {
      side.classList.add('open'); drawerBtn.setAttribute('aria-expanded', 'true');
      scrim = h('div', { class: 'scrim', onclick: closeDrawer }); document.body.appendChild(scrim);
      document.body.style.overflow = 'hidden';
      U.task(function () { var f = side.querySelector('button, select'); if (f) f.focus(); });
    } }, U.icon('sliders'), '調整設定');
    document.body.classList.add('has-fab');
    var onEsc = function (e) { if (e.key === 'Escape' && side.classList.contains('open')) { closeDrawer(); drawerBtn.focus(); } };
    document.addEventListener('keydown', onEsc);
    main.appendChild(drawerBtn);
    function closeDrawer() { if (!side.classList.contains('open')) return; side.classList.remove('open'); drawerBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; if (scrim && scrim.parentNode) scrim.parentNode.removeChild(scrim); scrim = null; }
    var redrawPending = false;
    var redraw = function () { if (redrawPending) return; redrawPending = true; U.task(function () { redrawPending = false; A.compute(); drawMain(); }, 'report-redraw'); };
    buildPanel(side, function () { redraw(); }, closeDrawer);
    drawMain();
    A.onComm = function () { var c = mainCol.querySelector('#sec-crowd'); if (c) c.replaceWith(crowdSection()); };
    var prevC = A.cleanup; A.cleanup = function () { A.onComm = null; closeDrawer(); document.removeEventListener('keydown', onEsc); document.body.classList.remove('has-fab'); if (prevC) prevC(); };

    function drawMain() {
      A.compute();
      var y = window.scrollY;
      U.clear(mainCol);
      var res = A.res, th = A.th, s = res.s, view = A.view || res;
      mainCol.appendChild(headSection(res, th, s, view));
      mainCol.appendChild(flowSection(view, s));
      mainCol.appendChild(waitSection(s));
      mainCol.appendChild(childSection(view, s));
      mainCol.appendChild(spendSection(view, s));
      mainCol.appendChild(compSection(res, th, s));
      mainCol.appendChild(crowdSection());
      mainCol.appendChild(saveSection(res, th, s));
      window.scrollTo(0, y);
    }
    A.drawMain = drawMain;
    A.redrawReport = function () { A.dirty = true; A.compute(); drawMain(); U.clear(side); buildPanel(side, function () { redraw(); }, closeDrawer); };
  };

  function headSection(res, th, s, view) {
    view = view || res;
    var vi = verdictInfo(s, res, th);
    var sec = h('section', { class: 'rsec', id: 'sec-head' });
    var changed = A.submitted && JSON.stringify(A.pick(A.strip(A.s), A.EXP_KEYS.concat(A.INC_KEYS))) !== JSON.stringify(A.pick(A.submitted, A.EXP_KEYS.concat(A.INC_KEYS)));
    sec.appendChild(h('div', { class: 'rsec-k' }, '審查報告' + (changed ? '・已依調整後的設定重算' : '')));
    var stp = h('div', { class: 'stamp still', style: { width: '150px', height: '150px' } }); stp.appendChild(stampSVG(vi.stamp.k, vi.stamp.l, vi.stamp.sub));
    sec.appendChild(h('div', { class: 'verdict-head' }, stp, h('div', { class: 'verdict-text' }, h('h1', { class: 'verdict-title' }, vi.title), h('p', { class: 'verdict-line', html: vi.line }), h('p', { class: 'sm muted', style: { marginTop: '8px' } }, summaryLine(s)))));
    if (A.undo.length) sec.appendChild(h('p', { style: { marginTop: '10px' } }, h('button', { class: 'linkbtn', onclick: function () { A.s = ENGINE.normalize(A.undo.pop()); A.persist(); A.redrawReport(); } }, '復原上一個調整')));
    sec.appendChild(peopleBlock(res, th, s));
    var tiles = h('div', { class: 'tiles six' });
    // 門檻
    var thTxt = th.pr == null ? '>99.9' : U.pr(th.pr);
    var thDesc = th.pr == null ? '再高的收入也不夠' : th.pr <= 1 ? '幾乎任何收入都夠' : (s.partner ? '雙方都要贏過 ' : '你要贏過 ') + thTxt + '% 的同齡同業' + (th.grossBirth ? '；' + (s.partner ? '合計' : '') + '年收入約 ' + U.wan(th.grossBirth) : '');
    tiles.appendChild(tile('門檻收入 PR', thTxt, thDesc, s.incomeMode !== 'full'));
    if (s.incomeMode === 'full') {
      var hhp = res.hhIncomePR;
      tiles.appendChild(tile(s.partner ? '你們的收入' : '你的收入', 'PR ' + U.pr(res.prA) + (s.partner ? '／' + U.pr(res.prB) : ''), '現在的家庭可支配所得，贏過 ' + U.pr(hhp) + '% 的台灣家庭', false));
      var lo = res.low;
      tiles.appendChild(tile(lo.v < 0 ? '最多負債' : '孩子出生後的最低存款', U.wan(lo.v), '你 ' + (s.ageA + lo.t) + ' 歲那年', lo.v < 0));
    } else {
      // A.res 就是「收入在中間（PR 50）」的完整試算
      var md = res.low;
      tiles.appendChild(tile('如果收入剛好在中間（PR 50）', U.wan(md.v), md.v < 0 ? '最多負債，你 ' + (s.ageA + md.t) + ' 歲那年' : '孩子出生後的最低存款', md.v < 0));
    }
    var W = A.wait;
    if (W) tiles.appendChild(tile(s.incomeMode === 'full' ? '最早幾歲生得起' : '中間收入最早幾歲生得起', W.earliest == null ? '生不起' : W.earliest + '<small>歲</small>', W.earliest == null ? '存到 ' + W.maxAge + ' 歲也不夠' : W.earliest <= s.ageA ? '現在就可以' : '要先存 ' + (W.earliest - s.ageA) + ' 年', W.earliest == null || W.earliest > W.planned, true));
    tiles.appendChild(tile('你的養育標準', '花費 PR ' + U.pr(view.hhExpensePR), '養孩子那些年，家庭支出約比 ' + U.pr(view.hhExpensePR) + '% 的台灣家庭多（估計）', false));
    tiles.appendChild(tile('平均每個孩子的淨成本', U.wan(view.perChild), '多花加少賺，扣掉現金補助', false));
    if (s.incomeMode !== 'full') tiles.appendChild(tile('因為孩子拿到的補助', U.wan(view.childSubs), s.kids + ' 個孩子合計，約佔養育成本 ' + Math.round(view.childSubs / Math.max(1, view.childGross + view.feeSubs) * 100) + '%', false));
    sec.appendChild(tiles);
    return sec;
  }
  // 10×10 小人圖：100 個同齡（同產業）的人，收入達到門檻的有幾個
  function peopleInfo(res, th, s) {
    var n = People.count(th.pr);
    var peer = s.jobA.industry === 'all' && (!s.partner || s.jobB.industry === 'all') ? '同齡的人' : '同齡同業的人';
    return { n: n, peer: peer, say: peer + '，收入養得起', aria: '每 100 個' + peer + '，有 ' + n + ' 個人的收入養得起這組標準' };
  }
  // 100 人圖：只留數字與一句話
  function peopleBlock(res, th, s) {
    var info = peopleInfo(res, th, s);
    var anim = !A.peopleShown && !U.reduceMotion(); A.peopleShown = true;
    return h('figure', { class: 'pp-block' },
      h('figcaption', { class: 'pp-head' }, h('b', { class: 'pp-n' }, String(info.n)), h('span', { class: 'pp-of' }, '／100'), h('span', { class: 'pp-say' }, info.say)),
      People.svg(th.pr, { n: info.n, animate: anim, label: info.aria }));
  }
  function tile(l, v, d, hl, isHtml) { return h('div', { class: 'tile' + (hl ? ' hl' : '') }, h('div', { class: 'tile-l' }, l), isHtml ? h('div', { class: 'tile-v', html: v }) : h('div', { class: 'tile-v' }, v), d ? h('div', { class: 'tile-d' }, d) : null); }
  // ---------- 要存到幾歲才生得起 ----------
  function waitSection(s) {
    var W = A.wait, sec = h('section', { class: 'rsec', id: 'sec-wait' });
    sec.appendChild(h('div', { class: 'rsec-k num' }));
    sec.appendChild(h('h2', {}, '同樣的標準，要存到幾歲才生得起？'));
    if (!W) return sec;
    var full = s.incomeMode === 'full';
    var who = full ? (s.partner ? '你們現在的收入' : '你現在的收入') : '收入在中間（PR 50）的' + (s.partner ? '夫妻' : '人');
    sec.appendChild(h('p', { class: 'rsec-lede' }, '其他條件都不變，只把第一胎往後延：每晚一年，就多存一年的錢，薪水也會隨年資成長。以' + who + '逐年試算，從你 ' + s.ageA + ' 歲到 ' + W.maxAge + ' 歲。'));
    var E = W.earliest, P = W.planned, gap = W.gap;
    var lastKid = function (a) { return a + (s.kids - 1) * s.spacing + ENGINE.supportEndAge(s.support); };
    var big, sub = [];
    if (E == null) {
      big = h('div', { class: 'wait-big never' }, h('b', {}, '存一輩子也生不起'));
      sub.push('就算一路存到 ' + W.maxAge + ' 歲才生第一胎，存款還是會在孩子獨立前跌破零。');
      sub.push('問題不在時間，而在這組標準的價格：往下看「要放棄什麼」。');
    } else if (E <= s.ageA) {
      big = h('div', { class: 'wait-big now' }, h('span', {}, '現在'), h('b', {}, '就生得起'));
      sub.push(s.ageA + ' 歲的現在生第一胎，存款也不會跌破零。' + (P > E ? '你計畫 ' + P + ' 歲生，時間上有餘裕。' : ''));
    } else {
      big = h('div', { class: 'wait-big' + (E > P ? ' late' : '') }, h('span', {}, '最早'), h('b', {}, E), h('span', {}, '歲'));
      var t = '要先存 ' + (E - s.ageA) + ' 年的錢';
      if (P < E) t += '，比你計畫的 ' + P + ' 歲晚 ' + (E - P) + ' 年';
      else t += '；你計畫 ' + P + ' 歲生，來得及';
      if (s.partner && gap != null) t += '。那時伴侶 ' + (E + gap) + ' 歲';
      sub.push(t + '。');
    }
    if (E != null && !W.plannedOk && E < P) sub.push('不過照你計畫的 ' + P + ' 歲才生，反而不夠：孩子還沒獨立，你就退休、收入變少了。');
    if (full && A.waitMid) {
      var M = A.waitMid.earliest;
      sub.push('如果收入在中間（PR 50）：' + (M == null ? '存一輩子也生不起。' : M <= s.ageA ? '現在就生得起。' : '最早 ' + M + ' 歲才生得起。'));
    }
    if (E != null) {
      var la = lastKid(E);
      sub.push('最小的孩子獨立時，你已經 ' + la + ' 歲' + (la >= 65 ? '，過了退休年齡。' : '。'));
    }
    var hi = h('div', { class: 'wait-head' }, big, h('div', { class: 'wait-sub' }, sub.map(function (x) { return h('p', {}, x); })));
    sec.appendChild(hi);
    var box = h('div', { class: 'chart-box wait-chart' });
    sec.appendChild(box);
    U.task(function () { drawWait(box, W, s); }, 'wait-chart');
    sec.appendChild(h('div', { class: 'chart-legend', style: { marginTop: '8px' } },
      h('span', {}, h('i', { class: 'area', style: { background: 'var(--good)' } }), '這一年生，存款撐得住'),
      h('span', {}, h('i', { class: 'area', style: { background: 'var(--bad)' } }), '撐不住（柱子是最多欠多少）'),
      h('span', {}, h('i', { class: 'area', style: { background: 'var(--warn-soft)', boxShadow: 'inset 0 0 0 1px var(--warn)' } }), '高齡妊娠')));
    sec.appendChild(h('p', { class: 'xs muted', style: { marginTop: '6px' } }, '高齡妊娠：國健署以生產時滿 34 歲為高齡孕婦。圖上是你的年齡' + (s.partner && gap ? '；如果生產的是伴侶，請把年齡' + (gap > 0 ? '加 ' + gap : '減 ' + (-gap)) + ' 歲' : '') + '。45 歲以後懷孕的機率很低，所以只算到 45 歲。'));
    return sec;
  }
  function drawWait(box, W, s) {
    var list = W.list; if (!list.length) return;
    // 依實際寬度決定座標（手機上字不會被縮得太小）
    var Wd = Math.max(320, Math.min(660, Math.round(box.clientWidth || 660))), Hd = Wd < 480 ? 210 : 232, L = 50, R = 10, T = 46, B = 28;
    var pw = Wd - L - R, ph = Hd - T - B, n = list.length, bw = pw / n;
    var mx = 0, mn = 0;
    list.forEach(function (d) { mx = Math.max(mx, d.minS); mn = Math.min(mn, d.minS); });
    var hasPos = mx > 0, hasNeg = mn < 0;
    if (mx <= 0) mx = Math.max(1, -mn * 0.12); if (mn >= 0) mn = -Math.max(1, mx * 0.12);
    var y = function (v) { return T + (mx - v) / (mx - mn) * ph; }, y0 = y(0);
    var svg = U.svg('svg', { viewBox: '0 0 ' + Wd + ' ' + Hd, role: 'img', 'aria-label': W.earliest == null ? '每一個年齡生第一胎，存款都會跌破零' : '最早 ' + W.earliest + ' 歲生第一胎，存款才不會跌破零' });
    var cx = function (age) { return L + (age - list[0].age) * bw + bw / 2; };
    // 高齡妊娠區（以你的年齡標示）
    var i34 = list.findIndex(function (d) { return d.age >= 34; });
    if (i34 >= 0) {
      svg.appendChild(U.svg('rect', { x: (L + i34 * bw).toFixed(1), y: 4, width: ((n - i34) * bw).toFixed(1), height: T + ph - 4, fill: 'var(--warn-soft)' }));
      svg.appendChild(U.svg('text', { x: (L + i34 * bw + 6).toFixed(1), y: 17, class: 'wband-t', text: '高齡妊娠' }));
    }
    svg.appendChild(U.svg('line', { x1: L, x2: Wd - R, y1: y0, y2: y0, stroke: 'var(--ink-3)', 'stroke-width': 1 }));
    svg.appendChild(U.svg('text', { x: L - 6, y: y0 + 4, 'text-anchor': 'end', text: '0' }));
    if (hasPos && y0 - y(mx) > 14) svg.appendChild(U.svg('text', { x: L - 6, y: y(mx) + 4, 'text-anchor': 'end', text: U.wan(mx).replace(' ', '') }));
    if (hasNeg && y(mn) - y0 > 14) svg.appendChild(U.svg('text', { x: L - 6, y: y(mn) + 4, 'text-anchor': 'end', text: U.wan(mn).replace(' ', '') }));
    list.forEach(function (d, i) {
      var x = L + i * bw + Math.max(1, bw * 0.14), w = Math.max(2, bw * 0.72);
      var y1 = Math.min(y(d.minS), y0), hh = Math.max(1.5, Math.abs(y(d.minS) - y0));
      var r = U.svg('rect', { x: x.toFixed(1), y: y1.toFixed(1), width: w.toFixed(1), height: hh.toFixed(1), rx: 1.5, class: 'wbar ' + (d.ok ? 'ok' : 'no') + (d.age === W.planned ? ' plan' : '') });
      r.appendChild(U.svg('title', { text: '第一胎在你 ' + d.age + ' 歲：' + (d.ok ? '存款最低時還有 ' + U.wan(d.minS) : '最多欠 ' + U.wan(-d.minS)) }));
      svg.appendChild(r);
      if (d.age % 5 === 0 || i === 0 || i === n - 1) svg.appendChild(U.svg('text', { x: cx(d.age).toFixed(1), y: Hd - 8, 'text-anchor': 'middle', text: d.age + (i === 0 ? ' 歲' : '') }));
    });
    // 標記：最早、你的計畫（兩者太近時往兩側錯開）
    var marks = [];
    if (W.earliest != null) marks.push({ age: W.earliest, t: '最早 ' + W.earliest + ' 歲', c: 'e' });
    if (W.planned !== W.earliest) marks.push({ age: W.planned, t: '你計畫 ' + W.planned + ' 歲', c: 'p' });
    marks.sort(function (a, b) { return a.age - b.age; });
    var close = marks.length === 2 && (cx(marks[1].age) - cx(marks[0].age)) < 96;
    marks.forEach(function (m, k) {
      var x = cx(m.age), anchor = close ? (k === 0 ? 'end' : 'start') : 'middle', tx = close ? (k === 0 ? x + 3 : x - 3) : x;
      if (!close && x < L + 40) { anchor = 'start'; tx = x - 4; }
      if (!close && x > Wd - R - 40) { anchor = 'end'; tx = x + 4; }
      svg.appendChild(U.svg('line', { x1: x, x2: x, y1: T - 6, y2: T + ph, class: 'wmark ' + m.c }));
      svg.appendChild(U.svg('text', { x: tx.toFixed(1), y: T - 11, 'text-anchor': anchor, class: 'wmark-t ' + m.c, text: m.t }));
    });
    box.appendChild(svg);
  }
  function summaryLine(s) {
    var c = D.COUNTY[s.county];
    return '條件：' + QS.placeName(s) + '・' + (s.partner ? '雙親' : '單親') + '・' + s.kids + ' 個孩子（第一胎在你 ' + s.firstBirthAge + ' 歲）・' + QS.labelOf('housing', s.housing) + '・' + QS.labelOf('care', s.care) + '・供養到 ' + ENGINE.supportEndAge(s.support) + ' 歲。';
  }

  function flowSection(res, s) {
    var sec = h('section', { class: 'rsec', id: 'sec-flow' });
    sec.appendChild(h('div', { class: 'rsec-k num' }));
    sec.appendChild(h('h2', {}, '你的存摺，一年一年地走'));
    var thMode = s.incomeMode !== 'full';
    var thLede = '';
    if (thMode) {
      var atTh = A.viewMode === 'threshold' && A.thView;
      var both = s.partner ? '雙方' : '你';
      var thPr = A.th && A.th.pr;
      if (atTh) thLede = thPr == null ? '即使' + both + '的收入都在 <b>PR 99.9</b>，存款最低仍會到 <b>' + U.wan(res.minS) + '</b>。' : '以<b>門檻收入（' + both + ' PR ' + U.pr(thPr) + '）</b>試算，存款最低點剛好碰到零。';
      else thLede = (s.partner ? '以雙方收入都在' : '以你的收入在') + '<b>中間（PR 50）</b>試算：' + (res.minS >= 0 ? '存款最低時還有 <b>' + U.wan(res.minRaise) + '</b>（你 ' + (s.ageA + res.minRaiseT) + ' 歲那年），撐得過去。' : '你 ' + (s.ageA + res.firstNeg) + ' 歲那年存款跌破零，最多欠下 <b>' + U.wan(-res.minS) + '</b>。');
      var setView = function (mode) {
        if ((A.viewMode === 'threshold') === (mode === 'threshold')) return;
        A.viewMode = mode; A.view = mode === 'threshold' ? A.thView : A.res;
        if (A.drawMain) { A.drawMain(); var f = document.getElementById('sec-flow'); if (f) { var b = f.querySelector('.seg button[aria-pressed="true"]'); if (b) b.focus({ preventScroll: true }); } }
      };
      var thLabel = thPr == null ? '最高收入（PR 99.9）' : '門檻收入（PR ' + U.pr(thPr) + '）';
      sec.appendChild(h('div', { class: 'seg view-seg', role: 'group', 'aria-label': '用哪一種收入試算' },
        h('button', { type: 'button', 'aria-pressed': atTh ? 'false' : 'true', onclick: function () { setView('mid'); } }, '中間收入（PR 50）'),
        h('button', { type: 'button', 'aria-pressed': atTh ? 'true' : 'false', onclick: function () { setView('threshold'); } }, thLabel)));
    }
    sec.appendChild(h('p', { class: 'rsec-lede', html: thLede + (thMode ? '<br>' : '') + '上圖是每年年底的存款；下圖是每年稅後收入（含補助）與支出。全部換算成 2026 年的幣值。' + (res.house ? '房貸以每年 2% 通膨換算，越往後實質負擔越輕。' : '') + (thMode ? '下方「養一個孩子」與「錢花到哪」也會跟著切換。' : '') }));
    var showPar = A.showParallel !== false;
    var ctrl = h('div', { class: 'chart-ctrl' });
    var leg = h('div', { class: 'chart-legend' },
      h('span', {}, h('i', { style: { background: 'var(--s-save)' } }), '存款'),
      showPar ? h('span', {}, h('i', { style: { background: 'var(--s-alt)' } }), s.housing === 'family' ? '不生小孩的存款' : '不生小孩（租屋）的存款') : null,
      h('span', {}, h('i', { style: { background: 'var(--s-income)' } }), '收入'),
      h('span', {}, h('i', { style: { background: 'var(--s-expense)' } }), '支出'));
    var tg = h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: showPar, onchange: function (e) { A.showParallel = e.target.checked; sec.replaceWith(flowSection(A.view || A.res, A.res.s)); } }), '比較不生小孩的平行世界');
    ctrl.appendChild(leg); ctrl.appendChild(tg);
    sec.appendChild(ctrl);
    var box = h('div');
    sec.appendChild(box);
    U.task(function () { Charts.cashflow(box, res, { parallel: showPar }); }, 'cashflow');
    var gap = res.savingsGap;
    var p = h('p', { class: 'sm', style: { marginTop: '12px', color: 'var(--ink-2)' } });
    var parTxt = s.housing === 'family' ? '不生小孩的平行世界（一樣住長輩家）' : '不生小孩、' + (s.partner ? '兩人' : '一個人') + '租屋的平行世界';
    var nwTxt = res.house ? '你的房子扣掉房貸後約值 ' + U.wan(res.houseEquity) + '，算進去的話，平行世界' + (res.netWorthGap > 0 ? '仍多 <b>' + U.wan(res.netWorthGap) + '</b>。' : '反而少 ' + U.wan(-res.netWorthGap) + '。') : '';
    p.innerHTML = '到最小的孩子獨立時（你 ' + (s.ageA + res.Tv) + ' 歲），' + (gap > 0 ? parTxt + '會多存 <b>' + U.wan(gap) + '</b> 現金。' : parTxt + '的存款和你差不多。') + nwTxt + (res.house && res.house.wantQ && !res.house.qOK ? ' 不符合新青安：' + res.house.qReason + '。' : '');
    sec.appendChild(p);
    var det = h('details', { style: { marginTop: '14px' }, open: !!A.ledgerOpen });
    det.appendChild(h('summary', { class: 'sm', style: { cursor: 'pointer', color: 'var(--pen)' } }, '展開存摺明細（逐年數字）'));
    var fill = function () { if (!det.querySelector('.ledger-scroll')) { var lb = h('div', { class: 'ledger-scroll', style: { marginTop: '10px' } }); lb.appendChild(ledger(res.years.slice(0, Math.min(res.years.length, 65 - s.ageA)), res, false)); det.appendChild(lb); } };
    det.addEventListener('toggle', function () { A.ledgerOpen = det.open; if (det.open) fill(); });
    if (A.ledgerOpen) fill();
    sec.appendChild(det);
    // 逐年明細（CSV）：任何人都能用 Excel 或 Google 試算表一年一年對帳
    var csvBtn = h('button', { type: 'button', class: 'btn ghost small', hidden: true, style: { marginTop: '12px' }, onclick: function () { downloadCsv(res, s); } }, U.icon('download'), '下載逐年明細（Excel 可開）');
    sec.appendChild(csvBtn);
    COMM.downloads().then(function (d) { if (d) csvBtn.hidden = false; });
    return sec;
  }
  function csvCell(v) {
    if (v == null) return '';
    if (typeof v === 'number') return String(Math.round(v));
    var t = String(v);
    return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  }
  function yearsCsv(res, s) {
    var thMode = s.incomeMode !== 'full', atTh = thMode && A.viewMode === 'threshold' && A.thView === res;
    var par = res.parallel, rows = res.years.slice(0, Math.min(res.years.length, 65 - s.ageA + 1));
    var cols = [
      ['年份', function (y) { return String(y.year); }],
      ['你的年齡', function (y) { return String(y.ageA); }]
    ];
    if (s.partner) cols.push(['伴侶年齡', function (y) { return String(y.ageB); }]);
    cols = cols.concat([
      ['孩子年齡', function (y) { return y.kids.filter(function (k) { return k >= 0; }).join('、'); }],
      ['這一年發生的事', function (y) { return y.events.map(Charts.evtText).filter(Boolean).join('、'); }],
      ['年初存款', function (y) { return y.Sstart; }],
      ['你的稅前薪資', function (y) { return y.gA; }]
    ]);
    if (s.partner) cols.push(['伴侶的稅前薪資', function (y) { return y.gB; }]);
    cols = cols.concat([
      ['勞健保自付（扣除）', function (y) { return y.si; }],
      ['所得稅（扣除）', function (y) { return y.tax; }],
      ['政府現金補助', function (y) { return y.transfers; }],
      ['長輩資助', function (y) { return y.gift; }],
      ['存款利息', function (y) { return y.Sstart >= 0 ? y.interest : 0; }],
      ['可用收入合計', function (y) { return y.net; }],
      ['住房（房租，或房貸本息＋管理費＋房屋稅）', function (y) { return y.exp.housing; }],
      ['買房一次付清（頭期款、稅費、裝潢）', function (y) { return y.exp.housingOnce; }],
      ['大人的生活費（含水電）', function (y) { return y.exp.living; }],
      ['生產與坐月子', function (y) { return y.exp.kidsBirth; }],
      ['0–2 歲托育', function (y) { return y.exp.kidsCare; }],
      ['教育（幼兒園到大學、補習才藝）', function (y) { return y.exp.kidsEdu; }],
      ['孩子的生活費', function (y) { return y.exp.kidsLife; }],
      ['交通', function (y) { return y.exp.transport; }],
      ['孝親費', function (y) { return y.exp.elder; }],
      ['旅遊', function (y) { return y.exp.travel; }],
      ['借款利息', function (y) { return y.exp.debtInterest; }],
      ['支出合計', function (y) { return y.expTotal; }],
      ['年底存款', function (y) { return y.S; }]
    ]);
    if (par) cols.push(['不生小孩的平行世界：年底存款', function (y, i) { var p = par.years[i]; return p ? p.S : null; }]);
    if (res.house) { cols.push(['房屋價值', function (y) { return y.homeValue; }]); cols.push(['房貸餘額', function (y) { return y.loanBal; }]); }
    var incTxt = thMode ? (atTh ? '門檻收入（PR ' + U.pr(A.th && A.th.pr != null ? A.th.pr : 99.9) + '）' : '收入在中間（PR 50）') : '你填寫的收入';
    var head = [
      ['你有資格生下一代嗎？逐年明細'],
      ['設定', A.expName(s) + '；' + A.incName(s) + '；試算收入：' + incTxt],
      ['金額', '新台幣元，已換算成 2026 年的幣值，四捨五入到元'],
      ['對帳方式', '每一年：年底存款 ＝ 年初存款 ＋ 可用收入合計 － 支出合計'],
      ['計算方法與原始碼', REPO_URL],
      []
    ];
    var lines = head.map(function (r) { return r.map(csvCell).join(','); });
    lines.push(cols.map(function (c) { return csvCell(c[0]); }).join(','));
    rows.forEach(function (y, i) { lines.push(cols.map(function (c) { return csvCell(c[1](y, i)); }).join(',')); });
    return '\ufeff' + lines.join('\r\n') + '\r\n';
  }
  function downloadCsv(res, s) {
    COMM.downloads().then(function (d) {
      if (!d) { U.toast('這個檢視無法儲存檔案'); return; }
      var blob = new Blob([yearsCsv(res, s)], { type: 'text/csv;charset=utf-8' });
      d.save({ filename: '生育資格審查-逐年明細.csv', data: blob }).then(function (m) { U.toast(m === 'shared' ? '完成' : m === 'downloaded' ? '已下載逐年明細' : '已儲存'); }, function (e) { if (e && e.code === 'declined') return; U.toast('無法儲存：' + ((e && e.message) || '請稍後再試')); });
    });
  }
  var REPO_URL = (window.TWKIDS && window.TWKIDS.repoUrl) || 'https://github.com/jasontzeng123/next-gen';

  // 第二組顏色（Okabe-Ito）給色盲友善模式
  var CATS = [
    { k: 'birth', n: '生產與坐月子', c: '#e87ba4', cv: '#cc79a7' },
    { k: 'care', n: '0–2 歲托育', c: '#6250d6', cv: '#0072b2' },
    { k: 'edu', n: '幼兒園到大學（含補習才藝）', c: '#2a78d6', cv: '#56b4e9' },
    { k: 'life', n: '孩子的生活費', c: '#1baf7a', cv: '#009e73' },
    { k: 'house', n: '為孩子多付的住房費', c: '#eda100', cv: '#e69f00' },
    { k: 'other', n: '其他（水電、旅遊、借款利息）', c: '#8a8f8b', cv: '#8a8f8b' },
    { k: 'loss', n: '少賺的收入（留停、離職）', c: '#e34948', cv: '#d55e00' }
  ];
  function childSection(res, s) {
    var sec = h('section', { class: 'rsec', id: 'sec-child' });
    sec.appendChild(h('div', { class: 'rsec-k num' }));
    sec.appendChild(h('h2', {}, '養一個孩子，要花多少？'));
    var T = res.totals, par = res.parallelSame || res.parallel, Tv = res.Tv, k = Math.max(1, s.kids);
    function sumP(f) { var v = 0; for (var i = 0; i <= Tv && i < par.years.length; i++) v += f(par.years[i]); return v; }
    var houseDiff = (T.housing + T.housingOnce) - sumP(function (y) { return y.exp.housing + y.exp.housingOnce; });
    var direct = T.kidsBirth + T.kidsCare + T.kidsEdu + T.kidsLife;
    var other = res.childCost - direct - houseDiff;
    var parts = { birth: T.kidsBirth, care: T.kidsCare, edu: T.kidsEdu, life: T.kidsLife, house: houseDiff, other: other, loss: res.incomeLoss };
    var total = res.childGross; // 各項加總（可能含負值項目）
    var pos = 0; for (var key in parts) if (parts[key] > 0) pos += parts[key];
    sec.appendChild(h('p', { class: 'rsec-lede', html: '把「有孩子」和「沒孩子」的兩個世界相減' + (res.house ? '（沒孩子的那個世界一樣買房，只是買給兩個大人住的 2 房）' : s.housing === 'rent' ? '（沒孩子的那個世界租一房一廳）' : '') + '，從懷孕到獨立，平均每個孩子讓家庭多花、少賺 <b>' + U.wan(total / k) + '</b>（托育補助、學費減免已直接折抵在費用裡）；再扣掉現金補助 ' + U.wan(res.cashSubs / k) + '，淨成本約 <b>' + U.wan(res.perChild) + '</b>。' }));
    var stack = h('div', { class: 'stack', role: 'img', 'aria-label': '每個孩子的成本組成' });
    var legend = h('div', { class: 'stack-legend' });
    var cvd = U.cvd();
    CATS.forEach(function (c0) {
      var c = { k: c0.k, n: c0.n, c: cvd ? c0.cv : c0.c };
      var v = parts[c.k]; if (Math.abs(v) < 5000) return;
      if (v > 0) stack.appendChild(h('i', { style: { width: (v / pos * 100).toFixed(2) + '%', background: c.c }, title: c.n + ' ' + U.wan(v / k) }));
      var name = c.k === 'house' ? (res.house ? (v < 0 ? '住房費反而少了（新青安可貸較多）' : '為孩子多買的房間') : (v < 0 ? '住房費反而少了' : '為孩子多租的房間')) : c.k === 'other' && v < 0 ? '其他（反而少了）' : c.n;
      legend.appendChild(h('div', {}, h('s', { style: { background: v > 0 ? c.c : 'transparent', boxShadow: v > 0 ? 'none' : 'inset 0 0 0 1.5px ' + c.c } }), h('span', {}, name), h('b', {}, U.wan(v / k))));
    });
    sec.appendChild(stack); sec.appendChild(legend);
    // 房間的算法說清楚：買房的人比較「同樣買房、但房間數不同」的兩個世界
    if (res.house && par.house && Math.abs(houseDiff) >= 5000) sec.appendChild(h('p', { class: 'xs muted', style: { marginTop: '10px' } }, '房間的成本：比較 ' + res.house.rooms + ' 房與 ' + par.house.rooms + ' 房兩個世界在頭期款、房貸本息與房屋稅費上的差額' + (houseDiff < 0 ? '；有孩子的家庭新青安額度較高、利率較低，所以反而少付。' : '。') + '多買的房間仍是你的資產，這裡沒有把它的價值扣回來。'));
    else if (!res.house && s.housing === 'rent' && houseDiff >= 5000) sec.appendChild(h('p', { class: 'xs muted', style: { marginTop: '10px' } }, '房間的成本：有孩子時要租比較大的房子，這裡是和只租一房一廳的租金差額；因孩子多領的租金補貼，另外算在下面的補助裡。'));
    // 補助
    var sb = res.subs, subRows = [['生育補助與縣市獎勵', sb.birth + sb.cityBirth], ['育兒津貼', sb.allowance], ['育嬰留停津貼', sb.leave], ['因孩子多領的租金補貼', res.rentSubKids], ['0–18 歲成長津貼', sb.growth], ['托育補助（已折抵費用）', sb.care], ['私大學費減免（已折抵學費）', sb.uni]].filter(function (r) { return r[1] > 0; });
    var sbBox = h('div', { style: { marginTop: '22px' } });
    sbBox.appendChild(h('h3', { style: { fontSize: '16px', marginBottom: '10px' } }, '因為有孩子而拿到的政府補助：' + U.wan(res.childSubs) + '（' + s.kids + ' 個孩子）'));
    var bars = h('div', { class: 'bars' });
    var mx = Math.max.apply(null, subRows.map(function (r) { return r[1]; }).concat([1]));
    subRows.forEach(function (r) { bars.appendChild(h('div', { class: 'bar-row' }, h('span', { class: 'bl' }, r[0]), h('span', { class: 'bt' }, h('i', { style: { width: (r[1] / mx * 100).toFixed(1) + '%', background: 'var(--good)' } })), h('span', { class: 'bv' }, U.wan(r[1])))); });
    sbBox.appendChild(bars);
    var pct = res.childSubs / Math.max(1, total + res.feeSubs) * 100;
    sbBox.appendChild(h('p', { class: 'sm muted', style: { marginTop: '10px' } }, '補助約佔養育成本（含已折抵部分）的 ' + pct.toFixed(0) + '%。' + (s.adv.pending ? '已計入尚未通過的 0–18 歲成長津貼。' : '尚未計入審議中的 0–18 歲成長津貼（每月 5,000 元），可在左側「進階假設」打開。') + '幼兒園繳費上限、高中職免學費等「少繳的錢」已反映在學費裡，沒有另外列出。'));
    sec.appendChild(sbBox);
    return sec;
  }

  function spendSection(res, s) {
    var sec = h('section', { class: 'rsec', id: 'sec-spend' });
    sec.appendChild(h('div', { class: 'rsec-k num' }));
    sec.appendChild(h('h2', {}, '錢都花到哪裡去了'));
    sec.appendChild(h('p', { class: 'rsec-lede' }, '從現在到最小的孩子獨立（' + (res.Tv + 1) + ' 年），整個家庭的支出總額。'));
    var T = res.totals;
    var rows = [['住房', T.housing + T.housingOnce], ['大人日常開銷', T.living], ['孩子教育', T.kidsEdu], ['孩子生活費', T.kidsLife], ['交通', T.transport], ['孝親', T.elder], ['生產與托育', T.kidsBirth + T.kidsCare], ['旅遊', T.travel], ['借款利息', T.debtInterest]].filter(function (r) { return r[1] > 0; }).sort(function (a, b) { return b[1] - a[1]; });
    var mx = rows[0] ? rows[0][1] : 1, sum = rows.reduce(function (a, r) { return a + r[1]; }, 0);
    var bars = h('div', { class: 'bars' });
    rows.forEach(function (r, i) { bars.appendChild(h('div', { class: 'bar-row' }, h('span', { class: 'bl' }, r[0]), h('span', { class: 'bt' }, h('i', { style: { width: (r[1] / mx * 100).toFixed(1) + '%', background: r[0] === '借款利息' ? 'var(--seal)' : i === 0 ? 'var(--ink-2)' : 'var(--rule)' } })), h('span', { class: 'bv' }, U.wan(r[1])))); });
    sec.appendChild(bars);
    sec.appendChild(h('p', { class: 'sm muted', style: { marginTop: '10px' } }, '合計 ' + U.wan(sum) + '。' + (rows[0] ? '最大的一筆是「' + rows[0][0] + '」，佔 ' + (rows[0][1] / sum * 100).toFixed(0) + '%。' : '')));
    return sec;
  }

  function compSection(res, th, s) {
    var sec = h('section', { class: 'rsec', id: 'sec-comp' });
    sec.appendChild(h('div', { class: 'rsec-k num' }));
    sec.appendChild(h('h2', {}, s.incomeMode === 'full' ? (res.minS >= 0 ? '還有哪些地方可以更寬鬆？' : '要放棄什麼，才養得起？') : '放棄什麼，門檻會降最多？'));
    var box = h('div', {}, h('p', { class: 'rsec-lede' }, '正在逐一試算每個妥協…'));
    sec.appendChild(box);
    U.task(function () {
      var cp = A.getComp();
      U.clear(box);
      var full = cp.mode === 'full';
      box.appendChild(h('p', { class: 'rsec-lede' }, full ? '一次只改一個條件，其他都不變。綠色勾勾代表光改這一項，存款就不會跌破零。' : '一次只改一個條件，看看收入門檻會降到多少。'));
      var items = cp.list.filter(function (it) { return full ? it.gain >= 5000 : it.gain >= 0.5; });
      if (!items.length) {
        box.appendChild(h('div', { class: 'empty' }, h('b', {}, full ? '找不到明顯能改善的地方' : '放棄任何單一項目，門檻仍高於 PR 99.9'), full ? '你的標準已經很精簡了。' : '試試左側一次調整多個條件，或到實驗室比較不同縣市與住房方式。'));
      } else {
      var list = h('div', { class: 'comp' });
      items.slice(0, 8).forEach(function (it) {
        var ok = full ? it.passes : false;
        var val = full ? (it.value < 0 ? '最多負債 ' + U.wan(-it.value) : '最低存款 ' + U.wan(it.value)) : (it.value == null ? '門檻 >99.9' : '門檻 PR ' + U.pr(it.value) + '（−' + Math.round(it.gain) + '）');
        list.appendChild(h('div', { class: 'comp-row' },
          h('span', { class: 'ci ' + (ok ? 'ok' : 'part') }, ok ? '✓' : '↑'),
          h('span', {}, it.label),
          h('span', { class: 'cv' }, val),
          h('button', { class: 'btn ghost small', onclick: function () { applyComp(it.id); } }, '套用')));
      });
      box.appendChild(list);
      }
      if (cp.combo && cp.combo.steps.length) {
        box.appendChild(h('p', { class: 'sm', style: { marginTop: '14px' }, html: (cp.combo.passes ? '光改一項不夠。要<b>同時</b>做到：' : '就算同時做到這些，仍然不夠：') + cp.combo.steps.map(function (x) { return '「' + x.label + '」'; }).join('、') + (cp.combo.passes ? '，存款才不會跌破零。' : '（最低存款 ' + U.wan(cp.combo.minS) + '）。') }));
        if (cp.combo.passes) box.appendChild(h('button', { class: 'btn small', style: { marginTop: '8px' }, onclick: function () { pushUndo(); cp.combo.steps.forEach(function (st) { applyOne(st.id); }); A.persist(); A.redrawReport(); U.toast('已套用 ' + cp.combo.steps.length + ' 項調整'); } }, '全部套用'));
      }
      var mk = ENGINE.maxKids(ENGINE.normalize(A.strip(A.s)));
      if (full) box.appendChild(h('p', { class: 'sm muted', style: { marginTop: '12px' } }, mk === 0 ? '以目前的收入和標準，連一個孩子都撐不住。' : '以目前的收入和標準，最多養得起 ' + mk + ' 個孩子。'));
    }, 'compromises');
    return sec;
  }
  function pushUndo() { A.undo.push(JSON.parse(JSON.stringify(A.strip(A.s)))); if (A.undo.length > 20) A.undo.shift(); }
  function applyOne(id) {
    var cp = null;
    var x = ENGINE.normalize(A.strip(A.s));
    // 與 ENGINE 內的妥協規則相同
    var map = {
      kidsLess: function () { x.kids--; }, later: function () { x.firstBirthAge += 3; }, rent: function () { x.housing = 'rent'; }, used: function () { x.build = 'used'; }, share: function () { x.room = 'share'; },
      outer: function () { var dl = D.DISTRICTS[x.county]; x.district = dl[dl.length - 1].id; }, move: function () { x.county = ENGINE.MOVE_TO[x.county]; x.district = 'mid'; },
      noCar: function () { x.transport = 'transit'; }, usedCar: function () { x.transport = 'used'; }, grand: function () { x.care = 'grandPaid'; }, quasiCare: function () { x.care = 'quasi'; },
      noQuit: function () { x.care = 'quasi'; if (x.preschool === 'home') x.preschool = 'quasi'; }, backEarly: function () { x.quitUntil = 'preschool'; if (x.preschool === 'home') x.preschool = 'quasi'; },
      kgQuasi: function () { x.preschool = 'quasi'; }, publicSchool: function () { x.school = 'public'; }, noAfter: function () { x.after = 'none'; }, noCram: function () { x.cram = 'none'; },
      noAbroad: function () { x.support = '22'; }, noMaster: function () { x.support = '22'; }, frugal: function () { x.lifestyle = x.lifestyle === 'comfy' ? 'normal' : 'frugal'; }, noTravel: function () { x.travel = 'domestic'; },
      elderHalf: function () { x.elder = Math.round(x.elder / 2); }, noCenter: function () { x.postpartum = 'family'; }
    };
    if (map[id]) map[id]();
    A.s = ENGINE.normalize(x); A.dirty = true;
    return cp;
  }
  function applyComp(id) { pushUndo(); applyOne(id); A.persist(); A.redrawReport(); U.toast('已套用，報告已重算'); window.scrollTo({ top: 0, behavior: U.reduceMotion() ? 'auto' : 'smooth' }); }

  function submittedDoc() {
    var s = ENGINE.normalize(JSON.parse(JSON.stringify(A.submitted || A.strip(A.s)))); s.__norm = true;
    var th = ENGINE.threshold(s);
    var res = s.incomeMode === 'full' ? ENGINE.full(s) : ENGINE.atPR(s, 50);
    return COMM.buildDoc(s, res, th);
  }
  function crowdSection() {
    var sec = h('section', { class: 'rsec', id: 'sec-crowd' });
    sec.appendChild(h('div', { class: 'rsec-k num' }));
    sec.appendChild(h('h2', {}, '其他申請人怎麼選？'));
    var st = COMM.st, S = st.stats, res = A.res, s = res.s;
    if (!st.ready) { sec.appendChild(h('p', { class: 'rsec-lede' }, '正在讀取…')); return sec; }
    var n = S ? S.n : 0;
    // 沒有共享資料可讀、或資料還不夠又不能加入的訪客：整節不顯示（避免出現永遠不會滿的空白區塊）
    if (!st.db || (!st.canShare && n < COMM.MIN_N)) { sec.hidden = true; return sec; }
    var ctl = h('p', { class: 'sm', style: { marginBottom: '12px' } });
    var mine = COMM.mine();
    if (st.canShare) {
      var failTxt = st.backend === 'web' ? '分享失敗，請稍後再試' : '分享失敗，你可能只有檢視權限';
      if (mine) {
        var sh = COMM.shared(), newer = A.submitted && (!sh || !sh.sig || sh.sig !== COMM.sig(A.submitted));
        ctl.appendChild(document.createTextNode('你已匿名分享' + (newer ? '之前送出的申請書。' : '這份申請書。') + '在報告裡調整設定不會改到分享的資料' + (st.backend === 'web' ? '；要取消，請用同一台裝置的同一個瀏覽器' : '') + '。'));
        if (newer) ctl.appendChild(h('button', { class: 'linkbtn', onclick: function () { COMM.submit(submittedDoc(), A.submitted).then(function (ok) { U.toast(ok ? '已更新成最新送出的申請書' : failTxt); }); } }, '更新成最新送出的申請書'));
        ctl.appendChild(h('button', { class: 'linkbtn', onclick: function () { COMM.withdraw().then(function () { A.consent = false; U.store.set('consent', false); U.toast('已取消分享並刪除資料'); }); } }, '取消分享'));
      }
      else { ctl.appendChild(document.createTextNode('你目前沒有分享設定。')); ctl.appendChild(h('button', { class: 'linkbtn', onclick: function () { A.consentModal(function () { if (A.consent) COMM.submit(submittedDoc(), A.submitted).then(function (ok) { U.toast(ok ? '已匿名分享' : failTxt); }); }); } }, '匿名分享')); }
    } else ctl.appendChild(document.createTextNode('你可以看到大家分享的統計；不過從公開連結進來的訪客無法加入自己的資料，你的選擇只會存在這台裝置上。'));
    sec.appendChild(ctl);
    if (st.demoOn) sec.appendChild(h('p', { class: 'xs muted demo-note', style: { marginBottom: '12px' } }, COMM.demoNote()));
    if (n < COMM.MIN_N) {
      sec.appendChild(h('div', { class: 'empty' }, h('b', {}, '目前只有 ' + n + ' 位申請人分享'), '累積到 ' + COMM.MIN_N + ' 位以上，這裡就會顯示大家的選擇、門檻 PR 的分布，以及你在其中的位置。'));
      return sec;
    }
    var tiles = h('div', { class: 'tiles' });
    var thRank = A.th.pr != null ? COMM.rankOf(S.ths, A.th.pr) : 100;
    tiles.appendChild(tile('申請人數', U.sep(n), st.demoOn ? '含 ' + st.demoN + ' 筆示範資料' : n >= (st.backend === 'web' ? 3000 : 1000) ? '最近 ' + U.sep(n) + ' 筆' : '所有匿名分享的人', false));
    tiles.appendChild(tile('門檻 PR 中位數', U.pr(S.thMedian), '你的門檻比 ' + Math.round(thRank) + '% 的人高', false));
    if (S.perChildMedian) tiles.appendChild(tile('每個孩子的淨成本（中位數）', U.wan(S.perChildMedian), '你的是 ' + U.wan(res.perChild), false));
    var vb = S.by.verdict || {}, vtot = 0; for (var k in vb) vtot += vb[k];
    if (vtot >= COMM.MIN_N) tiles.appendChild(tile('填了收入的人被核准', Math.round(((vb.pass || 0) + (vb.tight || 0)) / vtot * 100) + '%', '含「附條件核准」', false));
    sec.appendChild(tiles);
    // 每題分布
    var keys = [['housing', '住房'], ['room', '孩子房間'], ['care', '0–2 歲照顧'], ['preschool', '幼兒園'], ['school', '國小到高中'], ['cram', '補習'], ['support', '供養到'], ['transport', '交通'], ['lifestyle', '生活水準']];
    var g = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px 26px', marginTop: '20px' } });
    keys.forEach(function (kk) {
      var m = S.by[kk[0]]; if (!m) return;
      var tot = 0; for (var v in m) tot += m[v];
      var box = h('div', {}, h('div', { class: 'sm', style: { fontWeight: 700, marginBottom: '6px' } }, kk[1]));
      var bars = h('div', { class: 'bars' });
      Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, 4).forEach(function (v) {
        var mineV = String(s[kk[0]]) === v;
        var label = QS.labelOf(kk[0], v === 'true' ? true : v === 'false' ? false : v);
        bars.appendChild(h('div', { class: 'bar-row', style: { gridTemplateColumns: 'minmax(0,1fr) 70px 3em' } }, h('span', { class: 'bl', style: { fontWeight: mineV ? 700 : 400, color: mineV ? 'var(--pen)' : '' } }, label + (mineV ? '（你）' : '')), h('span', { class: 'bt' }, h('i', { style: { width: (m[v] / tot * 100).toFixed(0) + '%', background: mineV ? 'var(--pen)' : 'var(--rule)' } })), h('span', { class: 'bv' }, Math.round(m[v] / tot * 100) + '%')));
      });
      box.appendChild(bars); g.appendChild(box);
    });
    sec.appendChild(g);
    return sec;
  }

  function saveSection(res, th, s) {
    var sec = h('section', { class: 'rsec', id: 'sec-save' });
    sec.appendChild(h('div', { class: 'rsec-k num' }));
    sec.appendChild(h('h2', {}, '存檔與分享'));
    sec.appendChild(h('p', { class: 'rsec-lede' }, '把目前的設定存起來，到實驗室比較不同縣市、不同收入，或回到 30 年前（1996 年）的台灣。支出與收入分開存，可以自由搭配。'));
    var row = h('div', { class: 'share-actions', style: { marginTop: 0, marginBottom: '22px' } });
    row.appendChild(h('button', { class: 'btn ghost small', onclick: function () { nameModal('存成支出設定', A.expName(A.s), function (n) { A.saveProfile('expense', n); U.toast('已存成支出設定'); }); } }, U.icon('save'), '存成支出設定'));
    row.appendChild(h('button', { class: 'btn ghost small', onclick: function () { nameModal('存成收入設定', A.incName(A.s), function (n) { A.saveProfile('income', n); U.toast('已存成收入設定'); }); } }, U.icon('save'), '存成收入設定'));
    row.appendChild(h('button', { class: 'btn small', onclick: function () { A.go('lab'); } }, U.icon('lab'), '進入實驗室'));
    sec.appendChild(row);
    var share = h('div', { class: 'share' });
    var cv = h('canvas', { width: 1080, height: 1350, 'aria-label': '分享圖卡預覽' });
    share.appendChild(cv);
    var right = h('div', {});
    var text = shareText(s, res, th), url = shareUrl(), full = text + '\n' + url;
    var ta = h('textarea', { class: 'share-text', readonly: true, 'aria-label': '分享文字' }, full);
    right.appendChild(h('h3', { style: { fontSize: '16px', marginBottom: '8px' } }, '分享你的審查結果'));
    right.appendChild(ta);
    var acts = h('div', { class: 'share-actions' });
    acts.appendChild(h('button', { class: 'btn small', onclick: function () { U.copy(full, ta); } }, U.icon('copy'), '複製文字'));
    var saveBtn = h('button', { class: 'btn ghost small', hidden: true, onclick: function () { saveImage(cv); } }, U.icon('image'), '儲存圖卡');
    acts.appendChild(saveBtn);
    right.appendChild(acts);
    COMM.downloads().then(function (d) { if (d) saveBtn.hidden = false; });
    // 分享到社群平台（用各平台官方的分享網址，在新分頁開啟）
    var enc = encodeURIComponent;
    var nets = [
      { n: 'Threads', u: 'https://www.threads.com/intent/post?text=' + enc(text) + '&url=' + enc(url) },
      { n: 'Facebook', u: 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url), copyFirst: true },
      { n: 'LINE', u: 'https://social-plugins.line.me/lineit/share?url=' + enc(url) + '&text=' + enc(text) },
      { n: 'X', u: 'https://twitter.com/intent/tweet?text=' + enc(text) + '&url=' + enc(url) }
    ];
    var netRow = h('div', { class: 'share-net', role: 'group', 'aria-label': '分享到社群平台' }, h('span', { class: 'share-net-l' }, '分享到'));
    nets.forEach(function (x) {
      netRow.appendChild(h('a', { class: 'net', href: x.u, target: '_blank', rel: 'noopener noreferrer', 'aria-label': '分享到 ' + x.n, onclick: function () {
        // Facebook 不能帶入文字：先把分享文字複製起來，貼上就好
        if (x.copyFirst) U.copy(full, null, '已複製分享文字，到 Facebook 貼上即可');
      } }, x.n, U.icon('external')));
    });
    netRow.appendChild(h('button', { type: 'button', class: 'net', onclick: function () { U.copy(url, null, '已複製網址'); } }, '複製網址', U.icon('copy')));
    // 手機上可以叫出系統的分享選單（Instagram 等也在裡面）；不支援時不顯示
    if (navigator.share) netRow.appendChild(h('button', { type: 'button', class: 'net', onclick: function () { nativeShare(cv, text, url, full); } }, '更多', U.icon('share')));
    right.appendChild(netRow);
    right.appendChild(h('p', { class: 'xs muted', style: { marginTop: '8px' } }, 'Instagram 沒有網頁分享入口：先儲存圖卡，再從 App 發佈。'));
    share.appendChild(right);
    sec.appendChild(share);
    // 畫好就先轉成圖檔備用：手機的分享選單必須在點擊當下立刻打開，來不及等轉檔
    var draw = function () { drawCard(cv, s, res, th); cv.__blob = null; try { cv.toBlob(function (b) { cv.__blob = b; }, 'image/png'); } catch (e) { /* 忽略 */ } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); else draw();
    return sec;
  }
  // 分享出去的網址：在 claude.ai 上是這個作品的公開連結；若搬到自己的網站，就用當下網址
  var SHARE_URL = 'https://claude.ai/artifact/9tw9WrjkFfARQsN8HpfMbx';
  function shareUrl() {
    try { if (window.TWKIDS && window.TWKIDS.siteUrl) return window.TWKIDS.siteUrl; } catch (e) { /* 忽略 */ }
    try { var hn = location.hostname || ''; if (/^https?:$/.test(location.protocol) && hn && !/claude|anthropic|localhost|127\.0\.0\.1/.test(hn)) return location.origin + location.pathname; } catch (e) { /* 忽略 */ }
    return SHARE_URL;
  }
  function nativeShare(cv, text, url, full) {
    var fallback = function () { U.copy(full, null, '已複製分享文字'); };
    try {
      withBlob(cv, function (blob) {
        var data = { title: '你有資格生下一代嗎？', text: text, url: url };
        try { var f = blob && new File([blob], '生育資格審查結果.png', { type: 'image/png' }); if (f && navigator.canShare && navigator.canShare({ files: [f] })) data.files = [f]; } catch (e) { /* 不能附圖就只分享文字 */ }
        navigator.share(data).catch(function (e) { if (e && e.name === 'AbortError') return; fallback(); });
      });
    } catch (e) { fallback(); }
  }
  function withBlob(cv, fn) { if (cv.__blob) fn(cv.__blob); else cv.toBlob(fn, 'image/png'); }
  function nameModal(title, def, cb) {
    U.modal(function (box, close) {
      box.appendChild(h('h3', {}, title));
      var inp = h('input', { class: 'input', id: 'save-name', value: def, maxlength: 40 });
      var form = h('form', { onsubmit: function (e) { e.preventDefault(); cb(inp.value.trim() || def); close(); } },
        h('div', { class: 'field' }, h('label', { for: 'save-name' }, '名稱'), inp),
        h('div', { class: 'actions' }, h('button', { class: 'btn ghost', type: 'button', onclick: close }, '取消'), h('button', { class: 'btn', type: 'submit' }, '儲存')));
      box.appendChild(form);
      U.task(function () { inp.select(); });
    });
  }
  function shareText(s, res, th) {
    var where = D.COUNTY[s.county].name + (s.housing === 'buy' ? '買房' : s.housing === 'rent' ? '租屋' : '住長輩家') + '、生 ' + s.kids + ' 個孩子';
    var n = People.count(th.pr), line;
    if (th.pr == null) line = '就算收入是同齡同業的前 0.1%，也撐不住我心中的養育標準。';
    else if (th.pr <= 1) line = '幾乎任何收入都養得起。';
    else if (th.pr < 50) line = (s.partner ? '夫妻雙方' : '我') + '的收入只要贏過同齡同業的 ' + U.pr(th.pr) + '%（PR ' + U.pr(th.pr) + '）就養得起，100 個人裡有 ' + n + ' 個做得到。';
    else line = (s.partner ? '夫妻雙方' : '我') + '的收入都要在同齡同業的前 ' + U.topPct(th.pr) + '%（PR ' + U.pr(th.pr) + '）才養得起，' + (n > 0 ? '100 個人裡只有 ' + n + ' 個做得到。' : '100 個人裡連 1 個都不到。');
    var v = s.incomeMode === 'full' ? (s.partner ? '以我們現在的收入：' : '以我現在的收入：') + ({ pass: '核准', tight: '附條件核准', fail: '駁回', broke: '駁回' }[res.verdict]) + '。' : '';
    var W = A.waitMid || A.wait, w = '';
    if (W) {
      if (W.earliest == null) w = '收入在中間的話，存一輩子也生不起。';
      else if (W.earliest <= s.ageA) w = '收入在中間的話，現在就生得起。';
      else w = '收入在中間的話，要存到 ' + W.earliest + ' 歲才生得起。';
    }
    return '我在「你有資格生下一代嗎？」拿到的審查結果：在' + where + '，' + line + v + w + '你的標準呢？';
  }
  // ---------- 分享圖卡（1080×1350，跟著網頁的深淺色） ----------
  var F_SERIF = '"Noto Serif TC","Noto Serif CJK TC","Source Han Serif TC","PMingLiU",serif';
  var F_SANS = '"Noto Sans TC","Noto Sans CJK TC","PingFang TC","Microsoft JhengHei",sans-serif';
  var F_HAND = '"LXGW WenKai TC","Kaiti TC","DFKai-SB","BiauKai",' + F_SERIF;
  function midWaitText() {
    var W = A.waitMid || A.wait; if (!W) return null;
    var v = W.earliest == null ? '存一輩子也生不起' : W.earliest <= W.list[0].age ? '現在就生得起' : '要存到 ' + W.earliest + ' 歲才生得起';
    return { label: '收入在中間的話，', value: v + '。', bad: W.earliest == null || W.earliest > W.planned };
  }
  // 圖卡用到的字，先讓網頁字型載入（Google Fonts 依字元分批下載）
  function cardFonts(texts) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var all = '台灣・生育資格審查申請書　No.115-TW你有資格生下一代嗎？依 2026 年台灣房價、薪資、補助與稅制試算0123456789／' + texts.join('');
    var jobs = ['900 40px "Noto Serif TC"', '700 40px "Noto Sans TC"', '500 40px "Noto Sans TC"', '400 40px "Noto Sans TC"', '400 32px "LXGW WenKai TC"'].map(function (f) { return document.fonts.load(f, all).catch(function () {}); });
    return Promise.race([Promise.all(jobs), new Promise(function (r) { setTimeout(r, 3000); })]);
  }
  function drawCard(cv, s, res, th) {
    var vi = verdictInfo(s, res, th), mw = midWaitText(), info = peopleInfo(res, th, s);
    var setting = QS.placeName(s) + '・' + s.kids + ' 個孩子・' + QS.labelOf('housing', s.housing);
    var paint = function () { U.safe(function () { paintCard(cv, s, th, vi, mw, info, setting); }, 'card'); };
    paint();
    cardFonts([vi.title, vi.line.replace(/<[^>]+>/g, ''), vi.stamp.l.join(''), vi.stamp.sub || '', mw ? mw.label + mw.value : '', setting, info.peer]).then(paint);
  }
  function paintCard(cv, s, th, vi, mw, info, setting) {
    var c = cv.getContext('2d'), W = 1080, H = 1350, X = 100, CW = W - 200;
    var css = function (n) { return U.cssVar(n); };
    var thMode = s.incomeMode !== 'full';
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.fillStyle = css('--paper'); c.fillRect(0, 0, W, H);
    c.fillStyle = css('--sheet'); c.fillRect(60, 60, W - 120, H - 120);
    c.strokeStyle = css('--rule'); c.lineWidth = 4; c.beginPath(); c.moveTo(X, 104); c.lineTo(W - X, 104); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.moveTo(X, 114); c.lineTo(W - X, 114); c.stroke();
    c.fillStyle = css('--ink-3'); c.font = '500 28px ' + F_SANS; c.fillText('台灣・生育資格審查申請書　No.115-TW', X, 170);
    c.fillStyle = css('--ink'); c.font = '900 92px ' + F_SERIF; c.fillText('你有資格', X, 300); c.fillText('生下一代嗎', X, 410);
    c.fillStyle = css('--seal'); c.fillText('？', X + c.measureText('生下一代嗎').width, 410);
    var y;
    if (thMode) {
      // 100 人（25 × 4）
      var gh = People.draw(c, X, 590, CW, info.n, { on: css('--pp-on') || css('--good'), off: css('--pp-off') || css('--rule-soft') }, 25);
      var cy = 590 + gh + 46;
      c.font = '900 44px ' + F_SERIF; c.fillStyle = css('--pp-on') || css('--good');
      var nTxt = String(info.n); c.fillText(nTxt, X, cy);
      var nx = X + c.measureText(nTxt).width;
      c.font = '700 28px ' + F_SERIF; c.fillStyle = css('--ink-3'); c.fillText('／100', nx + 4, cy);
      nx += 4 + c.measureText('／100').width + 14;
      c.font = '500 28px ' + F_SANS; c.fillStyle = css('--ink-2'); fitText(c, info.peer + '，收入養得起', nx, cy, W - X - nx);
      // 結論（下移）
      c.fillStyle = css('--ink'); c.font = '900 58px ' + F_SERIF;
      fitText(c, vi.title, X, cy + 86, CW);
      y = cy + 86;
      var sub = th.pr != null && th.grossBirth ? '生第一胎那年，' + (s.partner ? '夫妻合計' : '') + '稅前年收入要約 ' + U.wan(th.grossBirth) + '。' : vi.line.replace(/<br>/g, '').replace(/<[^>]+>/g, '');
      c.fillStyle = css('--ink-2'); c.font = '400 32px ' + F_SANS;
      y += 56; fitText(c, sub, X, y, CW);
    } else {
      c.fillStyle = css('--ink'); c.font = '900 58px ' + F_SERIF;
      y = wrapText(c, vi.title, X, 860, CW, 76, 2);
      c.fillStyle = css('--ink-2'); c.font = '400 32px ' + F_SANS;
      y = wrapText(c, vi.line.replace(/<br>/g, '').replace(/<[^>]+>/g, ''), X, Math.max(1010, y + 74), CW, 48, mw ? 3 : 4);
    }
    // 收入在中間的話：最早幾歲生得起
    if (mw) {
      y += thMode ? 52 : 54;
      c.font = '500 32px ' + F_SANS; c.fillStyle = css('--ink-2'); c.fillText(mw.label, X, y);
      var lx = X + c.measureText(mw.label).width;
      c.font = '700 32px ' + F_SANS; c.fillStyle = mw.bad ? css('--seal') : css('--good');
      fitText(c, mw.value, lx, y, W - X - lx);
    }
    var fy = Math.min(Math.max(y + 56, 1200), 1222);
    c.fillStyle = css('--pen'); c.font = '400 32px ' + F_HAND; fitText(c, setting, X, fy, CW);
    c.fillStyle = css('--ink-3'); c.font = '400 24px ' + F_SANS;
    c.fillText('依 2026 年台灣房價、薪資、補助與稅制試算', X, fy + 46);
    // 印章最後蓋上去（兩種印章一樣大）；門檻模式往上移，騰出中間放 100 人，壓到一點也沒關係
    if (thMode) stamp(c, vi, 852, 432, 172, css);
    else stamp(c, vi, 792, 606, 172, css);
  }
  function stamp(c, vi, x, y, R, css) {
    c.save(); c.translate(x, y); c.rotate(-0.16); c.globalAlpha = 0.94;
    c.strokeStyle = css('--seal'); c.fillStyle = css('--seal'); c.lineWidth = R * 0.08; c.textAlign = 'center';
    if (vi.stamp.k === 'round') { c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); c.stroke(); c.lineWidth = R * 0.027; c.beginPath(); c.arc(0, 0, R * 0.866, 0, Math.PI * 2); c.stroke(); }
    else { c.strokeRect(-R, -R, R * 2, R * 2); c.lineWidth = R * 0.027; c.strokeRect(-R * 0.853, -R * 0.853, R * 1.706, R * 1.706); }
    var L = vi.stamp.l;
    if (L.length === 1) { c.font = '900 ' + Math.round(R * (L[0].length > 2 ? 0.52 : 0.8)) + 'px ' + F_SERIF; c.fillText(L[0], 0, vi.stamp.sub ? R * 0.067 : R * 0.28); }
    else { c.font = '900 ' + Math.round(R * 0.507) + 'px ' + F_SERIF; c.fillText(L[0], 0, -R * 0.093); c.fillText(L[1], 0, R * 0.507); }
    if (vi.stamp.sub) { c.font = '700 ' + Math.round(R * 0.267) + 'px ' + F_SANS; c.fillText(vi.stamp.sub, 0, R * 0.533); }
    c.restore(); c.textAlign = 'left';
  }
  // 自動換行（中文避頭尾、數字與單位不拆開、優先在逗號後換行）；回傳最後一行的 y
  var TOKEN = /[（「(]*(?:PR\s?[\d.]+|[−\-+]?\d[\d,.]*%?(?:\s?(?:萬|億|元|歲|年|倍|人|個|坪))?|[A-Za-z]+|[\s\S])[，。、：；！？）」)]*/g;
  function wrapText(c, text, x, y, maxW, lh, maxLines) {
    var toks = text.match(TOKEN) || [], lines = [], line = '', max = maxLines || 4;
    toks.forEach(function (t) {
      if (!line && /^\s+$/.test(t)) return;
      if (c.measureText(line + t).width <= maxW || !line) { line += t; return; }
      // 超出寬度：若這一行後段有逗號，就從逗號後換行，讓句子斷在自然的地方
      var m = -1, re = /[，：；]/g, r;
      while ((r = re.exec(line))) m = r.index;
      if (m >= 0 && c.measureText(line.slice(0, m + 1)).width >= maxW * 0.4) { lines.push(line.slice(0, m + 1)); line = line.slice(m + 1) + t; }
      else { lines.push(line.replace(/\s+$/, '')); line = t.replace(/^\s+/, ''); }
    });
    if (line) lines.push(line);
    var yy = y;
    lines.forEach(function (l, i) {
      if (i >= max) return;
      if (i === max - 1 && lines.length > max) { while (l.length && c.measureText(l + '…').width > maxW) l = l.slice(0, -1); l += '…'; }
      c.fillText(l, x, yy); if (i < Math.min(lines.length, max) - 1) yy += lh;
    });
    return yy;
  }
  // 單行：太寬就縮小字級
  function fitText(c, text, x, y, maxW) {
    var f = c.font, m = /(\d+)px/.exec(f), size = m ? +m[1] : 30;
    while (c.measureText(text).width > maxW && size > 14) { size -= 2; c.font = f.replace(/\d+px/, size + 'px'); }
    c.fillText(text, x, y); c.font = f;
  }
  function saveImage(cv) {
    COMM.downloads().then(function (d) {
      if (!d) { U.toast('這個檢視無法儲存檔案'); return; }
      withBlob(cv, function (blob) {
        d.save({ filename: '生育資格審查結果.png', data: blob }).then(function (m) { U.toast(m === 'shared' ? '完成' : m === 'downloaded' ? '已下載圖卡' : '已儲存'); }, function (e) { if (e && e.code === 'declined') return; U.toast('無法儲存：' + ((e && e.message) || '請稍後再試')); });
      });
    });
  }

  // ---------- 設定面板 ----------
  function buildPanel(side, onChange, closeDrawer) {
    var panel = h('div', { class: 'panel' });
    panel.appendChild(h('div', { class: 'panel-h' }, h('h3', {}, '調整設定'), h('div', { style: { display: 'flex', gap: '6px' } },
      h('button', { class: 'btn ghost small', onclick: function () { if (A.submitted) { A.undo.push(JSON.parse(JSON.stringify(A.strip(A.s)))); A.s = ENGINE.normalize(A.submitted); A.persist(); A.redrawReport(); U.toast('已還原成送出時的設定'); } } }, U.icon('redo'), '還原'),
      h('button', { class: 'btn ghost small drawer-close', onclick: closeDrawer, 'aria-label': '關閉' }, U.icon('close')))));
    var sub0 = A.submitted || {};
    function changed(key) {
      var a = key.indexOf('.') > 0 ? (A.s[key.split('.')[0]] || {})[key.split('.')[1]] : A.s[key];
      var b = key.indexOf('.') > 0 ? (sub0[key.split('.')[0]] || {})[key.split('.')[1]] : sub0[key];
      return sub0 && b !== undefined && JSON.stringify(a) !== JSON.stringify(b);
    }
    function set(key, v) {
      A.undo.push(JSON.parse(JSON.stringify(A.strip(A.s)))); if (A.undo.length > 20) A.undo.shift();
      if (/^job[AB]\.pr$/.test(key)) { var jk = key.split('.')[0]; A.s[jk].mode = 'pr'; delete A.s[jk].salary; }
      var fid = document.activeElement && document.activeElement.id;
      A.set(key, v); onChange(); refreshPanel();
      if (fid) { var el = document.getElementById(fid); if (el) el.focus({ preventScroll: true }); }
    }
    function refreshPanel() { var open = Array.prototype.map.call(panel.querySelectorAll('.pgroup'), function (g) { return !g.querySelector('.pgroup-body').hidden; }); U.clear(side); buildPanel(side, onChange, closeDrawer); var gs = side.querySelectorAll('.pgroup'); open.forEach(function (o, i) { if (gs[i]) { gs[i].querySelector('.pgroup-body').hidden = !o; gs[i].firstChild.setAttribute('aria-expanded', o ? 'true' : 'false'); } }); }
    function sel(label, key, opts) {
      var cur = key.indexOf('.') > 0 ? A.s[key.split('.')[0]][key.split('.')[1]] : A.s[key];
      if (/\.pr$/.test(key)) cur = Math.round(cur);
      var id = 'p-' + key.replace('.', '-');
      var s = h('select', { class: 'select', id: id, onchange: function (e) { var o = opts[e.target.selectedIndex]; set(key, o.v); } });
      opts.forEach(function (o) { s.appendChild(h('option', { selected: JSON.stringify(o.v) === JSON.stringify(cur) }, o.label)); });
      return h('div', { class: 'prow' }, h('label', { for: id }, label, changed(key) ? h('span', { class: 'changed-dot', title: '已調整' }) : null), s);
    }
    function qsel(label, key) { var o = (QS.optionsOf(key) || []).filter(function (x) { return QS.optVisible(x, A.s); }); return sel(label, key, o); }
    function step(label, key, min, max, unit) {
      var cur = A.s[key];
      return h('div', { class: 'prow' }, h('label', {}, label, changed(key) ? h('span', { class: 'changed-dot' }) : null), h('div', { class: 'mini-step' },
        h('button', { type: 'button', 'aria-label': '減少' + label, disabled: cur <= min, onclick: function () { set(key, cur - 1); } }, '−'), h('b', {}, cur + unit),
        h('button', { type: 'button', 'aria-label': '增加' + label, disabled: cur >= max, onclick: function () { set(key, cur + 1); } }, '＋')));
    }
    function group(title, hint, rows, open) {
      var body = h('div', { class: 'pgroup-body', hidden: !open });
      rows.forEach(function (r) { if (r) body.appendChild(r); });
      var btn = h('button', { type: 'button', 'aria-expanded': open ? 'true' : 'false', onclick: function () { body.hidden = !body.hidden; btn.setAttribute('aria-expanded', body.hidden ? 'false' : 'true'); } }, title, h('span', {}, hint));
      return h('div', { class: 'pgroup' }, btn, body);
    }
    var s = A.s;
    var counties = D.COUNTIES.map(function (c) { return { v: c.id, label: c.name }; });
    var dl = D.DISTRICTS[s.county];
    panel.appendChild(group('家庭與地點', QS.placeName(s), [
      sel('縣市', 'county', counties),
      dl ? sel('區域', 'district', dl.map(function (d) { return { v: d.id, label: d.name + '（' + d.ex.split('、')[0] + '等）' }; })) : null,
      qsel('家庭', 'partner'),
      step('你的年齡', 'ageA', 20, 45, ' 歲'), s.partner ? step('伴侶年齡', 'ageB', 20, 50, ' 歲') : null,
      step('第一胎', 'firstBirthAge', s.ageA, 45, ' 歲'), step('孩子數', 'kids', 1, 4, ' 個'), s.kids > 1 ? step('間隔', 'spacing', 1, 6, ' 年') : null
    ], true));
    panel.appendChild(group('住房', QS.labelOf('housing', s.housing), [
      qsel('房間', 'room'), qsel('住房', 'housing'),
      s.housing === 'buy' ? qsel('何時買', 'buyWhen') : null, s.housing === 'buy' ? qsel('新或中古', 'build') : null, s.housing === 'buy' ? qsel('房貸', 'loan') : null, s.housing === 'buy' ? qsel('裝潢', 'reno') : null,
      s.housing === 'buy' && ['used', 'new', 'import'].indexOf(s.transport) >= 0 ? qsel('車位', 'parking') : null
    ], false));
    panel.appendChild(group('0–6 歲', QS.labelOf('care', s.care), [
      qsel('坐月子', 'postpartum'), qsel('0–2 歲', 'care'),
      s.care === 'quit' && s.partner ? qsel('誰辭職', 'quitWho') : null, s.care === 'quit' ? qsel('回職場', 'quitUntil') : null,
      qsel('育嬰留停', 'leave'), qsel('幼兒園', 'preschool')
    ], false));
    panel.appendChild(group('教育', QS.labelOf('school', s.school), [qsel('學校', 'school'), qsel('課後', 'after'), qsel('補習', 'cram'), qsel('大學', 'uni'), qsel('住宿', 'uniAway'), qsel('供養到', 'support')], false));
    panel.appendChild(group('生活', QS.labelOf('lifestyle', s.lifestyle), [
      qsel('交通', 'transport'), qsel('生活水準', 'lifestyle'), qsel('旅遊', 'travel'),
      sel('孝親費', 'elder', [0, 5000, 10000, 15000, 20000, 30000].map(function (v) { return { v: v, label: v ? U.sep(v) + ' 元/月' : '不用給' }; })),
      sel('長輩照護', 'elderCare', [{ v: false, label: '不另外分擔' }, { v: true, label: '分擔看護費' }])
    ], false));
    var inds = D.INDUSTRIES.map(function (x) { return { v: x.id, label: x.name }; });
    var prs = [5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 85, 90, 95, 99].map(function (p) { return { v: p, label: 'PR ' + p }; });
    function prOpts(cur) { var r = Math.round(cur); var list = prs.slice(); if (!list.some(function (o) { return o.v === r; })) list.push({ v: r, label: 'PR ' + r }); return list.sort(function (a, b) { return a.v - b.v; }); }
    function salaryNote(job) { return job.mode === 'salary' ? h('p', { class: 'xs muted' }, '目前用輸入的年薪 ' + U.wan(job.salary || 0) + ' 計算；改選 PR 會改用 PR 推估。') : null; }
    panel.appendChild(group('收入與存款', s.incomeMode === 'full' ? A.incName(s) : '只看門檻', [
      qsel('模式', 'incomeMode'),
      sel('你的產業', 'jobA.industry', inds),
      s.incomeMode === 'full' ? sel('你的 PR', 'jobA.pr', prOpts(s.jobA.pr)) : null,
      s.incomeMode === 'full' ? salaryNote(s.jobA) : null,
      s.partner ? sel('伴侶產業', 'jobB.industry', inds) : null,
      s.partner && s.incomeMode === 'full' ? sel('伴侶 PR', 'jobB.pr', prOpts(s.jobB.pr)) : null,
      s.partner && s.incomeMode === 'full' ? salaryNote(s.jobB) : null,
      sel('目前存款', 'savings', uniq([0, 300000, 500000, 1000000, 2000000, 5000000], s.savings).map(function (v) { return { v: v, label: v ? U.wan(v) : '0' }; })),
      sel('一次資助', 'giftOnce', uniq([0, 500000, 1000000, 3000000, 5000000], s.giftOnce).map(function (v) { return { v: v, label: v ? U.wan(v) : '沒有' }; })),
      sel('每月資助', 'giftMonthly', [0, 5000, 10000, 20000].map(function (v) { return { v: v, label: v ? U.sep(v) + ' 元' : '沒有' }; }))
    ], false));
    panel.appendChild(group('進階假設', '', [
      sel('實質薪資成長', 'adv.wageGrowth', [{ v: 0, label: '0%（停滯）' }, { v: 0.01, label: '1%（近 10 年平均）' }, { v: 0.02, label: '2%（樂觀）' }]),
      sel('存款實質報酬', 'adv.returnRate', [{ v: 0, label: '0%（定存打平通膨）' }, { v: 0.01, label: '1%' }, { v: 0.03, label: '3%（長期投資）' }]),
      sel('借款實質成本', 'adv.borrowRate', [{ v: 0.02, label: '2%' }, { v: 0.03, label: '3%' }, { v: 0.05, label: '5%' }]),
      sel('通膨', 'adv.inflation', [{ v: 0.015, label: '1.5%' }, { v: 0.02, label: '2%' }, { v: 0.03, label: '3%' }]),
      sel('一般房貸利率', 'adv.bankRate', [{ v: 0.022, label: '2.2%' }, { v: 0.025, label: '2.5%' }, { v: 0.03, label: '3.0%' }]),
      sel('租金補貼', 'adv.rentSubsidy', [{ v: true, label: '會申請' }, { v: false, label: '不申請' }]),
      sel('新青安到期後', 'adv.qinganExtend', [{ v: true, label: '假設政策延續' }, { v: false, label: '2029 年後不再有' }]),
      sel('成長津貼', 'adv.pending', [{ v: false, label: '不計入（未通過）' }, { v: true, label: '計入（每月 5,000）' }])
    ], false));
    side.appendChild(panel);
  }
  function uniq(list, v) { if (list.indexOf(v) < 0) list = list.concat([v]).sort(function (a, b) { return a - b; }); return list; }
  APP.buildPanel = buildPanel;
  APP.ledger = ledger;
})();
