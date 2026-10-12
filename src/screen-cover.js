/* 封面 */
APP.screens.cover = function (main) {
  'use strict';
  var h = U.h, A = APP;
  var vis = QS.visible(A.s);
  var submitted = !!(A.unlocked && (A.submitted || U.store.get('submitted', null)));
  var hasDraft = !submitted && Object.keys(A.seen).length > 0 && A.qi > 0 && A.qi < vis.length;
  var wrap = h('div', { class: 'cover fade-in' });
  var sheet = h('div', { class: 'sheet' });
  var inn = h('div', { class: 'sheet-in' });
  inn.appendChild(h('div', { class: 'form-head' },
    h('div', {}, h('div', { class: 'form-kicker' }, '台灣・生育資格審查申請書'), h('div', { class: 'form-kicker', style: { marginTop: '2px', letterSpacing: '.06em' } }, '2026 年版')),
    h('div', { class: 'form-no' }, '表單編號 115-TW', h('br'), '審查依據：現行補助與稅制')));
  inn.appendChild(h('h1', { class: 'cover-title' }, '你有資格', h('br'), '生下一代嗎', h('span', { class: 'q' }, '？')));
  inn.appendChild(h('p', { class: 'cover-lede' }, '用你心中「養孩子的最低標準」，加上台灣真實的房價、薪資、補助與稅制，從孩子出生一路算到他獨立。看看存款會不會撐過去，或者，收入要在前百分之幾才撐得住。'));
  var fields = h('div', { class: 'cover-fields' });
  [['申請人', '你（與伴侶）'], ['審查項目', '有沒有足夠的錢，把孩子養大'], ['審查依據', '2026 年房價、租金、薪資分布、補助、稅制'], ['填寫時間', '約 5 分鐘，隨時可以回頭修改']].forEach(function (r) {
    fields.appendChild(h('div', { class: 'cover-field' }, h('span', {}, r[0]), h('b', {}, r[1])));
  });
  inn.appendChild(fields);
  var cta = h('div', { class: 'cover-cta' });
  if (submitted) {
    cta.appendChild(h('button', { class: 'btn seal', onclick: function () { A.compute(true); A.go('report'); } }, '查看我的審查報告', U.icon('next')));
    cta.appendChild(h('button', { class: 'btn ghost', onclick: function () { A.qi = 0; A.go('quiz'); } }, '修改申請書'));
    cta.appendChild(h('button', { class: 'linkbtn', onclick: function () { A.restart(); } }, '全部重新填寫'));
  } else if (hasDraft) {
    cta.appendChild(h('button', { class: 'btn seal', onclick: function () { A.go('quiz'); } }, '繼續填寫（第 ' + (A.qi + 1) + ' 題）', U.icon('next')));
    cta.appendChild(h('button', { class: 'btn ghost', onclick: function () { A.restart(); } }, '重新開始'));
  } else {
    cta.appendChild(h('button', { class: 'btn seal', onclick: function () { A.startQuiz(); } }, '開始填寫申請書', U.icon('next')));
  }
  inn.appendChild(cta);
  // 色盲友善配色
  var cvdIn = h('input', { type: 'checkbox', checked: U.cvd(), onchange: function (e) { U.setCvd(e.target.checked); U.toast(e.target.checked ? '已改用色盲友善配色' : '已改回一般配色'); } });
  inn.appendChild(h('label', { class: 'cvd-toggle' }, cvdIn, h('span', { class: 'sw', 'aria-hidden': 'true' }), '色盲友善配色',
    h('span', { class: 'cvd-chips', 'aria-hidden': 'true' }, h('i', { style: { background: 'var(--good)' } }), h('i', { style: { background: '#ecd060' } }), h('i', { style: { background: 'var(--bad)' } }))));
  sheet.appendChild(inn);
  wrap.appendChild(sheet);

  var side = h('div', { class: 'sheet' });
  var b = h('div', { class: 'births' });
  var est = Math.round(107812 * (1 - 0.156));
  b.appendChild(h('h3', {}, '台灣每年出生的嬰兒'));
  b.appendChild(h('div', { class: 'births-big' }, '107,812', h('small', {}, '人・2025 年')));
  b.appendChild(h('p', { class: 'births-delta' }, h('b', {}, '↓ 65%'), '比 2000 年的 30.5 萬'));
  var chart = h('div', { class: 'births-chartbox' }); Charts.births(chart, { est: [2026, est] }); b.appendChild(chart);
  b.appendChild(h('div', { class: 'births-stats' },
    h('div', {}, h('span', {}, '總生育率'), h('b', {}, '0.695'), h('em', {}, '全世界最低之一')),
    h('div', {}, h('span', {}, '2026 年 1–7 月'), h('b', {}, '−15.6%'), h('em', {}, '比去年同期'))));
  b.appendChild(h('p', { class: 'births-note xs' }, '資料：內政部戶政統計。2026 年為依 1–7 月跌幅推估的全年數字（虛線）。'));
  side.appendChild(b);
  wrap.appendChild(side);
  main.appendChild(wrap);
};
