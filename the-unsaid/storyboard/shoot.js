const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1400},deviceScaleFactor:0.5});
await p.goto('file://'+path.resolve(__dirname,'frames.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
for(let i=1;i<=18;i++){await p.locator('#s'+i).screenshot({path:path.resolve(__dirname,'img/s'+String(i).padStart(2,'0')+'.jpg'),type:'jpeg',quality:88});}
await b.close()})();
