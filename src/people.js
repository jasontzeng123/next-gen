/* =========================================================================
   PEOPLE — 10 人圖（一列 10 個人形，每人代表 10%）
   100 個同齡、同產業的人濃縮成 10 個：收入達到門檻的比例由左往右上色，
   不滿一個人的部分由下往上填色（例如 2% → 第一個人填到 2 成高）。
   ========================================================================= */
var People = (function () {
  'use strict';
  var N = 10, CW = 24, CH = 58, GX = 9.4;        // 單一人形 24×58，間距
  // 人形：頭＋身體（手臂、軀幹、雙腿一筆畫完成，避免接縫）
  var HEAD = { cx: 12, cy: 6.2, r: 5.3 };
  var BODY = 'M1 19.5Q1 13.2 7.3 13.2H16.7Q23 13.2 23 19.5V32.6a2 2 0 0 1-4 0V20.4h-.85V55a2.85 2.85 0 0 1-5.7 0V36.4h-.9V55a2.85 2.85 0 0 1-5.7 0V20.4H5V32.6a2 2 0 0 1-4 0Z';
  var W = N * CW + (N - 1) * GX, uid = 0;
  // 收入 PR 至少 th 的人數（每 100 人）；與文字「收入要在前 X%」的四捨五入一致（門檻 ≤ PR 1 視為人人都達到）
  function count(th) {
    if (th == null) return 0;
    if (th <= 1) return 100;
    return Math.max(0, Math.min(100, Math.round(100 - th)));
  }
  // 第 i 個人形上色的比例（0–1）
  function fill(n, i) { return Math.max(0, Math.min(1, n / 10 - i)); }
  // SVG 版（報告、世界比較）
  function svg(th, opts) {
    opts = opts || {};
    var n = opts.n != null ? opts.n : count(th), id = 'ppc' + (++uid);
    var root = U.svg('svg', { viewBox: '-1 -1 ' + (W + 2) + ' ' + (CH + 2), class: 'people' + (opts.animate ? ' anim' : ''), role: 'img', 'aria-label': opts.label || ('100 人中有 ' + n + ' 人') });
    var defs = U.svg('defs', {}), any = false;
    for (var i = 0; i < N; i++) {
      var f = fill(n, i), x = i * (CW + GX);
      var g = U.svg('g', { transform: 'translate(' + x + ',0)', class: 'pp' });
      if (opts.animate) g.style.animationDelay = (i * 60) + 'ms';
      g.appendChild(fig('off'));
      if (f >= 1) g.appendChild(fig('on'));
      else if (f > 0) {
        var cp = U.svg('clipPath', { id: id + i }); cp.appendChild(U.svg('rect', { x: -1, y: CH * (1 - f), width: CW + 2, height: CH * f + 1 }));
        defs.appendChild(cp); any = true;
        var part = fig('on'); part.setAttribute('clip-path', 'url(#' + id + i + ')'); g.appendChild(part);
      }
      root.appendChild(g);
    }
    if (any) root.insertBefore(defs, root.firstChild);
    return root;
  }
  function fig(cls) {
    var g = U.svg('g', { class: cls });
    g.appendChild(U.svg('circle', { cx: HEAD.cx, cy: HEAD.cy, r: HEAD.r }));
    g.appendChild(U.svg('path', { d: BODY }));
    return g;
  }
  // Canvas 版（分享圖卡）；回傳實際高度
  function draw(ctx, x0, y0, width, n, col) {
    var k = width / W, body = new Path2D(BODY);
    function one(x, color, clipY) {
      ctx.save();
      if (clipY != null) { ctx.beginPath(); ctx.rect(x - 2, clipY, CW * k + 4, y0 + CH * k + 2 - clipY); ctx.clip(); }
      ctx.translate(x, y0); ctx.scale(k, k); ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(HEAD.cx, HEAD.cy, HEAD.r, 0, Math.PI * 2); ctx.fill(); ctx.fill(body);
      ctx.restore();
    }
    for (var i = 0; i < N; i++) {
      var x = x0 + i * (CW + GX) * k, f = fill(n, i);
      one(x, col.off);
      if (f >= 1) one(x, col.on);
      else if (f > 0) one(x, col.on, y0 + CH * k * (1 - f));
    }
    return CH * k;
  }
  function ratio() { return CH / W; }
  return { svg: svg, draw: draw, count: count, ratio: ratio };
})();
