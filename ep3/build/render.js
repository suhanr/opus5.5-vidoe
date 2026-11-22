// node build/render.js preview t1 t2 ...  -> out/preview/f_<t>.jpg
// node build/render.js video [workers]     -> out/frames/f%05d.jpg ; also writes out/cues.json
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'web', 'index.html');
async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 30000 });
  return page;
}
const grab = async (page, t, q = 92) => { await page.evaluate(t => window.renderFrame(t), t); return page.screenshot({ type: 'jpeg', quality: q, clip: { x: 0, y: 0, width: 1080, height: 1350 } }); };
(async () => {
  const mode = process.argv[2] || 'preview';
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync'] });
  const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'out', 'timeline.json')));
  if (mode === 'cues') {
    const page = await openPage(browser);
    const c = await page.evaluate(() => ({ cues: window.CUES, sections: window.SECTIONS, freeze: window.FREEZE }));
    fs.writeFileSync(path.join(ROOT, 'out', 'cues.json'), JSON.stringify(c, null, 1)); console.log(c.cues.length, 'cues');
  } else if (mode === 'preview') {
    const dir = path.join(ROOT, 'out', 'preview'); fs.mkdirSync(dir, { recursive: true });
    const page = await openPage(browser);
    for (const ts of process.argv.slice(3)) fs.writeFileSync(path.join(dir, `f_${ts}.jpg`), await grab(page, parseFloat(ts), 85));
  } else {
    const fps = tl.fps, total = Math.round(tl.dur * fps);
    const workers = parseInt(process.argv[3] || '4');
    const from = parseInt(process.argv[4] || '0');
    const dir = path.join(ROOT, 'out', 'frames'); fs.mkdirSync(dir, { recursive: true });
    const t0 = Date.now(); let done = 0;
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const page = await openPage(browser);
      for (let f = from + w; f < total; f += workers) {
        fs.writeFileSync(path.join(dir, `f${String(f).padStart(5, '0')}.jpg`), await grab(page, f / fps));
        if (++done % 300 === 0) console.log(`${done}/${total - from} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }));
    console.log('frames done', total);
  }
  await browser.close();
})();
