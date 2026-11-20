"""Daily bookkeeping for the Shorts pipeline (Asia/Dhaka time).

  python engine/daily.py status            -> JSON: what this run should do (stop / build / upload)
  python engine/daily.py history           -> recent topics, styles, presets, voices (to avoid repeats)
  python engine/daily.py built <slug>      -> record that today's episode is built (not yet uploaded)
  python engine/daily.py uploaded <slug> <url>
  python engine/daily.py failed <slug> "<reason>"
"""
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
LOG = ROOT / "uploads" / "log.json"
TZ = ZoneInfo("Asia/Dhaka")
UPLOAD_HOUR = 9

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def load():
    return json.loads(LOG.read_text(encoding="utf-8")) if LOG.exists() else {"episodes": []}


def save(d):
    LOG.parent.mkdir(parents=True, exist_ok=True)
    LOG.write_text(json.dumps(d, indent=2, ensure_ascii=False), encoding="utf-8")


def now():
    return datetime.now(TZ)


def entry(d, slug):
    for e in d["episodes"]:
        if e["slug"] == slug:
            return e
    e = {"slug": slug}
    d["episodes"].append(e)
    return e


def meta_of(slug):
    ep = ROOT / "episodes" / slug
    out = {}
    for f in ("script.json", "meta.json"):
        p = ep / f
        if p.exists():
            out.update(json.loads(p.read_text(encoding="utf-8")))
    return out


def status():
    d, n = load(), now()
    today = n.strftime("%Y-%m-%d")
    uploaded = [e for e in d["episodes"] if e.get("status") == "uploaded" and str(e.get("uploaded_at", "")).startswith(today)]
    # a short built recently but never uploaded (computer switched off mid-run, upload failed...) goes first
    recent = {(n.date() - timedelta(days=k)).isoformat() for k in range(4)}
    pending = [e for e in reversed(d["episodes"]) if e.get("date") in recent and e.get("status") in ("built", "failed")]
    if uploaded:
        action, why = "stop", f"today's short is already live: {uploaded[0].get('url')}"
    elif n.hour < UPLOAD_HOUR:
        action, why = "stop", f"it is {n:%H:%M} in Dhaka; uploads start at {UPLOAD_HOUR:02d}:00"
    elif pending:
        action, why = "upload", f"episode {pending[0]['slug']} is built but not uploaded yet: upload it (no new build today)"
    else:
        action, why = "build", "no short yet today: build one, then upload it"
    print(json.dumps({"dhaka_time": n.strftime("%Y-%m-%d %H:%M"), "today": today, "action": action, "why": why,
                      "slug_prefix": today, "pending": pending[0] if pending else None}, indent=2, ensure_ascii=False))


def history(k=30):
    d = load()
    rows = d["episodes"][-k:]
    print(json.dumps([{key: e.get(key) for key in
                       ("date", "slug", "topic", "topic_category", "style", "preset", "voices", "status", "url")}
                      for e in rows], indent=1, ensure_ascii=False))


def record(slug, status_, url=None, reason=None):
    d = load()
    e = entry(d, slug)
    m = meta_of(slug)
    e.update({
        "date": e.get("date") or now().strftime("%Y-%m-%d"),
        "topic": m.get("topic", m.get("title")), "topic_category": m.get("topic_category"),
        "style": m.get("style"), "preset": m.get("music", {}).get("preset"),
        "voices": sorted({v.get("voice") for v in m.get("voices", {}).values()}),
        "title": m.get("title"), "status": status_, f"{status_}_at": now().strftime("%Y-%m-%d %H:%M"),
    })
    if url:
        e["url"] = url
    if reason:
        e["last_error"] = reason
    save(d)
    print(json.dumps(e, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    if cmd == "status":
        status()
    elif cmd == "history":
        history()
    elif cmd == "built":
        record(sys.argv[2], "built")
    elif cmd == "uploaded":
        record(sys.argv[2], "uploaded", url=sys.argv[3])
    elif cmd == "failed":
        record(sys.argv[2], "failed", reason=sys.argv[3] if len(sys.argv) > 3 else None)
    else:
        sys.exit(__doc__)
