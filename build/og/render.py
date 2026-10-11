import os
# 產生社群預覽圖（og.png 1200×630）與手機主畫面圖示（apple-touch-icon.png 180×180）
import sys
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
out=sys.argv[1]; host=sys.argv[2] if len(sys.argv)>2 else ''
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1200,'height':630})
    pg.goto('file://'+HERE+'/og.html#'+host); pg.wait_for_timeout(400)
    pg.screenshot(path=out+'/og.png')
    pg=b.new_page(viewport={'width':180,'height':180})
    pg.set_content('<body style="margin:0;background:#fbfcfa"><svg width="180" height="180" viewBox="0 0 40 40"><rect width="40" height="40" fill="#fbfcfa"/><rect x="6" y="6" width="28" height="28" rx="3.2" fill="none" stroke="#c0302b" stroke-width="2"/><text x="20" y="26.2" text-anchor="middle" font-family="Noto Serif CJK TC" font-weight="900" font-size="16" fill="#c0302b">審</text></svg></body>')
    pg.wait_for_timeout(200); pg.screenshot(path=out+'/apple-touch-icon.png')
    b.close()
