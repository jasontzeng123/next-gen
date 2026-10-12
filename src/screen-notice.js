/* 填寫須知：按下「開始填寫」後、第一題之前，用四句話說清楚隱私、資料、限制與開源 */
APP.screens.notice = function (main) {
  'use strict';
  var h = U.h, A = APP;
  var local = COMM.st.backend === 'local' || !(window.TWKIDS && window.TWKIDS.sb);
  var wrap = h('div', { class: 'notice fade-in' });
  var sheet = h('div', { class: 'sheet' }), inn = h('div', { class: 'sheet-in' });
  inn.appendChild(h('div', { class: 'form-kicker' }, '生育資格審查申請書・填寫須知'));
  inn.appendChild(h('h1', { class: 'notice-title' }, '開始之前'));
  [
    ['lock', '資料只在你的手機裡', local
      ? '答案與試算都在這個瀏覽器裡完成，不用登入。這個版本不會上傳任何資料。'
      : '答案與試算都在這個瀏覽器裡完成，不用登入。填完時可以選擇要不要匿名分享部分答案；不同意，就什麼都不會送出。'],
    ['book', '都是真實數據', '房價、租金、薪資、補助與稅制，來自主計總處、實價登錄等 51 個公開來源。'],
    ['info', '這只是試算', '用平均值與現行政策估算，算不到你家的所有狀況。結果只回答「錢夠不夠」，不代表你適不適合當爸媽。'],
    ['code', '計算方式公開', '程式碼與資料來源都開源在 GitHub，歡迎檢查、抓錯。']
  ].forEach(function (r) {
    inn.appendChild(h('div', { class: 'notice-item' },
      h('div', { class: 'notice-ic', 'aria-hidden': 'true' }, U.icon(r[0])),
      h('div', {}, h('h2', {}, r[1]), h('p', {}, r[2]))));
  });
  inn.appendChild(h('div', { class: 'notice-cta' },
    h('button', { class: 'btn seal', type: 'button', onclick: function () { U.store.set('noticeOk', Date.now()); A.qi = 0; A.go('quiz'); } }, '我了解了，開始填寫', U.icon('next')),
    h('button', { class: 'linkbtn', type: 'button', onclick: function () { A.go('method'); } }, '完整說明')));
  sheet.appendChild(inn); wrap.appendChild(sheet); main.appendChild(wrap);
};
