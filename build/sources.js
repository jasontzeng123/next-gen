// 由 src/data.js 的 SOURCES 產生 docs/資料來源.md（每次組裝時更新，確保清單和程式裡用的一致）
const fs = require('fs'), path = require('path');
const D = require('../src/data.js');
const GOV = /(\.gov\.tw|gov\.taipei)$/, MEDIA = /(cna\.com\.tw|ltn\.com\.tw|udn\.com|pts\.org\.tw|ctee\.com\.tw|businesstoday\.com\.tw|businessweekly\.com\.tw|parenting\.com\.tw|epochtimes\.com\.tw|taipeitimes\.com|gvm\.com\.tw|peoplenews\.tw|sinyinews\.com\.tw)$/;
function kind(u) {
  let host = ''; try { host = new URL(u).hostname; } catch (e) { return '其他'; }
  if (GOV.test(host)) return '政府機關';
  if (MEDIA.test(host)) return '新聞媒體';
  return '民間整理';
}
const esc = t => String(t).replace(/\|/g, '\\|');
const keys = Object.keys(D.SOURCES);
const count = { '政府機關': 0, '新聞媒體': 0, '民間整理': 0, '其他': 0 };
const rows = keys.map(k => { const s = D.SOURCES[k], c = kind(s.u); count[c]++; return `| \`${k}\` | ${esc(s.t)} | ${esc(s.d)} | ${c} | [連結](${s.u}) |`; });
const md = `# 資料來源清單

這份清單由 \`src/data.js\` 自動產生，和網站實際使用的來源一致。共 ${keys.length} 個來源：政府機關 ${count['政府機關']} 個、新聞媒體 ${count['新聞媒體']} 個、民間整理 ${count['民間整理']} 個。

**怎麼對照：**\`src/data.js\` 裡每一組數字的上方都有註解，寫著它來自哪裡（例如「樂居」「主計總處」「591 刊登中位數」），對照下表的來源名稱即可。每個數字更完整的出處、資料年份與推估方式，寫在 \`research/\` 的研究筆記裡（英文）。

**關於來源類型：**「新聞媒體」與「民間整理」多半是轉述官方統計或市場行情，例如 591 的租金是刊登中的物件、不是成交價，樂居的房價是實價登錄的整理。能找到官方原始資料的，研究筆記裡都有附上。

| 代號 | 來源 | 資料時間 | 類型 | 連結 |
| --- | --- | --- | --- | --- |
${rows.join('\n')}

---

發現數字有誤或過時？請到 [GitHub Issues](https://github.com/jasontzeng123/next-gen/issues/new) 回報，附上正確的來源連結會更好。
`;
fs.mkdirSync(path.join(__dirname, '..', 'docs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'docs', '資料來源.md'), md);
console.log('docs/資料來源.md', keys.length, '個來源', JSON.stringify(count));
