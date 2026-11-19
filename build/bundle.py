"""Bundle the renderer, fonts and audio into ONE self-contained HTML player.

Output: The_Last_Time.html  (open in any browser; tap to play, loops seamlessly)
"""
import base64
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
b64 = lambda p: base64.b64encode(Path(p).read_bytes()).decode()

audio = ROOT / "out" / "mix_player.m4a"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(ROOT / "out" / "mix.wav"),
                "-af", "loudnorm=I=-14:TP=-1.5", "-c:a", "aac", "-b:a", "128k", str(audio)], check=True)

fonts = {
    "Fraunces": ("font/ttf", ROOT / "assets/fonts/Fraunces.ttf", "100 900"),
    "Caveat": ("font/ttf", ROOT / "assets/fonts/Caveat.ttf", "400 700"),
    "InterX": ("font/otf", ROOT / "assets/fonts/Inter-ExtraBold.otf", "800"),
    "InterS": ("font/otf", ROOT / "assets/fonts/Inter-SemiBold.otf", "600"),
}
font_css = "\n".join(
    f'@font-face{{font-family:"{n}";src:url(data:{m};base64,{b64(p)});font-weight:{w};}}'
    for n, (m, p, w) in fonts.items())

timeline = (ROOT / "web" / "timeline.js").read_text()
scenes = (ROOT / "web" / "scenes.js").read_text()

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Last Time</title>
<style>
{font_css}
:root{{--bg:#05060c;--fg:#F7EDE1;--accent:#FFB65C}}
html,body{{margin:0;height:100%;background:var(--bg);color:var(--fg);font-family:InterS,system-ui,sans-serif}}
body{{display:flex;align-items:center;justify-content:center;overflow:hidden}}
#stage{{position:relative;height:min(100vh,calc(100vw*16/9));aspect-ratio:9/16}}
canvas{{width:100%;height:100%;display:block;border-radius:12px}}
#ui{{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;padding-bottom:16%;box-sizing:border-box;cursor:pointer}}
#play{{background:rgba(0,0,0,.55);border:2px solid var(--accent);color:var(--fg);font-size:18px;
      padding:14px 26px;border-radius:999px;font-family:InterS,sans-serif}}
#bar{{position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(255,255,255,.12)}}
#bar i{{display:block;height:100%;width:0;background:var(--accent)}}
</style></head>
<body><div id="stage"><canvas id="c" width="1080" height="1920"></canvas>
<div id="ui"><button id="play" type="button">&#9654; Play with sound</button></div><div id="bar"><i></i></div></div>
<audio id="a" src="data:audio/mp4;base64,{b64(audio)}" preload="auto"></audio>
<script>{timeline}</script>
<script>{scenes}</script>
<script>
(() => {{
  const a = document.getElementById('a'), ui = document.getElementById('ui'), btn = document.getElementById('play');
  const bar = document.querySelector('#bar i'), D = TIMELINE.duration;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let playing = false;
  const poster = () => window.seek(reduce ? 41.8 : 1.6);   // a readable still frame
  const tick = () => {{
    if (!playing) return;
    const t = a.currentTime; window.seek(t); bar.style.width = (100 * t / D) + '%';
    requestAnimationFrame(tick);
  }};
  a.addEventListener('ended', () => {{ a.currentTime = 0; a.play(); }});   // seamless loop
  ui.addEventListener('click', () => {{
    if (playing) {{ a.pause(); playing = false; btn.style.display = ''; btn.textContent = '\\u25B6 Resume'; return; }}
    a.play(); playing = true; btn.style.display = 'none'; requestAnimationFrame(tick);
  }});
  const ready = () => window.READY ? poster() : setTimeout(ready, 50);
  ready();
}})();
</script></body></html>
"""
out = ROOT / "The_Last_Time.html"
out.write_text(html)
print("wrote", out, round(out.stat().st_size / 1e6, 2), "MB")
