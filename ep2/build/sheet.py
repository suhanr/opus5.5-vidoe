import sys, glob
from PIL import Image, ImageDraw
fs = sys.argv[2:]; out = sys.argv[1]
W, H = 360, 450; cols = 6
rows = (len(fs) + cols - 1) // cols
s = Image.new('RGB', (W * cols, H * rows), (0, 0, 0)); d = ImageDraw.Draw(s)
for i, f in enumerate(fs):
    im = Image.open(f).resize((W, H)); s.paste(im, (W * (i % cols), H * (i // cols)))
    d.text((W * (i % cols) + 8, H * (i // cols) + H - 18), f.split('f_')[-1], fill=(255, 255, 0))
s.save(out, quality=85)
