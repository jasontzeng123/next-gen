/* =========================================================================
   GLOBE — 點陣地球（正射投影、可拖曳旋轉）
   ========================================================================= */
var Globe = (function () {
  'use strict';
  var grid = null, W = 0, H = 0, IDX = {};
  function decode() {
    if (grid) return;
    W = GEO.w; H = GEO.h; grid = new Uint8Array(W * H);
    var rows = GEO.rle.split('|'), p = 0;
    for (var y = 0; y < rows.length; y++) {
      var toks = rows[y].split(';');
      for (var i = 0; i < toks.length; i++) {
        var t = toks[i], star = t.indexOf('*');
        var v = star >= 0 ? t.slice(0, star) : t, n = star >= 0 ? parseInt(t.slice(star + 1), 16) : 1;
        var val = v ? parseInt(v, 16) : 0;
        for (var j = 0; j < n; j++) grid[p++] = val;
      }
    }
    GEO.countries.forEach(function (c, i) { IDX[c.a3] = i + 1; });
  }
  var D2R = Math.PI / 180;

  function create(canvas, opts) {
    decode();
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var st = { lon: opts.lon != null ? opts.lon : 105, lat: opts.lat != null ? opts.lat : 18, zoom: opts.zoom || 1, vx: 0, auto: opts.auto !== false, hover: 0, sel: opts.selected || 'TWN', dragging: false, anim: null };
    // 縮放範圍：1 倍是整顆地球；5 倍時一格地圖資料（0.5 度）約占 2 個點，再放大只會更粗糙
    var ZMIN = opts.minZoom || 1, ZMAX = opts.maxZoom || 5;
    var colors = {};
    function readColors() {
      colors = { ocean: U.cssVar('--rule-soft'), land: U.cssVar('--ink-3'), landHi: U.cssVar('--ink'), tw: U.cssVar('--seal'), sel: U.cssVar('--pen'), sheet: U.cssVar('--sheet'), ring: U.cssVar('--rule') };
    }
    readColors();
    var mq; try { mq = window.matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener('change', function () { readColors(); }); } catch (e) { /* 舊瀏覽器 */ }
    var mo = new MutationObserver(function () { readColors(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    var size = 0, dpr = 1;
    function resize() {
      var w = canvas.clientWidth || 400; dpr = Math.min(2, window.devicePixelRatio || 1);
      size = w; canvas.width = Math.round(w * dpr); canvas.height = Math.round(w * dpr);
    }
    function inv(px, py) {
      var R = size / 2 * 0.9 * st.zoom, cx = size / 2, cy = size / 2;
      var x = (px - cx) / R, y = (cy - py) / R, r2 = x * x + y * y;
      if (r2 > 1) return null;
      var z = Math.sqrt(1 - r2), p0 = st.lat * D2R;
      var lat = Math.asin(y * Math.cos(p0) + z * Math.sin(p0));
      var lon = st.lon * D2R + Math.atan2(x, z * Math.cos(p0) - y * Math.sin(p0));
      return [lon / D2R, lat / D2R, z];
    }
    function fwd(lon, lat) {
      var R = size / 2 * 0.9 * st.zoom, l = (lon - st.lon) * D2R, p = lat * D2R, p0 = st.lat * D2R;
      var x = Math.cos(p) * Math.sin(l), y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
      var z = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
      return [size / 2 + x * R, size / 2 - y * R, z];
    }
    function cell(lon, lat) {
      lon = ((lon + 180) % 360 + 360) % 360; var gx = Math.floor(lon / 360 * W), gy = Math.floor((90 - lat) / 180 * H);
      if (gy < 0) gy = 0; if (gy >= H) gy = H - 1;
      return grid[gy * W + gx];
    }
    function draw() {
      if (!size) resize();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      var R = size / 2 * 0.9 * st.zoom, cx = size / 2, cy = size / 2;
      // 外框
      if (R * 2 <= size * 1.02) { ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.strokeStyle = colors.ring; ctx.lineWidth = 1; ctx.globalAlpha = .6; ctx.stroke(); ctx.globalAlpha = 1; }
      var step = Math.max(4.2, size / 96);
      var twIdx = IDX.TWN, selIdx = IDX[st.sel], hovIdx = st.hover;
      var colorFor = opts.colorFor;
      for (var py = step / 2; py < size; py += step) {
        for (var px = step / 2; px < size; px += step) {
          var g = inv(px, py); if (!g) continue;
          var v = cell(g[0], g[1]);
          var shade = 0.35 + 0.65 * g[2];
          var r, col;
          if (!v) { r = step * 0.16; col = colors.ocean; ctx.globalAlpha = 0.5 + 0.5 * shade; }
          else {
            var a3 = GEO.countries[v - 1].a3;
            var cc = colorFor ? colorFor(a3) : null;
            r = step * (0.24 + 0.12 * shade);
            if (v === twIdx) { col = cc || colors.tw; r = step * 0.46; ctx.globalAlpha = 1; }
            else if (v === hovIdx) { col = colors.landHi; ctx.globalAlpha = 1; }
            else { col = cc || colors.land; ctx.globalAlpha = 0.45 + 0.55 * shade; }
            if (v === selIdx && v !== twIdx) col = colors.sel;
          }
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      // 台灣標記
      var tw = fwd(120.95, 23.7);
      if (tw[2] > 0.05) {
        var t = (performance.now() / 1000) % 1.6 / 1.6;
        ctx.strokeStyle = colorFor && colorFor('TWN') ? colorFor('TWN') : colors.tw; ctx.lineWidth = 1.6;
        ctx.globalAlpha = 1 - t; ctx.beginPath(); ctx.arc(tw[0], tw[1], 8 + t * 18, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(tw[0], tw[1], 8, 0, Math.PI * 2); ctx.stroke();
        ctx.font = '700 13px ' + U.cssVar('--f-sans'); ctx.fillStyle = colors.landHi; ctx.textAlign = 'left';
        ctx.fillStyle = colors.sheet; ctx.globalAlpha = .85; var lw = ctx.measureText('台灣').width; ctx.fillRect(tw[0] + 13, tw[1] - 10, lw + 10, 20); ctx.globalAlpha = 1;
        ctx.fillStyle = colors.landHi; ctx.fillText('台灣', tw[0] + 18, tw[1] + 5);
      }
      // 城市標記（可省略）：[{ id, lon, lat, color, label, sel }]
      // 名稱依序試放在右、左、上、下，會和別的名稱或點重疊就不寫（點仍可點選，滑過會顯示名稱）
      if (opts.markers) {
        var ms = (opts.markers() || []).slice().sort(function (a, b) { return (b.sel ? 1 : 0) - (a.sel ? 1 : 0); });
        var boxes = [];
        if (tw[2] > 0.05) { ctx.font = '700 13px ' + U.cssVar('--f-sans'); boxes.push([tw[0] - 9, tw[1] - 10, tw[0] + 23 + ctx.measureText('台灣').width, tw[1] + 10]); }
        ms.forEach(function (m) { var q = fwd(m.lon, m.lat); m._p = q; if (q[2] >= 0.05) { var rr = m.sel ? 11.5 : 7; boxes.push([q[0] - rr, q[1] - rr, q[0] + rr, q[1] + rr]); } });
        var hit = function (b) { for (var i = 0; i < boxes.length; i++) { var o = boxes[i]; if (b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]) return true; } return false; };
        var labels = [];
        ms.forEach(function (m) {
          var q = m._p; if (q[2] < 0.05 || !m.label) return;
          ctx.font = (m.sel ? '700 ' : '500 ') + '12px ' + U.cssVar('--f-sans');
          var w = ctx.measureText(m.label).width + 6, r = m.sel ? 11.5 : 7.5;
          var cand = [[q[0] + r, q[1] - 8], [q[0] - r - w, q[1] - 8], [q[0] - w / 2, q[1] - r - 16], [q[0] - w / 2, q[1] + r]];
          for (var i = 0; i < cand.length; i++) {
            var b = [cand[i][0], cand[i][1], cand[i][0] + w, cand[i][1] + 16];
            if (b[0] < 0 || b[2] > size || b[1] < 0 || b[3] > size) continue;
            if (!hit(b)) { boxes.push(b); labels.push({ m: m, b: b }); return; }
          }
          if (m.sel) labels.push({ m: m, b: [cand[0][0], cand[0][1], cand[0][0] + w, cand[0][1] + 16] }); // 選取的城市一定寫
        });
        ms.forEach(function (m) {
          var q = m._p; if (q[2] < 0.05) return;
          var r = m.sel ? 7.5 : 5.5;
          ctx.globalAlpha = 1;
          if (m.sel) { ctx.beginPath(); ctx.arc(q[0], q[1], r + 4, 0, Math.PI * 2); ctx.strokeStyle = colors.landHi; ctx.lineWidth = 2; ctx.stroke(); }
          ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, Math.PI * 2); ctx.fillStyle = m.color || colors.sel; ctx.fill();
          ctx.lineWidth = 1.6; ctx.strokeStyle = colors.sheet; ctx.stroke();
        });
        labels.forEach(function (l) {
          ctx.font = (l.m.sel ? '700 ' : '500 ') + '12px ' + U.cssVar('--f-sans');
          ctx.fillStyle = colors.sheet; ctx.globalAlpha = .85; ctx.fillRect(l.b[0], l.b[1], l.b[2] - l.b[0], 16); ctx.globalAlpha = 1;
          ctx.fillStyle = colors.landHi; ctx.textAlign = 'left'; ctx.fillText(l.m.label, l.b[0] + 3, l.b[1] + 12);
        });
      }
    }
    // 離點擊位置最近的城市標記（16px 內）
    function nearMarker(px, py) {
      if (!opts.markers) return null;
      var best = null, bd = 16 * 16;
      (opts.markers() || []).forEach(function (m) {
        var q = m._p || fwd(m.lon, m.lat); if (q[2] < 0.05) return;
        var dx = px - q[0], dy = py - q[1], d2 = dx * dx + dy * dy;
        if (d2 < bd) { bd = d2; best = m; }
      });
      return best;
    }
    var raf = 0, last = 0, alive = true;
    function loop(ts) {
      if (!alive) return;
      var dt = last ? Math.min(50, ts - last) : 16; last = ts;
      if (st.anim) {
        var a = st.anim, k = Math.min(1, (ts - a.t0) / a.dur), e = a.ease === 'out' ? 1 - Math.pow(1 - k, 3) : k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        st.lon = a.lon0 + (a.lon1 - a.lon0) * e; st.lat = a.lat0 + (a.lat1 - a.lat0) * e; st.zoom = a.z0 + (a.z1 - a.z0) * e;
        if (k >= 1) { st.anim = null; if (a.done) a.done(); }
      } else if (!st.dragging) {
        if (Math.abs(st.vx) > 0.001) { st.lon -= st.vx * dt; st.vx *= 0.94; }
        else if (st.auto) st.lon += dt * 0.006;
      }
      draw();
      raf = requestAnimationFrame(loop);
    }
    // 互動：單指拖曳旋轉；雙指縮放（超過範圍會有阻力，放開後回彈）；觸控板捏合（Ctrl＋滾輪）
    var lastX = 0, lastY = 0, lastT = 0, moved = 0;
    var pts = {}, pinch = null, rawZ = st.zoom, wheelT = 0;
    function npts() { return Object.keys(pts).length; }
    function two() { var k = Object.keys(pts); return [pts[k[0]], pts[k[1]]]; }
    // 超過範圍時越拉越緊（橡皮筋）：最多再放大 35%、再縮小 25%
    function rubber(z) {
      if (z > ZMAX) return ZMAX * (1 + 0.35 * (1 - ZMAX / z));
      if (z < ZMIN) return ZMIN * (1 - 0.25 * (1 - z / ZMIN));
      return z;
    }
    function settle() {
      var tz = Math.max(ZMIN, Math.min(ZMAX, st.zoom));
      rawZ = tz;
      if (Math.abs(tz - st.zoom) < 1e-4) return;
      st.anim = { t0: performance.now(), dur: U.reduceMotion() ? 1 : 340, lon0: st.lon, lon1: st.lon, lat0: st.lat, lat1: st.lat, z0: st.zoom, z1: tz, ease: 'out' };
    }
    canvas.addEventListener('pointerdown', function (e) {
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* 略過 */ }
      st.auto = false; st.anim = null;
      if (npts() === 2) {
        var p2 = two();
        pinch = { d0: Math.max(10, Math.hypot(p2[0].x - p2[1].x, p2[0].y - p2[1].y)), z0: rawZ = st.zoom, mx: (p2[0].x + p2[1].x) / 2, my: (p2[0].y + p2[1].y) / 2 };
        st.dragging = false; st.vx = 0; moved = 999; // 雙指操作結束時不算點選
        return;
      }
      if (npts() > 2) return;
      st.dragging = true; lastX = e.clientX; lastY = e.clientY; lastT = performance.now(); moved = 0;
    });
    canvas.addEventListener('pointermove', function (e) {
      var rect = canvas.getBoundingClientRect();
      if (pts[e.pointerId]) { pts[e.pointerId].x = e.clientX; pts[e.pointerId].y = e.clientY; }
      if (pinch && npts() >= 2) {
        var p2 = two(), d = Math.max(10, Math.hypot(p2[0].x - p2[1].x, p2[0].y - p2[1].y));
        rawZ = pinch.z0 * d / pinch.d0; st.zoom = rubber(rawZ);
        // 兩指一起移動：跟著轉動地球
        var mx = (p2[0].x + p2[1].x) / 2, my = (p2[0].y + p2[1].y) / 2, kk = 0.32 / st.zoom;
        st.lon -= (mx - pinch.mx) * kk; st.lat = Math.max(-70, Math.min(70, st.lat + (my - pinch.my) * kk));
        pinch.mx = mx; pinch.my = my;
        return;
      }
      if (st.dragging) {
        var dx = e.clientX - lastX, dy = e.clientY - lastY, now = performance.now();
        moved += Math.abs(dx) + Math.abs(dy);
        var k = 0.32 / st.zoom;
        st.lon -= dx * k; st.lat = Math.max(-70, Math.min(70, st.lat + dy * k));
        st.vx = dx * k / Math.max(8, now - lastT);
        lastX = e.clientX; lastY = e.clientY; lastT = now;
      }
      var g = inv(e.clientX - rect.left, e.clientY - rect.top);
      var v = g ? cell(g[0], g[1]) : 0;
      st.hover = v;
      if (typeof nearMarker === 'function') {
        var mk = nearMarker(e.clientX - rect.left, e.clientY - rect.top);
        if (mk && opts.onHoverMarker) { opts.onHoverMarker(mk, e.clientX - rect.left, e.clientY - rect.top); return; }
      }
      if (opts.onHover) opts.onHover(v ? GEO.countries[v - 1] : null, e.clientX - rect.left, e.clientY - rect.top);
    });
    function up(e) {
      var wasPinch = !!pinch;
      delete pts[e.pointerId];
      if (pinch && npts() < 2) { pinch = null; settle(); }
      if (wasPinch) { st.dragging = false; return; }
      if (!st.dragging) return; st.dragging = false;
      if (moved < 6) {
        var rect = canvas.getBoundingClientRect();
        if (typeof nearMarker === 'function') {
          var mk = nearMarker(e.clientX - rect.left, e.clientY - rect.top);
          if (mk && opts.onPickMarker) { opts.onPickMarker(mk); return; }
        }
        var g = inv(e.clientX - rect.left, e.clientY - rect.top);
        var v = g ? cell(g[0], g[1]) : 0;
        // 台灣很小：點在台灣附近也算
        var tw = fwd(120.95, 23.7), dx = e.clientX - rect.left - tw[0], dy = e.clientY - rect.top - tw[1];
        if (tw[2] > 0 && dx * dx + dy * dy < 22 * 22) v = IDX.TWN;
        if (v && opts.onPick) opts.onPick(GEO.countries[v - 1]);
      }
    }
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', function (e) { delete pts[e.pointerId]; if (pinch && npts() < 2) { pinch = null; settle(); } st.dragging = false; });
    // 觸控板捏合（瀏覽器會送出按住 Ctrl 的滾輪事件）；一般滾輪仍然捲動頁面
    canvas.addEventListener('wheel', function (e) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      st.auto = false; st.anim = null;
      if (performance.now() - wheelT > 250) rawZ = st.zoom;
      wheelT = performance.now();
      rawZ *= Math.exp(-e.deltaY * 0.01); st.zoom = rubber(rawZ);
      clearTimeout(st.wheelTimer); st.wheelTimer = setTimeout(settle, 160);
    }, { passive: false });
    // iOS Safari：避免雙指縮放整個頁面
    canvas.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    canvas.addEventListener('pointerleave', function () { st.hover = 0; if (opts.onHover) opts.onHover(null); });
    var ro = new ResizeObserver(function () { resize(); });
    ro.observe(canvas);
    resize();
    if (U.reduceMotion()) st.auto = false;
    raf = requestAnimationFrame(loop);
    return {
      st: st,
      flyTo: function (lon, lat, zoom, dur, done) {
        var dl = ((lon - st.lon) % 360 + 540) % 360 - 180;
        var zt = Math.max(ZMIN, Math.min(ZMAX, zoom || st.zoom)); rawZ = zt;
        st.anim = { t0: performance.now(), dur: U.reduceMotion() ? 1 : (dur || 1200), lon0: st.lon, lon1: st.lon + dl, lat0: st.lat, lat1: lat, z0: st.zoom, z1: zt, done: done };
        st.auto = false;
      },
      select: function (a3) { st.sel = a3; },
      destroy: function () { alive = false; cancelAnimationFrame(raf); clearTimeout(st.wheelTimer); ro.disconnect(); mo.disconnect(); },
      redraw: draw
    };
  }
  return { create: create };
})();
