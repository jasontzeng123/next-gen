// 把 demo.json 裡的示範資料送進 Supabase（GitHub Actions 自動執行）
// 每筆的代號固定（demo 開頭），重跑不會重複；每次用隨機密語，所以示範資料無法被別人改動
const fs = require('fs'), crypto = require('crypto');
const URL_ = (process.env.SB_URL || '').replace(/\/+$/, ''), KEY = process.env.SB_KEY;
const docs = JSON.parse(fs.readFileSync(__dirname + '/demo.json', 'utf8'));
(async () => {
  let added = 0, skipped = 0;
  for (const d of docs) {
    const id = d._seedId, data = Object.assign({}, d);
    delete data._seedId;
    const r = await fetch(URL_ + '/rest/v1/rpc/submit_choice', {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_id: id, p_secret: crypto.randomBytes(24).toString('hex'), p_data: data })
    });
    const t = (await r.text()).trim();
    if (!r.ok) { console.error('失敗', id, r.status, t); process.exitCode = 1; continue; }
    if (t === 'true') added++; else skipped++;
  }
  console.log('新增 ' + added + ' 筆示範資料；已經存在而略過 ' + skipped + ' 筆');
})();
