// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import { TAU, clamp, mix, phase, smooth, out, hash, easings } from './math.js';
import { rect, circle, text, line, polygon, glow, label, transform } from './drawing.js';
export const cinemaKinds = new Set('burst streaks assemble shatter glitch dolly aurora circuit film enso speedlines wipes stars water marble crowd boil paint shapecut brush speedmatch whip zoomdive flash slowpush parallax speedramp matchcut dropword odometer karaoke subtitle bilingual evenlines softenter baked callout hud'.split(' '));
const pixels = ['1111010001111101111','1000011011100001000','1110010101111001110','1000010001100001000','1111010001111101111'].flatMap((r,y)=>[...r].flatMap((c,x)=>c==='1'?[[x,y]]:[]));
function landscape(g,p,variant=0,t=0){
  rect(g,0,0,640,400,0,variant%2?'#162b3b':p.bg);
  circle(g,455,125,53,variant%2?p.accent:p.secondary);
  for(let i=0;i<7;i++){const x=i*113-40,y=150+hash(i,7)*110;rect(g,x,y,82,400-y,13,i%2?p.panel:p.line);for(let j=0;j<3;j++)rect(g,x+14,y+22+j*32,9,9,2,p.accent);}
  rect(g,0,332,640,68,0,p.panel);line(g,[[0,352],[640,352]],p.accent,3);
}
export function renderCinema(g,e,t,s,o,p){
  const duration=e.duration,u=phase(t,duration),amp=o.strength,clock=t+(s.manual?s.count*.41:0);
  const word=(str,x=320,y=200,size=66,color=p.ink)=>text(g,str,x,y,size,color,'center',800);
  switch(e.kind){
    case 'burst':{
      const q=phase(clock,2.8),rise=out(clamp(q*5)),fade=1-q;
      glow(g,320,200,170,p.accent,fade*.5*amp);
      for(let i=0;i<70;i++){const a=hash(i,19)*TAU,r=20+hash(i,5)*50,start=r+rise*90,end=start+(30+hash(i,77)*130)*fade*amp;g.globalAlpha=fade;line(g,[[320+Math.cos(a)*start,200+Math.sin(a)*start],[320+Math.cos(a)*end,200+Math.sin(a)*end]],i%3?p.accent:p.secondary,1+hash(i,2)*2);}g.globalAlpha=1;word('SPARK',320,200,46);break;
    }
    case 'streaks':
      for(let i=0;i<36;i++){const q=phase(clock*(.3+hash(i)*.5)+hash(i,5)),x=q*900-130,y=65+hash(i,9)*270;g.globalAlpha=.15+hash(i,4)*.65;line(g,[[x,y],[x+40+hash(i,3)*150*amp,y]],i%3?p.accent:p.secondary,1+hash(i,2)*6);}g.globalAlpha=1;break;
    case 'assemble':{
      const q=u<.6?smooth(u/.6):1-smooth((u-.8)/.2);
      pixels.forEach(([x,y],i)=>{const delay=hash(i,9)*.24,a=smooth(clamp((q-delay)/(1-delay))),xx=mix(hash(i,17)*850-100,139+x*19,a),yy=mix(hash(i,7)*700-150,149+y*19,a);transform(g,xx,yy,(1-a)*hash(i)*4,1,1,()=>rect(g,-7,-7,14,14,2,i%4?p.accent:p.secondary));});break;
    }
    case 'shatter':{
      const q=clamp((u-.2)/.7),speed=q*q*amp;
      for(let i=0;i<60;i++){const x=167+i%10*31,y=112+Math.floor(i/10)*30,dx=(x-320)*1.5+(hash(i)-.5)*160,dy=(y-200)*1.7;transform(g,x+dx*speed,y+dy*speed+speed*speed*160,speed*(hash(i,2)-.5)*5,1,1,()=>rect(g,-14,-14,28,28,3,i%3?p.accent:p.secondary));}break;
    }
    case 'glitch':{
      const flick=Math.floor(clock*8),on=hash(flick,5)>.5;
      for(let i=0;i<12;i++){g.save();rect(g,0,102+i*16,640,16);g.clip();const dx=on?(hash(i+flick,9)-.5)*65*amp:0;word('SIGNAL',320+dx-3*amp,201,90,p.secondary);g.globalCompositeOperation='screen';word('SIGNAL',320+dx+3*amp,201,90,p.accent);g.restore();}break;
    }
    case 'dolly':{
      const z=1+Math.sin(clock)*.27*amp;transform(g,320,200,0,z,z,()=>{for(let i=0;i<9;i++)rect(g,-270+i*65,-160,30,320,0,i%2?p.line:p.panel);});circle(g,320,200,53,p.accent);word('FIXED',320,201,21,p.bg);break;
    }
    case 'aurora':
      for(let band=0;band<4;band++){g.save();g.globalAlpha=.15;g.fillStyle=band%2?p.accent:p.secondary;g.beginPath();for(let x=0;x<=640;x+=5){const y=150+band*25+Math.sin(x*.012+clock*.4+band)*36*amp+Math.sin(x*.027-clock*.2)*20;x?g.lineTo(x,y):g.moveTo(x,y);}for(let x=640;x>=0;x-=5)g.lineTo(x,310+Math.sin(x*.009+clock*.6+band)*45);g.closePath();g.fill();g.restore();}break;
    case 'circuit':
      for(let j=0;j<7;j++){const pts=[[55,75+j*42],[180+j*19,75+j*42],[230+j*19,155+j*18],[580,155+j*18]];line(g,pts,p.line,2);for(const pt of pts)circle(g,...pt,4,p.secondary);const q=phase(clock*.23+j*.12)*3,i=Math.min(2,Math.floor(q)),f=q-i;circle(g,mix(pts[i][0],pts[i+1][0],f),mix(pts[i][1],pts[i+1][1],f),5,p.accent);}break;
    case 'film':
      landscape(g,p,0);g.save();g.globalAlpha=.1*amp;for(let i=0;i<1400;i++){const seed=Math.floor(clock*12);rect(g,hash(i,seed)*640,hash(i,seed+99)*400,2,2,0,i%2?'#fff':'#000');}g.restore();{const fade=g.createRadialGradient(320,200,75,320,200,340);fade.addColorStop(0,'#00000000');fade.addColorStop(1,'#000000b0');g.fillStyle=fade;g.fillRect(0,0,640,400);}word('A MEMORY',320,290,33);break;
    case 'enso':{
      const q=clamp(u*1.4);for(let i=0;i<140*q;i++){const a=i/140*TAU*.94-Math.PI/2,b=(i+1)/140*TAU*.94-Math.PI/2,r=110+Math.sin(a*3)*4;line(g,[[320+Math.cos(a)*r,200+Math.sin(a)*r],[320+Math.cos(b)*r,200+Math.sin(b)*r]],p.accent,4+10*Math.sin(i/140*Math.PI)**2);}break;
    }
    case 'speedlines':
      for(let i=0;i<65;i++){const a=hash(i,8)*TAU,near=80+phase(clock+hash(i)*2,2)*160,far=near+50+hash(i,6)*130*amp;line(g,[[320+Math.cos(a)*near,200+Math.sin(a)*near],[320+Math.cos(a)*far,200+Math.sin(a)*far]],i%3?p.line:p.accent,1+hash(i,10)*3);}circle(g,320,200,24,p.accent);break;
    case 'wipes':{
      landscape(g,p,0);g.save();g.beginPath();const mode=s.manual?s.selected:Math.floor(t/6)%3;
      if(mode===0)g.rect(0,0,640*smooth(u),400);else if(mode===1)g.arc(320,200,smooth(u)*400,0,TAU);else{g.moveTo(-200,0);g.lineTo(-200+1000*smooth(u),0);g.lineTo(-400+1000*smooth(u),400);g.lineTo(-200,400);g.closePath();}g.clip();landscape(g,p,1);word('NEXT',320,205,60,p.ink);g.restore();break;
    }
    case 'stars':
      for(let i=0;i<170;i++){const a=.2+(.5+.5*Math.sin(clock*(.3+hash(i,6))+i))*amp*.8;g.save();g.globalAlpha=a;circle(g,hash(i,1)*640,40+hash(i,2)*320,.7+hash(i,8)*1.6,p.ink);g.restore();}glow(g,433,125,56,p.secondary,.18);break;
    case 'water':
      rect(g,0,0,640,211,0,p.panel);circle(g,424,112,44,p.accent);for(let i=0;i<9;i++)rect(g,i*87-30,153-hash(i)*70,60,80+hash(i)*70,0,p.line);
      for(let y=214;y<365;y+=5){const a=(y-214)/151,shift=Math.sin(y*.13+clock*3)*a*17*amp;g.save();rect(g,0,y,640,4);g.clip();transform(g,shift,428,0,1,-1,()=>{rect(g,0,0,640,211,0,p.panel);circle(g,424,112,44,p.accent);for(let i=0;i<9;i++)rect(g,i*87-30,153-hash(i)*70,60,80+hash(i)*70,0,p.line);});g.restore();}line(g,[[0,212],[640,212]],p.secondary,2);break;
    case 'marble':{
      // 自作のブロック字形をクリップ領域にし、背景へ帯が漏れないようにする。
      const glyphs=['1111/1000/1110/1000/1000/1000','1000/1000/1000/1000/1000/1111','1111/1001/1001/1001/1001/1111','10001/10001/10101/10101/11011/10001'];
      g.save();g.beginPath();glyphs.forEach((glyph,i)=>glyph.split('/').forEach((row,y)=>[...row].forEach((cell,x)=>{if(cell==='1')g.rect(96+i*115+x*21,137+y*21,21,21);})));g.clip();g.fillStyle=p.ink;g.fillRect(70,115,530,160);
      for(let i=0;i<42;i++){const pts=Array.from({length:35},(_,j)=>[j*20,75+i*5+Math.sin(j*.3+clock+i*.2)*28*amp]);line(g,pts,i%3?p.accent:p.secondary,4);}g.restore();break;
    }
    case 'crowd':
      for(let y=0;y<10;y++)for(let x=0;x<19;x++){const i=y*19+x,dx=Math.sin(clock+y*.24)*12*amp,dy=Math.sin(clock*2+x*.4)*6;circle(g,49+x*30+dx,78+y*27+dy,3.5+(Math.sin(i+clock)+1)*1.5,i%5?p.secondary:p.accent);}break;
    case 'boil':{
      const frame=Math.floor(clock*8);g.beginPath();for(let i=0;i<=80;i++){const a=i%80/80*TAU,r=93+(hash(i%80,frame)-.5)*15*amp;const x=320+Math.cos(a)*r*1.4,y=200+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fillStyle=p.accent;g.fill();word('INK',320,200,66,p.bg);break;
    }
    case 'paint':
      for(let i=0;i<8;i++){const q=out(clamp(u*1.6-i*.065));line(g,[[105,104+i*28],[105+430*q,104+i*28+Math.sin(i)*12]],i%2?p.accent:p.secondary,31);}g.save();g.beginPath();for(let i=0;i<8;i++){const q=out(clamp(u*1.6-i*.065));g.rect(105,89+i*28,430*q,31);}g.clip();word('MAKE',320,206,70,p.bg);g.restore();break;
    case 'shapecut':{
      const side=u>.5;rect(g,0,0,640,400,0,side?p.secondary:p.bg);polygon(g,320,200,95,side?6:3,clock*.2,p.accent);circle(g,320,200,19,side?p.bg:p.panel);break;
    }
    case 'brush':
      landscape(g,p,0);g.save();g.beginPath();g.moveTo(0,0);for(let y=0;y<=400;y+=10)g.lineTo(smooth(u)*780-70+hash(y,5)*65,y);g.lineTo(0,400);g.closePath();g.clip();rect(g,0,0,640,400,0,p.accent);word('FRESH',320,202,76,p.bg);g.restore();break;
    case 'speedmatch':{
      const x=70+phase(clock,3)*500,second=phase(clock,6)>.5;rect(g,0,0,640,400,0,second?p.panel:p.bg);if(second)polygon(g,x,200,32,4,Math.PI/4,p.secondary);else circle(g,x,200,32,p.accent);line(g,[[55,252],[585,252]],p.line,2);word(second?'SCENE B':'SCENE A',320,99,19,p.muted);break;
    }
    case 'whip':{
      const q=phase(clock,4),swap=q>.5,blur=Math.exp(-(((q-.5)*20)**2))*amp,offset=blur*150;transform(g,-offset,0,0,1,1,()=>landscape(g,p,swap?1:0));for(let i=0;i<18;i++){g.save();g.globalAlpha=blur*.55;line(g,[[0,75+i*17],[640,75+i*17]],i%2?p.accent:p.secondary,7);g.restore();}break;
    }
    case 'zoomdive':
      for(let i=0;i<9;i++){const q=phase(clock*.22+i/9),scale=.1+q*q*3;g.save();g.globalAlpha=1-q;rect(g,320-150*scale,200-96*scale,300*scale,192*scale,14*scale,null,i%2?p.accent:p.secondary);g.restore();}break;
    case 'flash':{
      landscape(g,p,Math.floor(clock/3)%2);const q=phase(clock,3),power=Math.exp(-(((q-.5)*24)**2))*.7*amp;g.save();g.globalAlpha=power;rect(g,0,0,640,400,0,p.ink);g.restore();break;
    }
    case 'slowpush':{
      const scale=1+smooth(u)*.24*amp;transform(g,320,200,0,scale,scale,()=>{g.translate(-320,-200);landscape(g,p);});break;
    }
    case 'parallax':{
      const px=s.manual?s.pointer[0]-.5:Math.sin(clock*.6)*.4;
      circle(g,456+px*12,112,40,p.secondary);for(let layer=0;layer<3;layer++){const shift=px*(layer+1)*37*amp;for(let i=0;i<6;i++)rect(g,-70+i*142+shift,170+layer*54+Math.sin(i)*17,105,230,16,[p.line,p.panel,p.accent][layer]);}break;
    }
    case 'speedramp':{
      const q=phase(clock,4),ramped=q<.5?4*q*q*q:1-4*(1-q)**3;line(g,[[90,218],[550,218]],p.line,3);circle(g,90+ramped*460,218,22,p.accent);for(let i=0;i<40;i++){const x=i/39,y=x<.5?4*x*x*x:1-4*(1-x)**3;circle(g,90+x*460,161-y*70,2,p.secondary);}break;
    }
    case 'matchcut':{
      const q=phase(clock,4),mode=q>.5;rect(g,0,0,640,400,0,mode?p.panel:p.bg);circle(g,320,200,91,mode?p.secondary:p.accent);if(mode){circle(g,320,200,58,p.bg);line(g,[[320,200],[355,154]],p.ink,5);}else polygon(g,320,200,42,3,-Math.PI/2,p.bg);break;
    }
    case 'dropword':
      [...'IDEAS'].forEach((ch,i)=>{const q=clamp(u*1.8-i*.11),fall=easings.bounce(q);word(ch,170+i*75,mix(-70,224,fall),77,p.accent);});line(g,[[116,276],[530,276]],p.line,2);break;
    case 'odometer':{
      const raw=clock*9.2+s.count*100,base=Math.floor(raw),f=phase(raw);
      for(let i=0;i<4;i++){const place=10**(3-i),digit=Math.floor(base/place)%10,roll=place===1?f:(base%place===place-1?f:0),x=168+i*78;g.save();rect(g,x-31,142,62,116,12,p.panel);g.clip();word(digit,x,200-roll*103,67,p.accent);word((digit+1)%10,x,303-roll*103,67,p.accent);g.restore();}break;
    }
    case 'karaoke':
      word('ONE MORE IDEA',320,202,47,p.line);g.save();rect(g,62,125,smooth(u)*516,150);g.clip();word('ONE MORE IDEA',320,202,47,p.accent);g.restore();break;
    case 'subtitle':{
      landscape(g,p);const q=out(clamp(u*3));rect(g,320-237*q,268,474*q,68,12,p.bg);g.save();g.globalAlpha=clamp((u-.15)*5);text(g,'Keep a little room for wonder.',320,303,24,p.ink,'center');g.restore();break;
    }
    case 'bilingual':{
      const a=out(clamp(u*2.4)),b=out(clamp((u-.15)*2.4));g.save();g.globalAlpha=a;word('TOMORROW',320-70*(1-a),178,58,p.accent);g.globalAlpha=b;word('次の一歩を、ここから。',320+70*(1-b),244,25,p.ink);g.restore();break;
    }
    case 'evenlines':
      ['MAKE ROOM','FOR SOMETHING','UNEXPECTED'].forEach((str,i)=>{const q=out(clamp(u*2.5-i*.18));g.save();g.globalAlpha=q;text(g,str,100+(1-q)*70,125+i*71,35,p.ink,'left',700);line(g,[[83,96+i*71],[83,149+i*71]],p.accent,3);g.restore();});break;
    case 'softenter':{
      const q=smooth(clamp(u*2)),y=32*(1-q)*amp;g.save();g.globalAlpha=q;circle(g,320,129+y,25,p.accent);word('Quiet confidence',320,217+y,40);text(g,'Small movement. Clear meaning.',320,267+y,17,p.muted,'center');g.restore();break;
    }
    case 'baked':
      transform(g,320,200,Math.sin(clock)*.08*amp,1+Math.sin(clock*.6)*.1*amp,1+Math.sin(clock*.6)*.1*amp,()=>{rect(g,-211,-81,422,162,6,p.accent);text(g,'IN MOTION',0,0,51,p.bg,'center',800);});break;
    case 'callout':{
      const x=193+Math.sin(clock)*45*amp,y=230+Math.cos(clock*.8)*41*amp;circle(g,x,y,39,p.secondary);circle(g,x,y,7,p.accent);line(g,[[x,y],[x+80,y-72],[502,y-72]],p.accent,2);text(g,'POINT OF INTEREST',495,y-96,16,p.ink,'right');text(g,`${Math.round(x)}, ${Math.round(y)}`,495,y-52,15,p.muted,'right');break;
    }
    case 'hud':{
      const value=clock*24;rect(g,126,97,388,213,20,p.panel);g.save();rect(g,135,115,369,160);g.clip();for(let i=-8;i<=8;i++){const number=Math.floor(value/10)*10+i*10,x=320+(number-value)*4;line(g,[[x,173],[x,number%50===0?215:196]],p.accent,2);text(g,number,x,239,14,p.muted,'center');}g.restore();polygon(g,320,150,10,3,Math.PI/2,p.ink);word(Math.round(value).toString().padStart(3,'0'),320,284,25,p.ink);break;
    }
    default:throw new Error('Unknown cinema: '+e.kind);
  }
  label(g,p,e.title.toUpperCase(),'FRAME / '+Math.floor(t*30).toString().padStart(4,'0'));
}
