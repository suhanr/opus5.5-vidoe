"""Build an episode end-to-end and check it.

  python engine/build.py episodes/<slug>            # voice -> audio -> frames -> mp4 -> thumbnail -> QA
  python engine/build.py episodes/<slug> --preview 0 3.5 12 ...   # only render preview frames + sheet

Outputs in episodes/<slug>/final/:
  <slug>.mp4      1080x1920 H.264/AAC, loudness -14 LUFS
  thumbnail.jpg   1080x1920
  qa_sheet.jpg    contact sheet of 12 frames for visual review
  upload.json     everything the uploader needs (absolute file paths + metadata)
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, str(ROOT / "engine"))


def run(cmd):
    print("$", " ".join(str(c) for c in cmd), flush=True)
    subprocess.run([str(c) for c in cmd], check=True, cwd=ROOT)


def node():
    return shutil.which("node") or "node"


def sheet(src_dir, out_path, cols=6):
    from PIL import Image, ImageDraw
    files = sorted(Path(src_dir).glob("f_*.jpg"), key=lambda p: float(p.stem[2:]))
    w, h = 270, 480
    rows = (len(files) + cols - 1) // cols
    im = Image.new("RGB", (cols * w, rows * h), "black")
    for i, f in enumerate(files):
        fr = Image.open(f).resize((w, h))
        ImageDraw.Draw(fr).text((6, 6), f.stem[2:], fill="yellow")
        im.paste(fr, ((i % cols) * w, (i // cols) * h))
    im.save(out_path, quality=88)


def check_meta(meta):
    problems = []
    if len(meta.get("title", "")) > 100:
        problems.append("title > 100 chars")
    if re.search(r"[<>]", meta.get("title", "") + meta.get("description", "")):
        problems.append("YouTube rejects < or > in title/description")
    if len(meta.get("description", "")) > 4900:
        problems.append("description too long")
    tags_len = sum(len(t) + (2 if " " in t else 0) for t in meta.get("tags", [])) + max(0, len(meta.get("tags", [])) - 1)
    if tags_len > 480:
        problems.append(f"tags total {tags_len} chars > 480")
    for k in ("title", "description", "tags", "category", "playlist"):
        if k not in meta:
            problems.append(f"meta.json missing '{k}'")
    return problems


def main():
    ep = Path(sys.argv[1]).resolve()
    slug = ep.name
    out, final = ep / "out", ep / "final"
    final.mkdir(parents=True, exist_ok=True)

    import voice
    tl = voice.main(ep)
    D = tl["duration"]

    if "--preview" in sys.argv:
        ts = sys.argv[sys.argv.index("--preview") + 1:]
        shutil.rmtree(out / "preview", ignore_errors=True)
        run([node(), "engine/render.js", ep, "preview", *ts])
        sheet(out / "preview", out / "preview_sheet.jpg", cols=min(6, len(ts)))
        print("preview sheet:", out / "preview_sheet.jpg")
        return

    import audio
    audio.main(ep)
    run([node(), "engine/render.js", ep, "video", "4"])
    mp4 = final / f"{slug}.mp4"
    run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-framerate", "30", "-i", out / "frames" / "f%05d.jpg",
         "-i", out / "mix.wav", "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p",
         "-profile:v", "high", "-movflags", "+faststart", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", mp4])
    run([node(), "engine/render.js", ep, "thumb"])

    # QA: 12 evenly spaced frames + first/last for the loop
    ts = [0.0] + [round(D * k / 11, 2) for k in range(1, 11)] + [round(D - 0.04, 2)]
    shutil.rmtree(out / "preview", ignore_errors=True)
    run([node(), "engine/render.js", ep, "preview", *map(str, ts)])
    sheet(out / "preview", final / "qa_sheet.jpg")

    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height",
                            "-of", "json", str(mp4)], capture_output=True, text=True, check=True)
    info = json.loads(probe.stdout)
    dur = float(info["format"]["duration"])
    loud = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(mp4), "-af", "ebur128", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", loud)
    lufs = float(m[-1]) if m else None

    meta = json.loads((ep / "meta.json").read_text(encoding="utf-8")) if (ep / "meta.json").exists() else {}
    problems = check_meta(meta)
    if not 28 <= dur <= 45:
        problems.append(f"duration {dur:.1f}s outside 30-40s target")
    if lufs is None or abs(lufs + 14) > 1.5:
        problems.append(f"loudness {lufs} LUFS (target -14)")
    upload = {
        "slug": slug, "video": str(mp4), "thumbnail": str(final / "thumbnail.jpg"),
        "duration": round(dur, 2), "lufs": lufs, **meta, "qa_problems": problems,
    }
    (final / "upload.json").write_text(json.dumps(upload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nBUILT {mp4}  {dur:.1f}s  {lufs} LUFS  {mp4.stat().st_size / 1e6:.1f} MB")
    print("QA sheet:", final / "qa_sheet.jpg")
    print("PROBLEMS:", problems or "none")


if __name__ == "__main__":
    main()
