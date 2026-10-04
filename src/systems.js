// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import { TAU, clamp, mix, phase, spring, hash, curlField, hermite, quaternion, slerp, rotate3, fabrik, waveMode } from './math.js';
import { rect, circle, text, line, polygon, grid, glow, label, transform } from './drawing.js';
export const systemKinds = new Set('curl hermite quaternion magic fabrik lightning hitstop outline warp secondorder wave edgeflow follow wavefield'.split(' '));
function following(s,t,damping,omega){
  if(!s.manual){const response=(frequency)=>{const real=omega*omega-frequency*frequency,imaginary=2*damping*omega*frequency;return omega*omega/Math.hypot(real,imaginary)*Math.sin(t*frequency-Math.atan2(imaginary,real));};return[320+response(1)*160,200+response(1.7)*65];}
  let x=320,y=200;
  for(const step of s.trail||[]){const a=spring(Math.max(0,t-step.t),damping,omega);x+=step.dx*640*a;y+=step.dy*400*a;}
  return [x,y];
}
export function renderSystem(g,e,t,s,o,p){
  grid(g,p);label(g,p,e.title.toUpperCase(),'MODEL / '+e.kind.toUpperCase());
  const amp=o.strength,px=s.manual?s.pointer[0]:.5+Math.sin(t*.7)*.3,py=s.manual?s.pointer[1]:.5+Math.cos(t*.9)*.25;
  switch(e.kind){
    case 'curl':
      for(let i=0;i<115;i++){let x=hash(i,6)*6,y=hash(i,88)*4;const pts=[];for(let step=0;step<17;step++){const [dx,dy]=curlField(x,y,t*.2);x+=dx*.036;y+=dy*.036;pts.push([50+x*90,30+y*85]);}g.save();g.globalAlpha=.3+hash(i,11)*.6;line(g,pts,i%5?p.secondary:p.accent,1.5);g.restore();circle(g,...pts.at(-1),1.8,p.ink);}break;
    case 'hermite':{
      const a=[85,265],b=[560,130],m0=[440,-360*amp*(o.params.tangent??1)],m1=[230,360*amp*(o.params.tangent??1)],pts=Array.from({length:91},(_,i)=>hermite(a,b,m0,m1,i/90));
      line(g,pts,p.line,2);line(g,[a,[a[0]+m0[0]*.2,a[1]+m0[1]*.2]],p.secondary,2);line(g,[b,[b[0]-m1[0]*.2,b[1]-m1[1]*.2]],p.secondary,2);
      for(let i=0;i<22;i++)circle(g,...hermite(a,b,m0,m1,phase(t*.17-i*.035)),i%4===0?6:3,p.accent);break;
    }
    case 'quaternion':{
      const qa=quaternion([1,.3,.2],.3),qb=quaternion([.3,1,.5],Math.PI*1.55),q=slerp(qa,qb,.5-.5*Math.cos(t*.7));
      const cube=Array.from({length:8},(_,i)=>rotate3([(i&1?1:-1)*85,(i&2?1:-1)*85,(i&4?1:-1)*85],q));
      const project=v=>[320+v[0]*420/(420+v[2]),200+v[1]*420/(420+v[2])];
      for(let i=0;i<8;i++)for(let bit=1;bit<=4;bit*=2)if(!(i&bit))line(g,[project(cube[i]),project(cube[i|bit])],bit===1?p.accent:p.secondary,3);
      cube.forEach(v=>circle(g,...project(v),4,p.ink));break;
    }
    case 'magic':
      for(let i=0;i<4;i++){g.lineWidth=i%2?1:2;circle(g,320,200,45+i*25,null,i%2?p.secondary:p.accent);polygon(g,320,200,43+i*25,i%2?6:3,t*(i%2?-.3:.17),null,p.accent);}
      for(let i=0;i<24;i++){const a=i*TAU/24+t*.1;line(g,[[320+Math.cos(a)*137,200+Math.sin(a)*137],[320+Math.cos(a)*145,200+Math.sin(a)*145]],p.secondary,2);}break;
    case 'fabrik':{
      const root=[125,282],lengths=[70,63,57,48,42],initial=[root,[179,237],[234,206],[285,180],[325,153],[365,137]],target=[px*640,py*400],joints=fabrik(initial,lengths,target,22);
      line(g,joints,p.accent,9);joints.forEach((pt,i)=>circle(g,...pt,i?8:13,p.bg,p.ink));circle(g,...target,13,null,p.secondary);line(g,[[target[0]-20,target[1]],[target[0]+20,target[1]]],p.secondary,1);break;
    }
    case 'lightning':{
      const frame=Math.floor(t*10),points=[[130,80],[510,315]];
      for(let level=0;level<5;level++)for(let i=points.length-2;i>=0;i--){const a=points[i],b=points[i+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]),offset=(hash(i+level*97,frame)-.5)*length*.7*amp;points.splice(i+1,0,[(a[0]+b[0])/2-(b[1]-a[1])/length*offset,(a[1]+b[1])/2+(b[0]-a[0])/length*offset]);}
      g.save();g.shadowBlur=15;g.shadowColor=p.secondary;line(g,points,p.secondary,5);line(g,points,p.ink,1.8);for(let i=4;i<points.length;i+=7){const a=points[i];line(g,[a,[a[0]-42,a[1]+30],[a[0]-63,a[1]+68]],p.accent,1);}g.restore();break;
    }
    case 'hitstop':{
      const q=phase(t+s.count*.5,3)*3,impact=q>=1&&q<1.18,local=q<1?q:impact?1:q-.18,shake=q>1.18?Math.sin((q-1.18)*85)*Math.exp(-(q-1.18)*8)*9*amp:0;
      transform(g,shake,0,0,1,1,()=>{rect(g,405,128,65,144,10,p.secondary);const x=local<1?110+270*local:380-(local-1)*110;circle(g,x,200,24,p.accent);if(q>=1&&q<1.5)for(let i=0;i<10;i++){const a=i*TAU/10,r=(q-1)*160;line(g,[[400+Math.cos(a)*r,200+Math.sin(a)*r],[400+Math.cos(a)*(r+15),200+Math.sin(a)*(r+15)]],p.ink,2);}});text(g,impact?'HOLD':q<1?'APPROACH':'RELEASE',320,332,18,p.muted,'center');break;
    }
    case 'outline':
      for(let i=0;i<9;i++)rect(g,i*80-30+Math.sin(t)*20,0,40,400,0,i%2?p.panel:p.secondary);g.font='900 125px "Segoe UI", Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.strokeStyle=p.bg;g.lineWidth=22;g.strokeText('PLAY',320,206);g.strokeStyle=p.ink;g.lineWidth=10;g.strokeText('PLAY',320,206);g.fillStyle=p.accent;g.fillText('PLAY',320,206);break;
    case 'warp':
      for(let i=0;i<180;i++){const z=phase(hash(i,3)-t*.17)*6+.3,x=(hash(i,8)-.5)*470,y=(hash(i,11)-.5)*340,scale=1.6/z,near=1.6/(z+.18*amp);line(g,[[320+x*near,200+y*near],[320+x*scale,200+y*scale]],i%7?p.line:p.accent,1+scale*.4);}break;
    case 'secondorder': case 'follow':{
      const rows=e.kind==='follow'?[.3,.75,1.1]:[o.params.damping??.55];
      rows.forEach((d,i)=>{let [x,y]=following(s,t-(s.manual?0:i*.25),d,o.params.frequency??7);if(rows.length>1)y=115+i*87;line(g,[[80,y],[560,y]],p.line,1);circle(g,x,y,18,[p.accent,p.secondary,p.ink][i]);if(rows.length>1)text(g,'ζ '+d,59,y,14,p.muted,'center');});circle(g,px*640,py*400,11,null,p.secondary);break;
    }
    case 'wave':
      line(g,[[65,200],[575,200]],p.line,2);for(let mode=0;mode<3;mode++){const pts=Array.from({length:151},(_,i)=>[65+i/150*510,200+waveMode(i/150,t+mode*.6,[1,.35*amp,.18*amp])*53]);g.save();g.globalAlpha=mode===0?1:.25;line(g,pts,mode?p.secondary:p.accent,mode?1:3);g.restore();}circle(g,65,200,7,p.ink);circle(g,575,200,7,p.ink);break;
    case 'edgeflow':{
      rect(g,124,87,392,226,42,null,p.line);const radius=42,left=124,right=516,top=87,bottom=313,h=right-left-2*radius,v=bottom-top-2*radius,arc=Math.PI/2*radius,perimeter=2*h+2*v+4*arc;
      const point=(dist)=>{const lengths=[h,arc,v,arc,h,arc,v,arc];let part=0;while(dist>lengths[part]&&part<7)dist-=lengths[part++];if(part===0)return[left+radius+dist,top];if(part===2)return[right,top+radius+dist];if(part===4)return[right-radius-dist,bottom];if(part===6)return[left,bottom-radius-dist];const centers=[[right-radius,top+radius],[right-radius,bottom-radius],[left+radius,bottom-radius],[left+radius,top+radius]],i=(part-1)/2,a=-Math.PI/2+i*Math.PI/2+dist/radius;return[centers[i][0]+Math.cos(a)*radius,centers[i][1]+Math.sin(a)*radius];};
      for(let i=0;i<38;i++){const q=phase(t*.1+i/38);circle(g,...point(q*perimeter),i%5?3:6,i%5?p.secondary:p.accent);}break;
    }
    case 'wavefield':{
      const sources=[[225,190],[415,210]],freq=o.params.wavelength??.066;for(let y=70;y<=330;y+=13)for(let x=73;x<=567;x+=13){const value=sources.reduce((sum,[a,b])=>sum+Math.sin(Math.hypot(x-a,y-b)*freq-t*2),0)/2;g.save();g.globalAlpha=.15+Math.abs(value)*.85;circle(g,x,y,2+Math.abs(value)*2*amp,value>0?p.accent:p.secondary);g.restore();}sources.forEach(pt=>circle(g,...pt,9,p.ink));break;
    }
    default:throw new Error('Unknown system: '+e.kind);
  }
}
