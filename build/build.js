// 組合單一 HTML 檔：
//   dist/index.html — claude.ai 上的舊版（純本機，不收資料）
//   index.html      — GitHub Pages 網站（連 Supabase），設定在 build/web.config.json
// 用法：node build/build.js
const fs = require('fs'), path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, '..', 'src', p), 'utf8');
const js = ['data.js', 'geo.js', 'popgrid.js', 'engine.js', 'world.js', 'country-jp.js', 'country-kr.js', 'country-fr.js', 'country-cn.js', 'country-us.js', 'country-uk.js', 'util.js', 'people.js', 'community.js', 'globe.js', 'twmap.js', 'charts.js', 'questions.js', 'app.js', 'screen-cover.js', 'screen-notice.js', 'screen-quiz.js', 'screen-result.js', 'screen-world.js', 'screen-lab.js', 'screen-method.js']
  .map(f => '/* ---- ' + f + ' ---- */\n' + R(f).replace(/\nif \(typeof module !== ['"]undefined['"]\) module\.exports = [A-Z]+;\s*$/m, '\n')).join('\n');
// CSS 大括號必須成對（避免一處錯誤讓後面的樣式全部失效）
(function () { const css = R('styles.css'); let d = 0; for (const ch of css) { if (ch === '{') d++; else if (ch === '}') { d--; if (d < 0) throw new Error('styles.css: 多了一個 }'); } } if (d !== 0) throw new Error('styles.css: 有 ' + d + ' 個 { 沒有關閉'); })();
const BUILD = new Date().toISOString().slice(0, 16);
const probe = `window.__diag = { t0: Date.now(), build: '${BUILD}', timer: false, mc: false, raf: false, errors: [] };
setTimeout(function () { window.__diag.timer = true; }, 30);
try { var __mc = new MessageChannel(); __mc.port1.onmessage = function () { window.__diag.mc = true; }; __mc.port2.postMessage(0); } catch (e) {}
try { requestAnimationFrame(function () { window.__diag.raf = true; }); } catch (e) {}
`;
const CFGP = path.join(__dirname, 'web.config.json');
const CFG = fs.existsSync(CFGP) ? JSON.parse(fs.readFileSync(CFGP, 'utf8')) : {};
const REPO = CFG.repoUrl || 'https://github.com/jasontzeng123/next-gen';
const DESC = '用你心中養孩子的標準，加上台灣真實的房價、薪資、補助與稅制，算算你有沒有足夠的錢把孩子養大。';
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700;900&family=Noto+Sans+TC:wght@400;500;700&family=LXGW+WenKai+TC:wght@400;700&family=DotGothic16&display=swap">`;
const APPBODY = `<div id="app">
  <header id="topbar" class="topbar"></header>
  <main id="main" class="main" tabindex="-1"></main>
  <footer class="foot">
    <div class="foot-credit"><span class="foot-k">製作</span><a href="https://www.threads.com/@popo890827" target="_blank" rel="noopener noreferrer">popo890827</a><span class="foot-x">×</span><span>Claude</span><a class="foot-th" href="https://www.threads.com/@popo890827" target="_blank" rel="noopener noreferrer">在 Threads 上追蹤 @popo890827</a></div>
    <div class="foot-links"><a href="${REPO}" target="_blank" rel="noopener noreferrer">原始碼與資料來源</a><a href="${REPO}/issues/new" target="_blank" rel="noopener noreferrer">回報錯誤</a><span>程式碼 MIT・內容 CC BY 4.0</span></div>
    <div class="foot-meta"><span>依 2026 年 10 月公開資料試算，不是理財建議。</span><span>主計總處・內政部・勞動部・衛福部・財政部・樂居・591</span></div>
  </footer>
</div>`;
// 自架網站：字型改成不擋畫面的載入方式（Google 字型慢或連不上時，先用系統字型顯示）
// 內文的黑體直接用系統內建（iPhone 的蘋方、Android 的 Noto Sans CJK），少下載一大包字型
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@500;700;900&family=LXGW+WenKai+TC:wght@400;700&family=DotGothic16&display=swap';
const FONTS_WEB = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="${FONT_URL}" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="${FONT_URL}"></noscript>`;
const SCRIPT = `<script>
${probe}
${js}
APP.start();
</script>`;
// claude.ai Artifact 版：發佈時平台會補上 <html><head> 外框
const html = `<title>你有資格生下一代嗎？</title>
<meta name="description" content="${DESC}">
${FONTS}
<script>window.TWKIDS = { target: 'artifact', local: true };</script>
<style>
${R('styles.css')}
</style>
${APPBODY}
${SCRIPT}
`;
fs.mkdirSync(path.join(__dirname, '..', 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'index.html'), html);
console.log('dist/index.html', (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB');

// ---------- 自架網站版（GitHub Pages + Supabase） ----------
if (CFG.siteUrl) {
  const cfg = CFG;
  const site = cfg.siteUrl.replace(/\/?$/, '/');
  const sb = cfg.sb && cfg.sb.url && cfg.sb.key ? { url: cfg.sb.url.replace(/\/+$/, ''), key: cfg.sb.key } : null;
  const esc = t => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const SEAL = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="3" y="3" width="34" height="34" rx="5" fill="#fbfcfa" stroke="#c0302b" stroke-width="3"/><text x="20" y="27.5" text-anchor="middle" font-family="Noto Serif TC,Noto Serif CJK TC,serif" font-weight="900" font-size="20" fill="#c0302b">審</text></svg>';
  const web = `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>你有資格生下一代嗎？</title>
<meta name="description" content="${esc(DESC)}">
<link rel="canonical" href="${site}">
<meta property="og:type" content="website">
<meta property="og:locale" content="zh_TW">
<meta property="og:site_name" content="生育資格審查">
<meta property="og:title" content="你有資格生下一代嗎？">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:url" content="${site}">
<meta property="og:image" content="${site}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="你有資格生下一代嗎？2025 年台灣出生 107,812 人，比 2000 年少 65%。">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#e9eee9" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0d1210" media="(prefers-color-scheme: dark)">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
${FONTS_WEB}
<style>body{margin:0}[hidden]{display:none!important}</style>
<style>
${R('styles.css')}
</style>
<script>window.TWKIDS = ${JSON.stringify({ target: 'web', siteUrl: site, repoUrl: REPO, sb: sb })};</script>
</head>
<body>
${APPBODY}
${SCRIPT}
</body>
</html>
`;
  // 網站檔案直接放在專案根目錄（GitHub Pages 從根目錄發佈）
  const out = path.join(__dirname, '..');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), web);
  fs.writeFileSync(path.join(out, 'favicon.svg'), SEAL);
  fs.writeFileSync(path.join(out, '.nojekyll'), '');
  // 免費方案閒置一週會暫停：每 3 天讀一次資料庫（publishable key 本來就公開在網頁裡）
  if (sb) {
    fs.mkdirSync(path.join(out, '.github', 'workflows'), { recursive: true });
    fs.writeFileSync(path.join(out, '.github', 'workflows', 'keepalive.yml'), `name: 保持資料庫運作
on:
  schedule:
    - cron: '17 3 */3 * *'
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: 讀一次資料庫
        run: |
          curl -fsS -X POST "${sb.url}/rest/v1/rpc/list_choices" \\
            -H "apikey: ${sb.key}" -H "Content-Type: application/json" \\
            -d '{"p_limit":1}' > /dev/null
`);
  }
  console.log('index.html', (Buffer.byteLength(web) / 1024).toFixed(1) + ' KB', sb ? '（已連上 Supabase）' : '（尚未設定 Supabase：本機模式）');
}

// 資料來源清單（docs/資料來源.md）
require('./sources.js');
