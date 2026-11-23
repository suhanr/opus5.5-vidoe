import re, subprocess, json, soundfile as sf, numpy as np, scipy.signal as ss
from faster_whisper import WhisperModel
A='assets/voiceover.wav'
out=subprocess.run(f"ffmpeg -hide_banner -i {A} -af silencedetect=n=-38dB:d=0.28 -f null -",shell=True,capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',out)]; en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',out)]
a,sr=sf.read(A,dtype='float32'); D=len(a)/sr
sp=[];prev=0
for s,e in zip(st,en+[D]):
    if s>prev+0.05: sp.append([prev,s])
    prev=e
if prev<D-0.1: sp.append([prev,D])
# merge tiny chunks
m=[]
for c in sp:
    if m and (c[1]-c[0]<0.8 or m[-1][1]-m[-1][0]<0.8) and c[0]-m[-1][1]<0.6: m[-1][1]=c[1]
    else: m.append(c)
print(len(m),'chunks')
model=WhisperModel("large-v3-turbo",device="cpu",compute_type="int8",cpu_threads=4)
res=[]
for s,e in m:
    seg=a[max(0,int((s-0.1)*sr)):int((e+0.1)*sr)]
    seg=ss.resample_poly(seg,2,3).astype(np.float32)
    segs,_=model.transcribe(seg,language="bn",beam_size=5,condition_on_previous_text=False,vad_filter=False)
    txt=' '.join(x.text.strip() for x in segs)
    print(f"{s:7.2f}-{e:7.2f} {txt}",flush=True)
    res.append({'s':s,'e':e,'t':txt})
json.dump(res,open('out/chunks.json','w'),ensure_ascii=False,indent=1)
