/* =========================================================================
   TWMAP — 台灣縣市地圖（SVG）
   ========================================================================= */
var TWMap = (function () {
  'use strict';
  var SHORT = { TPE: '台北', NTPC: '新北', TYN: '桃園', TXG: '台中', TNN: '台南', KHH: '高雄', HSZ: '竹市', HSQ: '竹縣', KEE: '基隆', ILA: '宜蘭', MIA: '苗栗', CHA: '彰化', NAN: '南投', YUN: '雲林', CYI: '嘉市', CYQ: '嘉縣', PIF: '屏東', HUA: '花蓮', TTT: '台東', PEN: '澎湖', KIN: '金門', LIE: '連江' };
  // 每個縣市「最裡面」的一點（離邊界最遠），當作引導線的起點
  var ANCHOR = { TTT: [335.9, 467.9], ILA: [437.9, 161.6], TPE: [423.7, 56.5], YUN: [192.8, 329.7], TYN: [358.6, 75], PIF: [249.9, 530.8], TXG: [267.4, 230.4], TNN: [192.9, 445], KEE: [450.3, 46.9], NAN: [310.9, 304.4], MIA: [300.8, 169.3], CYI: [218.4, 373.9], HSQ: [352.1, 131.1], NTPC: [416, 94.8], HUA: [361.3, 393.9], KHH: [269.4, 456.1], CHA: [225.7, 280.5], CYQ: [257.8, 382.8], HSZ: [308.7, 113] };
  // 本島（含人口點）的西緣與東緣：y 從 15 到 690，每 5 單位一列
  var ENV_W = [410,405,399,398,395,381,376,355,343,328,328,324,323,320,310,310,308,307,300,302,301,300,297,291,290,275,277,266,267,265,264,261,258,254,247,246,239,240,238,228,228,227,225,220,224,217,212,211,207,210,204,202,194,195,194,193,190,183,176,171,169,167,169,167,167,164,164,164,164,163,155,145,139,166,165,167,164,160,159,157,155,154,153,149,150,149,147,144,144,148,156,163,164,164,164,171,173,174,176,175,180,182,181,181,181,180,180,180,190,190,200,206,210,220,220,237,244,201,201,256,257,258,262,263,265,266,267,269,266,265,264,266,269,266,270,294];
  var ENV_E = [434,436,441,447,450,470,477,489,488,490,492,503,492,487,482,478,477,472,471,470,470,470,472,478,473,477,476,478,479,480,477,474,474,470,467,465,467,462,461,460,457,454,449,442,441,442,440,435,433,434,443,443,433,431,432,431,431,429,427,425,425,424,421,422,420,422,417,417,416,413,413,413,413,411,413,408,407,406,405,404,398,397,397,395,394,393,395,390,386,383,382,379,377,372,370,367,364,355,355,357,353,352,344,342,413,412,323,322,319,316,314,312,311,310,308,306,304,305,300,300,300,301,301,301,301,300,300,302,424,423,429,297,291,291,294,295];
  // y0～y1 之間最外側的邊緣（名字的整個高度都不能碰到陸地或人口點）
  function edge(y0, y1, side) {
    var a = side === 'L' ? ENV_W : ENV_E, v = side === 'L' ? Infinity : -Infinity;
    for (var i = Math.max(0, Math.floor((y0 - 15) / 5)); i <= Math.min(a.length - 1, Math.ceil((y1 - 15) / 5)); i++) v = side === 'L' ? Math.min(v, a[i]) : Math.max(v, a[i]);
    return isFinite(v) ? v : (side === 'L' ? 150 : 400);
  }
  var SIDE_L = ['TYN', 'HSZ', 'HSQ', 'MIA', 'TXG', 'CHA', 'NAN', 'YUN', 'CYI', 'CYQ', 'TNN', 'KHH', 'PIF'];
  var SIDE_R = ['KEE', 'TPE', 'NTPC', 'ILA', 'HUA', 'TTT'];
  // 連江、金門的插圖框：把原本的插圖往上移，讓左側的名字有空間
  var INSET = { LIE: { dy: -40, box: [8, 12, 110, 116] }, KIN: { dy: -79, box: [8, 136, 110, 92] } };
  // 名字彼此重疊時，整群一起以錨點的平均位置為中心排開（比一路往下推更貼近原位）
  function spread(arr, gap, minY, maxY) {
    var cl = arr.map(function (o) { return { it: [o], y: o.ay }; });
    var again = true;
    while (again) {
      again = false;
      for (var i = 1; i < cl.length; i++) {
        var a = cl[i - 1], b = cl[i];
        if (a.y + a.it.length * gap > b.y) {
          var it = a.it.concat(b.it), m = it.reduce(function (t, o) { return t + o.ay; }, 0) / it.length;
          var y = m - (it.length - 1) * gap / 2;
          y = Math.max(minY, Math.min(y, maxY - (it.length - 1) * gap));
          cl.splice(i - 1, 2, { it: it, y: y }); again = true; break;
        }
      }
    }
    cl.forEach(function (c) { c.it.forEach(function (o, k) { o.y = c.y + k * gap; }); });
    return arr;
  }
  function layout(ids, side, fs) {
    var arr = ids.map(function (id) { return { id: id, ay: ANCHOR[id][1] }; }).sort(function (a, b) { return a.ay - b.ay; });
    spread(arr, fs * 1.55, 22, 680);
    var m = Math.max(10, fs * 0.6);
    arr.forEach(function (o) { var e = edge(o.y - fs * 0.62, o.y + fs * 0.62, side); o.x = side === 'L' ? e - m : e + m; });
    return arr;
  }
  function create(host, opts) {
    opts = opts || {};
    var b = GEO.twBox, pad = 14;
    // 右邊多留一點空間放東岸的名字
    var vb = [b[0] - pad, b[1] - pad, b[2] - b[0] + pad * 2 + 46, b[3] - b[1] + pad * 2];
    var root = U.svg('svg', { class: 'twmap', viewBox: vb.join(' '), role: 'img', 'aria-label': opts.label || '台灣縣市地圖' });
    // 插圖框（連江、金門）
    var inset = U.svg('g', {});
    Object.keys(INSET).forEach(function (id) { var r = INSET[id].box; inset.appendChild(U.svg('rect', { class: 'inset', x: r[0], y: r[1], width: r[2], height: r[3], rx: 4 })); });
    root.appendChild(inset);
    var paths = {}, labels = {}, leads = {}, cur = null;
    GEO.tw.forEach(function (c) {
      var p = U.svg('path', { d: c.d, 'data-id': c.id, tabindex: opts.onPick ? 0 : null, role: opts.onPick ? 'button' : null, 'aria-label': (D_COUNTY(c.id) || {}).name });
      if (INSET[c.id]) p.setAttribute('transform', 'translate(0 ' + INSET[c.id].dy + ')');
      p.addEventListener('click', function () { if (opts.onPick) opts.onPick(c.id); });
      p.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && opts.onPick) { e.preventDefault(); opts.onPick(c.id); } });
      p.addEventListener('pointerenter', function (e) { if (opts.onHover) opts.onHover(c.id, e); });
      p.addEventListener('pointermove', function (e) { if (opts.onHover) opts.onHover(c.id, e); });
      p.addEventListener('pointerleave', function () { if (opts.onHover) opts.onHover(null); });
      paths[c.id] = p; root.appendChild(p);
    });
    // 名字：拉線到旁邊；點名字也能選取，滑過名字時縣市也會亮起來
    var leadLayer = U.svg('g', { class: 'tw-leads', 'aria-hidden': 'true' });
    var lblLayer = U.svg('g', { class: 'tw-labels' });
    var FS = 0;
    // 字的大小跟著地圖實際的寬度走：手機上地圖縮小時，名字仍然維持約 12px
    function fsNow() {
      var w = root.getBoundingClientRect ? root.getBoundingClientRect().width : 0;
      if (!w) return 15;
      return Math.round(Math.max(14, Math.min(21, 12.4 / (w / vb[2]))) * 2) / 2;
    }
    function addLabel(id, x, y, anchor, lead, fs) {
      var g = U.svg('g', { class: 'tw-lbl', 'data-id': id, tabindex: opts.onPick ? 0 : null, role: opts.onPick ? 'button' : null, 'aria-label': opts.onPick ? '選擇' + ((D_COUNTY(id) || {}).name || SHORT[id]) : null });
      var w = fs * 2 + 10;
      g.appendChild(U.svg('rect', { x: anchor === 'end' ? x - w + 4 : anchor === 'start' ? x - 4 : x - w / 2, y: y - fs * 0.85, width: w, height: fs * 1.7, rx: 4, class: 'tw-hit' }));
      g.appendChild(U.svg('text', { x: x, y: y + fs * 0.36, 'text-anchor': anchor, 'font-size': fs, text: SHORT[id] }));
      var hover = function (on, e) { paths[id].classList.toggle('hov', on); g.classList.toggle('hov', on); if (leads[id]) leads[id].classList.toggle('hov', on); if (opts.onHover) opts.onHover(on ? id : null, e); };
      g.addEventListener('pointerenter', function (e) { hover(true, e); });
      g.addEventListener('pointerleave', function () { hover(false); });
      g.addEventListener('click', function () { if (opts.onPick) opts.onPick(id); });
      g.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && opts.onPick) { e.preventDefault(); opts.onPick(id); } });
      labels[id] = g; lblLayer.appendChild(g);
      if (lead) {
        var a = ANCHOR[id], ex = anchor === 'end' ? x + 4 : x - 4, kx = anchor === 'end' ? x + 4 + fs * 0.5 : x - 4 - fs * 0.5;
        var d = 'M' + a[0] + ' ' + a[1] + 'L' + kx.toFixed(1) + ' ' + y.toFixed(1) + 'L' + ex.toFixed(1) + ' ' + y.toFixed(1);
        var lg = U.svg('g', { class: 'tw-lead' });
        // 底下一條背景色的寬線當襯底，壓在人口點上也看得到
        lg.appendChild(U.svg('path', { d: d, class: 'tw-lead-halo' }));
        lg.appendChild(U.svg('path', { d: d, class: 'tw-lead-line' }));
        lg.appendChild(U.svg('circle', { cx: a[0], cy: a[1], r: 2.4 }));
        leads[id] = lg; leadLayer.appendChild(lg);
      }
    }
    function build() {
      var fs = fsNow();
      if (Math.abs(fs - FS) < 0.5) return;
      FS = fs;
      var focused = document.activeElement && document.activeElement.closest && document.activeElement.closest('.tw-lbl');
      var fid = focused && focused.getAttribute('data-id');
      U.clear(leadLayer); U.clear(lblLayer); labels = {}; leads = {};
      layout(SIDE_L, 'L', fs).forEach(function (o) { addLabel(o.id, o.x, o.y, 'end', true, fs); });
      layout(SIDE_R, 'R', fs).forEach(function (o) { addLabel(o.id, o.x, o.y, 'start', true, fs); });
      // 離島：名字放在旁邊（連江、金門在插圖框的角落）
      var lie = INSET.LIE.box, kin = INSET.KIN.box;
      addLabel('LIE', 90, lie[1] + lie[3] - 6 - fs * 0.5, 'middle', false, fs);
      addLabel('KIN', 63, kin[1] + kin[3] - 6 - fs * 0.5, 'middle', false, fs);
      addLabel('PEN', 46, 436 + fs * 0.55, 'middle', false, fs);
      mark();
      if (fid && labels[fid]) labels[fid].focus();
    }
    function mark() {
      Object.keys(labels).forEach(function (id) { labels[id].classList.toggle('sel', id === cur); labels[id].setAttribute('aria-pressed', id === cur ? 'true' : 'false'); });
      Object.keys(leads).forEach(function (id) { leads[id].classList.toggle('sel', id === cur); });
      if (cur && leads[cur]) leadLayer.appendChild(leads[cur]);
    }
    root.appendChild(leadLayer); root.appendChild(lblLayer);
    host.appendChild(root);
    build();
    // 地圖寬度改變（轉向、視窗縮放、第一次排版）時，重新排名字
    if (typeof ResizeObserver !== 'undefined') { var ro = new ResizeObserver(function () { if (!root.isConnected) { ro.disconnect(); return; } build(); }); ro.observe(root); }
    function paint(fillFor, selected) {
      cur = selected || null;
      GEO.tw.forEach(function (c) {
        var f = fillFor ? fillFor(c.id) : null;
        paths[c.id].style.fill = f || 'var(--sheet-3)';
        paths[c.id].classList.toggle('sel', c.id === selected);
        if (selected && c.id === selected) root.appendChild(paths[c.id]);
      });
      // 人口點在縣市之上；引導線與名字永遠在最上層，選到的那條線最後畫
      if (dotLayer) root.appendChild(dotLayer);
      mark();
      root.appendChild(leadLayer); root.appendChild(lblLayer);
    }
    // 名字都在地圖外，不需要依底色改字色
    function setLabelColor() {}
    // 點陣台灣：規則網格的點，點的大小＝那一格陸地的人口密度，顏色＝colorFor(縣市)
    // 底下保留淡淡的陸地輪廓；人口密的地方點會變大、互相疊起來
    var dotLayer = null, dotEls = [];
    function dots(colorFor, opt) {
      if (typeof POPGRID === 'undefined') return;
      opt = opt || {};
      var bg = opt.bg || '#fbfcfa', ring = opt.ring;
      if (!dotLayer) {
        dotLayer = U.svg('g', { class: 'dots', 'aria-hidden': 'true' });
        var all = [];
        Object.keys(POPGRID.dots).forEach(function (id) { var a = POPGRID.dots[id], dy = INSET[id] ? INSET[id].dy : 0; for (var i = 0; i < a.length; i += 3) all.push([a[i], a[i + 1] + dy, a[i + 2], id]); });
        // 小點先畫、大點後畫，大點疊在上面
        all.sort(function (x, y) { return x[2] - y[2]; });
        all.forEach(function (q) {
          var r = radius(q[2]);
          var el = U.svg('circle', { cx: q[0], cy: q[1].toFixed(1), r: r.toFixed(2), 'stroke-width': r > 2 ? 0.75 : 0.35 });
          el.__id = q[3]; el.__r = r; dotEls.push(el); dotLayer.appendChild(el);
        });
        root.classList.add('dotted');
        root.insertBefore(dotLayer, leadLayer);
      }
      dotEls.forEach(function (el) {
        var c = colorFor ? colorFor(el.__id) : null;
        el.setAttribute('fill', c || 'var(--ink-3)');
        // 點與點之間用背景色的細邊分開；跟背景太接近的顏色（深色模式的黑點）改用淺色細邊
        el.setAttribute('stroke', c && ring && ring(c) ? ring(c) : bg);
      });
    }
    function clearDots() { if (dotLayer && dotLayer.parentNode) dotLayer.parentNode.removeChild(dotLayer); dotLayer = null; dotEls = []; root.classList.remove('dotted'); }
    return { el: root, paint: paint, setLabelColor: setLabelColor, paths: paths, dots: dots, clearDots: clearDots };
  }
  function D_COUNTY(id) { return DATA.COUNTY[id]; }
  // 人口密度（人／平方公里）→ 點的半徑；面積大致與密度的 0.9 次方成正比，1.2 萬以上不再放大
  var RAD = { min: 0.6, k: 0.8, cap: 12000, pw: 0.45 };
  function radius(d) { var sp = typeof POPGRID !== 'undefined' ? POPGRID.sp : 9; var t = Math.pow(Math.min(Math.max(d, 0), RAD.cap) / RAD.cap, RAD.pw); return RAD.min + (sp * RAD.k - RAD.min) * t; }
  return { create: create, SHORT: SHORT, radius: radius };
})();
