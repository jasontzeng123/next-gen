/* =========================================================================
   PEOPLE — 100 人圖（橫式人形圖示，預設 20 × 5）
   100 個同齡、同產業的人，依收入由高到低、由左而右排列；
   收入達到門檻的人上色，其餘為灰色。
   ========================================================================= */
var People = (function () {
  'use strict';
  var CW = 24, CH = 58, GX = 8, GY = 18;        // 單一人形 24×58，間距
  // 人形：頭＋身體（手臂、軀幹、雙腿一筆畫完成，避免接縫）
  var HEAD = { cx: 12, cy: 6.2, r: 5.3 };
  var BODY = 'M1 19.5Q1 13.2 7.3 13.2H16.7Q23 13.2 23 19.5V32.6a2 2 0 0 1-4 0V20.4h-.85V55a2.85 2.85 0 0 1-5.7 0V36.4h-.9V55a2.85 2.85 0 0 1-5.7 0V20.4H5V32.6a2 2 0 0 1-4 0Z';
  function dims(cols) { var rows = Math.ceil(100 / cols); return { cols: cols, rows: rows, W: cols * CW + (cols - 1) * GX, H: rows * CH + (rows - 1) * GY }; }
  // 收入 PR 至少 th 的人數；與文字「收入要在前 X%」的四捨五入一致（門檻 ≤ PR 1 視為人人都達到）
  function count(th) {
    if (th == null) return 0;
    if (th <= 1) return 100;
    return Math.max(0, Math.min(100, Math.round(100 - th)));
  }
  function pos(i, cols) { var r = Math.floor(i / cols), c = i % cols; return [c * (CW + GX), r * (CH + GY)]; }
  // SVG 版（報告）
  function svg(th, opts) {
    opts = opts || {};
    var n = opts.n != null ? opts.n : count(th), d = dims(opts.cols || 20);
    var root = U.svg('svg', { viewBox: '-2 -2 ' + (d.W + 4) + ' ' + (d.H + 4), class: 'people' + (opts.animate ? ' anim' : ''), role: 'img', 'aria-label': opts.label || ('100 人中有 ' + n + ' 人') });
    for (var i = 0; i < 100; i++) {
      var p = pos(i, d.cols);
      var g = U.svg('g', { transform: 'translate(' + p[0] + ',' + p[1] + ')', class: 'pp ' + (i < n ? 'on' : 'off') });
      g.appendChild(U.svg('circle', { cx: HEAD.cx, cy: HEAD.cy, r: HEAD.r }));
      g.appendChild(U.svg('path', { d: BODY }));
      if (opts.animate) g.style.animationDelay = (Math.floor(i / d.cols) * 40 + (i % d.cols) * 14) + 'ms';
      root.appendChild(g);
    }
    return root;
  }
  // Canvas 版（分享圖卡）；回傳實際高度
  function draw(ctx, x0, y0, width, n, col, cols) {
    var d = dims(cols || 20), k = width / d.W, body = new Path2D(BODY);
    for (var i = 0; i < 100; i++) {
      var p = pos(i, d.cols);
      ctx.save();
      ctx.translate(x0 + p[0] * k, y0 + p[1] * k); ctx.scale(k, k);
      ctx.fillStyle = i < n ? col.on : col.off;
      ctx.beginPath(); ctx.arc(HEAD.cx, HEAD.cy, HEAD.r, 0, Math.PI * 2); ctx.fill();
      ctx.fill(body);
      ctx.restore();
    }
    return d.H * k;
  }
  function ratio(cols) { var d = dims(cols || 20); return d.H / d.W; }
  return { svg: svg, draw: draw, count: count, ratio: ratio };
})();
