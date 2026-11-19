import sys
from pathlib import Path
from PIL import Image, ImageDraw
files = sorted(Path(sys.argv[1]).glob('f_*.jpg'), key=lambda p: float(p.stem[2:]))
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 5
w, h = 324, 576
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * h), 'black')
for i, f in enumerate(files):
    im = Image.open(f).resize((w, h))
    ImageDraw.Draw(im).text((8, 8), f.stem[2:], fill='yellow')
    sheet.paste(im, ((i % cols) * w, (i // cols) * h))
sheet.save(sys.argv[2], quality=88)
