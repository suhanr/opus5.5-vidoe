// Render web/index.html frame-by-frame with headless Chromium and pipe to ffmpeg.
// Usage:
//   node build/render.js preview 1.0 5.2 ...   -> out/preview/f_<t>.jpg
//   node build/render.js video [workers]       -> out/video_silent.mp4
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'web', 'index.html');

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 30000 });
  return page;
}

async function grab(page, t) {
  await page.evaluate(t => window.renderFrame(t), t);
  return page.screenshot({ type: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
}

(async () => {
  const mode = process.argv[2] || 'preview';
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync'] });
  const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'out', 'timeline.json')));
  if (mode === 'preview') {
    const dir = path.join(ROOT, 'out', 'preview'); fs.mkdirSync(dir, { recursive: true });
    const page = await openPage(browser);
    for (const ts of process.argv.slice(3)) {
      const buf = await grab(page, parseFloat(ts));
      fs.writeFileSync(path.join(dir, `f_${ts}.jpg`), buf);
    }
  } else {
    const fps = tl.fps, total = Math.round(tl.duration * fps);
    const workers = parseInt(process.argv[3] || '4');
    const dir = path.join(ROOT, 'out', 'frames'); fs.mkdirSync(dir, { recursive: true });
    const t0 = Date.now();
    let done = 0;
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const page = await openPage(browser);
      for (let f = w; f < total; f += workers) {
        const buf = await grab(page, f / fps);
        fs.writeFileSync(path.join(dir, `f${String(f).padStart(5, '0')}.jpg`), buf);
        if (++done % 100 === 0) console.log(`${done}/${total} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }));
    console.log('frames done', total);
  }
  await browser.close();
})();
