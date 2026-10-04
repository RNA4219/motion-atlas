// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import { TAU, clamp, mix, phase, smooth, spring, easings, hash } from './math.js';
import { rect, circle, text, line, polygon, grid, glow, label, transform } from './drawing.js';
import { sampleState } from './state.js';
export const motionKinds = new Set('ripple container morph stagger elevation livetiles turnstile dots tilt reveal acrylic spring dock island breathe genie glass squash anticipation easing overlap masking common seek shot beat'.split(' '));
export function renderMotion(g,e,t,s,o,p) {
  const {v,px,py}=sampleState(s,t,o.strength,o.preview),z=clamp(v),amp=o.strength;
  grid(g,p); label(g,p,e.title.toUpperCase(),'TIME / '+t.toFixed(2));
  const title=(str,x=320,y=200,size=28)=>text(g,str,x,y,size,p.ink,'center',600);
  switch(e.kind){
    case 'ripple': {
      rect(g,95,86,450,244,24,p.panel);g.save();g.clip();
      const events=s.events.length?s.events:[{x:.36,y:.43,t:t-phase(t,2.6)*2.6},{x:.66,y:.6,t:t-phase(t+1,3.2)*3.2}];
      for(const ev of events){const age=t-ev.t;if(age<0||age>2)continue;g.globalAlpha=(1-age/2)*.45;circle(g,ev.x*640,ev.y*400,age*(o.params.spread??200),p.accent);}
      g.restore();title('MAKE A MARK',320,201,25);break;
    }
    case 'container': {
      const x=mix(82,65,z),y=mix(132,77,z),w=mix(200,510,z),h=mix(152,260,z);
      rect(g,x,y,w,h,mix(32,12,z),p.panel);rect(g,x+19,y+19,w-38,mix(72,118,z),14,p.accent);text(g,z>.5?'Inside the collection':'Collection',x+24,y+h-30,22,p.ink);if(z>.7){rect(g,x+24,y+172,w*.6,8,4,p.line);rect(g,x+24,y+193,w*.8,8,4,p.line);}break;
    }
    case 'morph': {
      const u=s.manual?s.selected+z:phase(t,7)*3,a=Math.floor(u),f=smooth(phase(u));
      const radius=(angle,k)=>k%3===0?95:k%3===1?85+23*Math.cos(angle*5):90/(Math.abs(Math.cos(angle))**5+Math.abs(Math.sin(angle))**5)**.2;
      g.beginPath();for(let i=0;i<=144;i++){const ang=i*TAU/144,r=mix(radius(ang,a),radius(ang,a+1),f);const x=320+Math.cos(ang)*r,y=200+Math.sin(ang)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fillStyle=p.accent;g.fill();break;
    }
    case 'stagger':
      for(let y=0;y<4;y++)for(let x=0;x<7;x++){const d=Math.hypot(x-px*6,y-py*3),u=s.manual?Math.max(0,t-s.at-d*.12):phase(t-d*.12,3)*3,q=spring(u,.55,11),size=36+14*Math.sin(q*Math.PI)*amp;rect(g,134+x*57-size/2,112+y*57-size/2,size,size,10,u<.8?p.accent:p.panel);}break;
    case 'elevation':
      for(let i=0;i<4;i++){const lift=(i+1)*8*(.6+.4*Math.sin(t*1.3))*amp;g.save();g.shadowColor='#00000080';g.shadowBlur=lift*1.8;g.shadowOffsetY=lift;rect(g,67+i*137,151-lift,106,117,16,p.panel);g.restore();text(g,'0'+(i+1),120+i*137,205-lift,27,p.accent,'center');}break;
    case 'livetiles':
      for(let i=0;i<6;i++){const turn=Math.cos(t*1.5-i*.6);transform(g,174+i%3*146,130+Math.floor(i/3)*137,0,Math.max(.02,Math.abs(turn)),1,()=>{rect(g,-62,-55,124,110,12,turn>0?p.accent:p.secondary);text(g,turn>0?String(i+1):['SUN','MON','TUE','WED','THU','FRI'][i],0,0,26,p.bg,'center');});}break;
    case 'turnstile':{
      const a=s.manual?z*Math.PI:phase(t,4)*TAU;transform(g,320,200,0,Math.max(.025,Math.abs(Math.cos(a))),1,()=>{rect(g,-175,-112,350,224,14,Math.cos(a)>0?p.accent:p.secondary);text(g,Math.cos(a)>0?'STUDIO':'COLLECTION',0,0,35,p.bg,'center',700);});break;
    }
    case 'dots':
      line(g,[[70,204],[570,204]],p.line,2);for(let i=0;i<7;i++){const q=phase(t-i*.095,2.6),x=mix(70,570,smooth(q));circle(g,x,204,5+(1-Math.abs(q-.5)*2)*3,p.accent);}break;
    case 'tilt':
      transform(g,320+(px-.5)*25*amp,200+(py-.5)*20*amp,(px-.5)*.17*amp,1-Math.abs(px-.5)*.15,1-Math.abs(py-.5)*.2,()=>{rect(g,-173,-107,346,214,22,p.panel,p.line);circle(g,-101,-35,26,p.accent);text(g,'MOVE AROUND',-131,40,27,p.ink);line(g,[[-132,72],[85,72]],p.line,8);});break;
    case 'reveal':
      for(let y=0;y<3;y++)for(let x=0;x<5;x++){const cx=156+x*82,cy=115+y*82;rect(g,cx-34,cy-34,68,68,11,p.panel);const alpha=clamp(1-Math.hypot(cx-px*640,cy-py*400)/180);g.save();g.globalAlpha=alpha;rect(g,cx-34,cy-34,68,68,11,null,p.accent);circle(g,cx,cy,4,p.accent);g.restore();}break;
    case 'acrylic':
      for(let i=0;i<7;i++)circle(g,130+i*66,200+Math.sin(t+i)*80,65,[p.accent,p.secondary,p.line][i%3]);g.save();rect(g,150,95,340,214,28,p.bg);g.clip();g.filter='blur(16px)';for(let i=0;i<7;i++)circle(g,130+i*66,200+Math.sin(t+i)*80,65,[p.accent,p.secondary,p.line][i%3]);g.restore();rect(g,150,95,340,214,28,'#d0e3ff22','#d0e3ff77');title('FROST',320,200,42);break;
    case 'spring':{
      const clock=phase(t,4)*4,target=clock<2?500:140,time=clock%2;
      [.35,o.params.damping??.75,1].forEach((d,i)=>{line(g,[[120,117+i*83],[520,117+i*83]],p.line,2);const x=mix(target===500?140:500,target,spring(time,d,o.params.frequency??7));circle(g,x,117+i*83,14,[p.accent,p.secondary,p.ink][i]);text(g,'ζ '+d,80,117+i*83,15,p.muted,'center');});break;
    }
    case 'dock':
      rect(g,94,219,452,72,25,p.panel);for(let i=0;i<6;i++){const x=137+i*73,d=Math.abs(x-px*640)/(o.params.reach??130),k=1+Math.exp(-d*d*2)*.65*amp;rect(g,x-25*k,238-25*k,50*k,50*k,12,[p.accent,p.secondary,p.line][i%3]);text(g,String.fromCharCode(65+i),x,238,20*k,p.bg,'center');}break;
    case 'island':
      rect(g,144,70,352,267,32,p.panel);rect(g,320-mix(57,142,z),95,mix(114,284,z),mix(35,114,z),mix(18,29,z),p.bg);circle(g,320-mix(30,107,z),113+32*z,8+13*z,p.accent);g.save();g.globalAlpha=z;text(g,'PLAYING',271,141,13,p.muted);text(g,'New ideas',271,172,21,p.ink);g.restore();for(let i=0;i<3;i++)rect(g,173,245+i*22,160+i*20,7,4,p.line);break;
    case 'breathe':
      for(let i=0;i<7;i++){const a=i*TAU/7,r=(35+25*Math.sin(t*.7))*amp;g.save();g.globalAlpha=.24;circle(g,320+Math.cos(a+t*.2)*r,200+Math.sin(a+t*.2)*r,61,p.accent);g.restore();}title(Math.sin(t*.7)>0?'EXPAND':'RELEASE',320,336,15);break;
    case 'genie':{
      const u=.5-.5*Math.cos(t*.9),dest=[490,318];for(let i=0;i<32;i++){const y0=87+i*6,q=clamp(u*1.5-i/64),center=mix(285,dest[0],smooth(q)),width=mix(260,12,smooth(q));rect(g,center-width/2,mix(y0,dest[1],q),width,7,0,i%4<2?p.accent:p.secondary);}circle(g,...dest,13,p.panel,p.accent);break;
    }
    case 'glass':{
      for(let i=0;i<14;i++)rect(g,40+i*44,75,20,250,0,i%2?p.secondary:p.accent);
      const cx=clamp(px*640,120,520),cy=clamp(py*400,125,275);g.save();circle(g,cx,cy,86);g.clip();rect(g,cx-86,cy-86,172,172,0,p.bg);for(let i=0;i<14;i++)rect(g,cx+(40+i*44-cx)*1.25-8,55,25,290,0,i%2?p.secondary:p.accent);g.restore();g.lineWidth=3;circle(g,cx,cy,86,'#dcecff11','#ffffff77');glow(g,cx-32,cy-38,45,'#ffffff',.25);break;
    }
    case 'squash':{
      const u=phase(t,1.8),height=Math.abs(Math.sin(u*Math.PI)),contact=Math.exp(-height*14),sx=1+contact*.55*amp,sy=1/sx;
      g.save();g.globalAlpha=.2+contact*.25;ellipse(g,320,310,45-15*height,8,p.accent);g.restore();transform(g,320,280-height*178,0,sx,sy,()=>circle(g,0,0,30,p.accent));line(g,[[130,312],[510,312]],p.line,2);break;
    }
    case 'anticipation':{
      const u=phase(t,3),x=u<.2?mix(160,120,smooth(u/.2)):u<.6?mix(120,480,smooth((u-.2)/.4)):mix(480,160,smooth((u-.6)/.4));line(g,[[130,247],[520,247]],p.line,2);rect(g,x-26,190,52,52,12,p.accent);title(u<.2?'PREPARE':u<.6?'MOVE':'RETURN',320,111,19);break;
    }
    case 'easing':
      Object.entries(easings).forEach(([name,fn],i)=>{const y=84+i*39,x=phase(t,3);line(g,[[193,y],[542,y]],p.line,1);text(g,name,71,y,14,p.muted);circle(g,193+fn(x)*349,y,8,i%2?p.secondary:p.accent);});break;
    case 'overlap':
      for(let i=13;i>=0;i--){const x=320+Math.sin(t*1.5-i*.15)*180*amp,y=200+Math.sin(t*2-i*.24)*57;circle(g,x,y,16-i*.65,i===0?p.accent:p.secondary);g.globalAlpha=1;}break;
    case 'masking':{
      const x=100+phase(t,4)*440;g.save();rect(g,x-75,89,150,232,25);g.clip();for(let i=0;i<12;i++)line(g,[[70+i*48,90],[170+i*48,320]],i%2?p.accent:p.secondary,23);title('VISIBLE',320,204,43);g.restore();rect(g,x-75,89,150,232,25,null,p.ink);break;
    }
    case 'common':
      for(let j=0;j<3;j++)for(let i=0;i<12;i++){const x=112+(i%4)*37+j*134+Math.cos(t+j*2)*20*amp,y=145+Math.floor(i/4)*40+Math.sin(t+j*2)*27*amp;circle(g,x,y,9,[p.accent,p.secondary,p.ink][j]);}break;
    case 'seek':
      for(let i=0;i<2;i++){rect(g,62+i*274,89,242,215,20,p.panel);const q=phase(t,6);circle(g,93+i*274+q*180,194+Math.sin(q*TAU*2)*60,14,i?p.secondary:p.accent);text(g,`t = ${t.toFixed(2)} s`,183+i*274,279,17,p.muted,'center');}break;
    case 'shot':{
      const q=phase(t,6),i=q<.25?0:q<.66?1:2;[.25,.41,.34].reduce((x,w,j)=>{rect(g,x,279,w*480-4,26,5,j===i?p.accent:p.line);return x+w*480;},80);line(g,[[80+480*q,271],[80+480*q,316]],p.ink,3);title(['ESTABLISH','FOCUS','RESOLVE'][i],320,160,39);title(`SECTION ${i+1}`,320,213,17);break;
    }
    case 'beat':
      for(let i=0;i<16;i++){const q=phase(t*.8-i/16),hit=Math.exp(-q*35),x=134+i%8*53,y=170+Math.floor(i/8)*65;circle(g,x,y,13+hit*10*amp,i%4===0?p.secondary:p.accent);text(g,String(i+1),x,y+39,12,p.muted,'center');}break;
    default:throw new Error('Unknown motion: '+e.kind);
  }
}
function ellipse(g,x,y,rx,ry,color){g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fillStyle=color;g.fill();}
