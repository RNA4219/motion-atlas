// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import {createCanvas} from '@napi-rs/canvas';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {catalog} from '../src/catalog.js';import {render} from '../src/renderer.js';import {createState,inputState} from '../src/state.js';import {paletteFor} from '../src/drawing.js';
const root=fileURLToPath(new URL('..',import.meta.url)),reports=path.join(root,'reports');await fs.mkdir(reports,{recursive:true});
const sha=data=>createHash('sha256').update(data).digest('hex'),results=[],failures=[];
const fingerprint=g=>{const {data}=g.getImageData(50,65,540,275);return sha(data);};
for(const category of ['ui','movie','game']){
  const group=catalog.filter(e=>e.category===category);
  for(let page=0;page<Math.ceil(group.length/20);page++){
    const entries=group.slice(page*20,page*20+20),sheet=createCanvas(1280,Math.ceil(entries.length/4)*246),sg=sheet.getContext('2d');sg.fillStyle='#0c111c';sg.fillRect(0,0,sheet.width,sheet.height);
    for(const [i,e] of entries.entries()){
      const c=createCanvas(640,400),g=c.getContext('2d'),state=createState(e);let deterministic=false,changes=false;
      try{
        render(g,e,1.37,state,{preview:true});const first=fingerprint(g);render(g,e,1.37,state,{preview:true});deterministic=first===fingerprint(g);render(g,e,2.81,state,{preview:true});changes=first!==fingerprint(g);
        // 間欠的な演出は複数の位相を確認する。
        if(!changes)for(const time of [.21,.47,.73,3.33,4.18]){render(g,e,time,state,{preview:true});if(first!==fingerprint(g)){changes=true;break;}}
        const color=paletteFor(e).bg.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)),pixels=g.getImageData(50,65,540,275).data;let foreground=0;
        for(let k=0;k<pixels.length;k+=4)if(Math.abs(pixels[k]-color[0])+Math.abs(pixels[k+1]-color[1])+Math.abs(pixels[k+2]-color[2])>40)foreground++;
        if(foreground<150)throw new Error('内容領域に十分な描画がありません');
        if(!deterministic)throw new Error('同一時刻を再描画した結果が一致しません');
        if(e.category!=='ui'&&!changes)throw new Error('経過時刻による描画の変化がありません');
        for(const strength of [0,1.5])render(g,e,2.1,state,{preview:true,strength});
        inputState(state,e,{type:'down',x:.72,y:.7},3);inputState(state,e,{type:'move',x:.76,y:.64},3.1);inputState(state,e,{type:'up',x:.76,y:.64},3.2);render(g,e,3.7,state,{preview:false});
        render(g,e,1.37,createState(e),{preview:true});sg.drawImage(c,i%4*320,Math.floor(i/4)*246,320,200);sg.fillStyle='#edf3fc';sg.font='15px "Segoe UI", sans-serif';sg.fillText(e.title,i%4*320+12,Math.floor(i/4)*246+223);
        results.push({id:e.id,deterministic,changes,foreground_pixels:foreground,interaction_rendered:true});
      }catch(error){failures.push({id:e.id,error:String(error)});}
    }
    await fs.writeFile(path.join(reports,`contact-${category}-${page+1}.png`),sheet.toBuffer('image/png'));
  }
}
const manifest=JSON.parse(await fs.readFile(path.join(root,'dist/manifest.json'),'utf8'));
for(const e of manifest.entries){for(const [file,checksum] of [[e.html,e.html_sha256],[e.zip,e.zip_sha256]])if(sha(await fs.readFile(path.join(root,'dist',file)))!==checksum)failures.push({id:e.id,error:'配布物ハッシュ不一致: '+file});}
const report={checked_at:new Date().toISOString(),entries:catalog.length,rendered:results.length,artifacts_verified:manifest.entries.length*2,results,failures};
await fs.writeFile(path.join(reports,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({rendered:results.length,artifacts_verified:report.artifacts_verified,failures}));if(failures.length)process.exitCode=1;
