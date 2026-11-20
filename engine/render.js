// Render an episode frame-by-frame in headless Chromium.
//   node engine/render.js episodes/<slug> preview 1.0 5.2 ...  -> <ep>/out/preview/f_<t>.jpg
//   node engine/render.js episodes/<slug> video [workers]      -> <ep>/out/frames/f00000.jpg ...
//   node engine/render.js episodes/<slug> thumb                -> <ep>/final/thumbnail.jpg
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');

async function openPage(browser, ep) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  const url = pathToFileURL(path.join(ROOT, 'engine', 'player.html')).href + '?ep=' + encodeURIComponent(ep);
  await page.goto(url);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
  return page;
}
async function grab(page, fn, arg) {
  await page.evaluate(([fn, arg]) => window[fn](arg), [fn, arg]);
  return page.screenshot({ type: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
}

(async () => {
  const epArg = process.argv[2];
  const mode = process.argv[3] || 'preview';
  const epDir = path.resolve(epArg);
  const ep = path.relative(ROOT, epDir).split(path.sep).join('/');
  const tl = JSON.parse(fs.readFileSync(path.join(epDir, 'out', 'timeline.json')));
  const opts = {};
  if (process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(opts);
  if (mode === 'preview') {
    const dir = path.join(epDir, 'out', 'preview'); fs.mkdirSync(dir, { recursive: true });
    const page = await openPage(browser, ep);
    for (const ts of process.argv.slice(4)) fs.writeFileSync(path.join(dir, `f_${ts}.jpg`), await grab(page, 'renderFrame', parseFloat(ts)));
  } else if (mode === 'thumb') {
    const dir = path.join(epDir, 'final'); fs.mkdirSync(dir, { recursive: true });
    const page = await openPage(browser, ep);
    fs.writeFileSync(path.join(dir, 'thumbnail.jpg'), await grab(page, 'renderThumbnail', 0));
  } else {
    const fps = tl.fps, total = Math.round(tl.duration * fps);
    const workers = parseInt(process.argv[4] || '4');
    const dir = path.join(epDir, 'out', 'frames');
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const t0 = Date.now(); let done = 0;
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const page = await openPage(browser, ep);
      for (let f = w; f < total; f += workers) {
        fs.writeFileSync(path.join(dir, `f${String(f).padStart(5, '0')}.jpg`), await grab(page, 'renderFrame', f / fps));
        if (++done % 200 === 0) console.log(`${done}/${total} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }));
    console.log('frames done', total);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
