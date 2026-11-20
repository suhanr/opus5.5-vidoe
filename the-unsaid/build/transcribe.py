import json, sys
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[2] if len(sys.argv)>2 else "large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
import soundfile as sf, numpy as np, scipy.signal as ss
a,sr=sf.read(sys.argv[1],dtype="float32"); a=ss.resample_poly(a,2,3).astype(np.float32)
segs, info = m.transcribe(a, language="bn", word_timestamps=True, vad_filter=False, beam_size=5)
out=[]
for s in segs:
    print(f"{s.start:7.2f} {s.end:7.2f} {s.text}", flush=True)
    out.append({"s":s.start,"e":s.end,"text":s.text,"words":[{"w":w.word,"s":w.start,"e":w.end} for w in s.words]})
json.dump(out, open("out/whisper.json","w"), ensure_ascii=False, indent=1)
print("DONE")
