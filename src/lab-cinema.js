// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import {TAU,clamp,mix,phase,smooth,hash} from './math.js';
import {rect,circle,text,line,polygon,transform,glow} from './drawing.js';
export const labCinemaKinds=new Set('iris-aperture venetian-blinds checker-reveal diagonal-cascade luminance-reveal halftone-field duotone-morph chromatic-orbit flip-clock typewriter text-scramble text-wave orbit-letters perspective-crawl text-shutters letter-trace mosaic-focus ribbon-weave bokeh-drift moire-interference'.split(' '));
function labScene(g,p,alternate=false){rect(g,0,55,640,290,0,alternate?p.secondary:p.panel);circle(g,alternate?430:190,180,82,alternate?p.bg:p.accent);polygon(g,alternate?190:440,223,88,3,-Math.PI/2,alternate?p.accent:p.bg);}
export function renderLabCinema(g,e,t,s,o,p){
  const a=o.params,q=phase(t,6),u=smooth(q),word=(str,x=320,y=200,size=62,color=p.ink)=>text(g,str,x,y,size,color,'center',800);
  switch(e.kind){
    case 'iris-aperture':
      labScene(g,p);g.save();polygon(g,320,200,u*460,Math.round(a.blades),u*a.twist);g.clip();labScene(g,p,true);g.restore();break;
    case 'venetian-blinds':
      labScene(g,p);g.save();g.beginPath();for(let i=0;i<a.strips;i++){const h=290/a.strips,v=smooth(clamp(q*1.8-i*a.delay));g.rect(0,55+i*h,640,h*v);}g.clip();labScene(g,p,true);g.restore();break;
    case 'checker-reveal':case 'diagonal-cascade':{
      labScene(g,p);const n=Math.round(a.columns),size=640/n;g.save();g.beginPath();for(let y=0;y<Math.ceil(290/size);y++)for(let x=0;x<n;x++){const delay=e.kind==='checker-reveal'?((x+y)%2)*.23:(x+y)*a.delay,v=smooth(clamp(q*2-delay)),d=size*v;g.roundRect(x*size+(size-d)/2,55+y*size+(size-d)/2,d,d,Math.min(a.roundness||0,d/2));}g.clip();labScene(g,p,true);g.restore();break;
    }
    case 'luminance-reveal':{
      labScene(g,p);const n=Math.round(a.cells),size=640/n;for(let y=0;y<Math.ceil(290/size);y++)for(let x=0;x<n;x++){const brightness=.5+.25*Math.sin(x*.4)+.25*Math.cos(y*.7),opacity=clamp((q-brightness)/a.softness+.5);g.save();rect(g,x*size,55+y*size,size+1,size+1);g.clip();g.globalAlpha=opacity;labScene(g,p,true);g.restore();}break;
    }
    case 'halftone-field':
      for(let y=78;y<326;y+=a.spacing)for(let x=58;x<582;x+=a.spacing){const v=clamp(.5+(Math.sin(x*.025+t)+Math.cos(y*.035-t*.6))*.25*a.contrast);circle(g,x,y,Math.sqrt(v)*a.spacing*.45,p.accent);}break;
    case 'duotone-morph':{
      rect(g,70,77,500,250,14,p.secondary);g.save();rect(g,70,77,500,250,14);g.clip();for(let i=0;i<a.bands;i++){const points=Array.from({length:40},(_,j)=>[60+j*14,85+i*250/a.bands+Math.sin(j*.15+t+i*.3)*a.curve]);line(g,points,p.accent,Math.max(3,120/a.bands));}g.restore();break;
    }
    case 'chromatic-orbit':
      g.save();g.globalCompositeOperation='screen';for(let i=0;i<a.orbits;i++){const angle=i/a.orbits*TAU+t*.7;g.lineWidth=15;g.strokeStyle=['#ff4f6e','#4f91ff','#80eb9b'][i%3];g.beginPath();g.ellipse(320+Math.cos(angle)*a.spread,200+Math.sin(angle)*a.spread,115,65,angle,0,TAU);g.stroke();}g.restore();break;
    case 'flip-clock':{
      const n=Math.round(a.digits),raw=t*a.rate,digit=Math.floor(raw),turn=phase(raw),w=72,start=320-n*80/2;for(let i=0;i<n;i++){const x=start+i*80+4,number=Math.floor(digit/10**(n-1-i))%10;rect(g,x,130,w,137,8,p.panel);g.save();rect(g,x,130,w,68);g.clip();word((number+1)%10,x+w/2,200,68,p.accent);g.restore();g.save();rect(g,x,200,w,67);g.clip();word(number,x+w/2,200,68,p.accent);g.restore();transform(g,x+w/2,200,0,1,Math.max(.015,Math.abs(Math.cos(turn*Math.PI))),()=>{rect(g,-w/2,-65,w,130,8,p.panel);word(turn<.5?number:(number+1)%10,0,0,68,p.accent);});line(g,[[x,200],[x+w,200]],p.bg,2);}break;
    }
    case 'typewriter':{
      const message='MAKE ROOM FOR IDEAS',cycle=message.length/a.rate+a.pause,amount=Math.min(message.length,Math.floor(phase(t,cycle)*cycle*a.rate)),shown=message.slice(0,amount);text(g,shown,77,200,37,p.accent,'left',700);if(Math.floor(t*3)%2===0)rect(g,79+amount*23,173,3,49,1,p.ink);break;
    }
    case 'text-scramble':{
      const message='POSSIBILITY',alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',progress=clamp(phase(t,a.duration+1)*(a.duration+1)/a.duration),count=Math.floor(progress*message.length);const value=[...message].map((ch,i)=>i<count?ch:alphabet[Math.floor(hash(i,Math.floor(t*a.rate))*alphabet.length)]).join('');word(value,320,200,45,p.accent);break;
    }
    case 'text-wave':
      [...'KEEP MOVING'].forEach((ch,i)=>{const angle=t*2-i/a.wavelength*TAU;transform(g,111+i*42,200+Math.sin(angle)*a.amplitude,Math.cos(angle)*.13,1,1,()=>word(ch,0,0,41,i%2?p.accent:p.ink));});break;
    case 'orbit-letters':{
      const message=('MOTION / ').repeat(Math.round(a.copies));[...message].forEach((ch,i)=>{const angle=i/message.length*TAU+t*.3;transform(g,320+Math.cos(angle)*a.radius,200+Math.sin(angle)*a.radius,angle+Math.PI/2,1,1,()=>word(ch,0,0,23,p.accent));});break;
    }
    case 'perspective-crawl':
      for(let i=0;i<a.rows;i++){const depth=phase(t*.11+i/a.rows)*a.depth+.55,scale=1/depth;g.save();g.globalAlpha=clamp(1-(depth-.5)/(a.depth+.5));transform(g,320,95+125*scale,0,scale,scale*.8,()=>word(['A NEW CHAPTER','BEGINS WITH','ONE SMALL MOVE'][i%3],0,0,25,p.accent));g.restore();}break;
    case 'text-shutters':
      for(let i=0;i<a.slices;i++){const w=500/a.slices,v=smooth(clamp(q*2-i/a.slices*.5));g.save();rect(g,70+i*w,80,w+1,250);g.clip();word('OPEN MIND',320,200+(1-v)*a.travel*(i%2?1:-1),65,p.accent);g.restore();}break;
    case 'letter-trace':{
      const paths=[[[95,252],[95,147],[137,216],[179,147],[179,252]],[[216,252],[253,147],[290,252]],[[230,215],[277,215]],[[327,147],[327,252]],[[327,201],[402,147]],[[327,201],[405,252]],[[510,147],[444,147],[444,252],[510,252]],[[444,199],[499,199]]];
      const segments=paths.flatMap(path=>path.slice(1).map((point,i)=>[path[i],point])),lengths=segments.map(([v,w])=>Math.hypot(w[0]-v[0],w[1]-v[1])),total=lengths.reduce((v,w)=>v+w,0);let distance=clamp(phase(t,a.duration+1)*(a.duration+1)/a.duration)*total;
      segments.forEach(([v,w],i)=>{const amount=clamp(distance/lengths[i]);if(amount>0)line(g,[v,[mix(v[0],w[0],amount),mix(v[1],w[1],amount)]],p.accent,a.width);distance-=lengths[i];});break;
    }
    case 'mosaic-focus':{
      const n=Math.round(mix(a.minimum,a.maximum,smooth(q))),size=520/n;for(let y=0;y<Math.ceil(245/size);y++)for(let x=0;x<n;x++){const v=.5+.5*Math.sin(x/n*9+Math.cos(y/n*13+t*.3));rect(g,60+x*size,80+y*size,size+.5,size+.5,0,`hsl(${205+v*70} 65% ${25+v*40}%)`);}break;
    }
    case 'ribbon-weave':{
      const bands=Array.from({length:Math.round(a.ribbons)},(_,i)=>({i,depth:Math.sin(t+i)})).sort((v,w)=>v.depth-w.depth);for(const {i} of bands){const points=Array.from({length:65},(_,j)=>[60+j*8,200+Math.sin(j*.085+t+i)*a.amplitude+Math.cos(i)*25]);line(g,points,i%2?p.accent:p.secondary,13);}break;
    }
    case 'bokeh-drift':
      for(let i=0;i<a.count;i++){const x=phase(hash(i,41)+t*(.013+hash(i,2)*.025))*740-50,y=65+hash(i,13)*260,r=a.radius*(.4+hash(i,8));glow(g,x,y,r,i%2?p.accent:p.secondary,.2+hash(i,5)*.35);}break;
    case 'moire-interference':
      g.save();rect(g,70,70,500,265,10);g.clip();for(let layer=0;layer<2;layer++)transform(g,320,200,layer*(a.angle+Math.sin(t*.4)*.05),1,1,()=>{for(let x=-500;x<=500;x+=a.spacing)line(g,[[x,-350],[x,350]],layer?p.accent:p.secondary,1.5);});g.restore();break;
    default:throw new Error(e.kind);
  }
}
