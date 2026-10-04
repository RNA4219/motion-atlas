// Copyright (c) 2026 Motion Atlas contributors — MIT License.
import {clamp,mix,phase,smooth,TAU} from './math.js';
import {rect,circle,text,line,transform} from './drawing.js';
export const labUIKinds=new Set('accordion radial-menu pull-refresh swipe-archive sortable-stack magnetic-button elastic-cursor breadcrumb skeleton-shimmer circular-meter price-counter pin-input notification-stack color-wheel focus-ring scroll-spy split-pane step-journey pagination-bridge'.split(' '));
export function renderLabUI(g,e,t,s,o,p){
  const a=o.params,q=phase(t,5),z=.5-.5*Math.cos(t*1.2),target=s.manual?s.pointer:[.5+Math.sin(t)*.3,.5+Math.cos(t*.7)*.2];
  const words=(value,x,y,size=19,color=p.ink)=>text(g,value,x,y,size,color,'center');
  switch(e.kind){
    case 'accordion':{
      const weights=[0,1,2].map(i=>Math.max(0,Math.sin(t*1.3-i*TAU/3-i*a.lag*2))**4),total=Math.max(1,weights.reduce((x,y)=>x+y,0));
      let y=65;for(let i=0;i<3;i++){const h=38+a.height*weights[i]/total;rect(g,125,y,390,h,10,p.panel);text(g,['Design','Build','Deliver'][i],148,y+20,17,p.ink);g.save();rect(g,140,y+36,340,Math.max(0,h-43));g.clip();for(let j=0;j<3;j++)rect(g,148,y+49+j*17,280-j*45,5,2,p.line);g.restore();y+=h+9;}break;
    }
    case 'radial-menu':
      for(let i=0;i<a.items;i++){const angle=i/a.items*TAU-TAU/4+z*.2,x=320+Math.cos(angle)*a.radius*z,y=200+Math.sin(angle)*a.radius*z;circle(g,x,y,19*z,p.secondary);words(i+1,x,y,15,p.bg);}circle(g,320,200,29,p.accent);transform(g,320,200,z*Math.PI/4,1,1,()=>{line(g,[[-10,0],[10,0]],p.bg,3);line(g,[[0,-10],[0,10]],p.bg,3);});break;
    case 'pull-refresh':{
      const pull=q<.4?smooth(q/.4):q<.7?1:1-smooth((q-.7)/.3),y=93+pull*a.travel;rect(g,140,70,360,265,15,p.panel);g.save();rect(g,150,82,340,240);g.clip();g.beginPath();g.arc(320,y-15,15,t*a.turns*2,t*a.turns*2+4.7);g.strokeStyle=p.accent;g.stroke();for(let i=0;i<4;i++)rect(g,168,y+29+i*45,304,28,7,p.line);g.restore();break;
    }
    case 'swipe-archive':{
      const u=smooth(clamp((q-a.hold)/(1-a.hold)));rect(g,103,143,434,95,14,p.secondary);words('ARCHIVE',456,190,17,p.bg);rect(g,103-u*a.distance,143,434,95,14,p.panel);text(g,'Inbox / 08',132-u*a.distance,188,24,p.ink);rect(g,103,256-u*13,434,47,9,p.panel);break;
    }
    case 'sortable-stack':{
      const count=Math.round(a.rows),height=220/count,u=smooth(z),moving=(count-1)*u;
      for(let i=1;i<count;i++){const y=90+i*height-(moving>i-.5?height:0);rect(g,166,y,308,height-8,8,p.panel);words('ITEM '+(i+1),320,y+(height-8)/2,16);}
      g.save();g.shadowColor='#0008';g.shadowBlur=a.lift;rect(g,166-a.lift,90+moving*height,308+a.lift*2,height-8,8,p.accent);g.restore();words('ITEM 1',320,90+moving*height+(height-8)/2,16,p.bg);break;
    }
    case 'magnetic-button':{
      const dx=target[0]*640-320,dy=target[1]*400-200,d=Math.hypot(dx,dy),weight=clamp(1-d/a.reach)*a.pull;circle(g,320,200,a.reach*.5,null,p.line);rect(g,225+dx*weight,169+dy*weight,190,62,31,p.accent);words('COME CLOSER',320+dx*weight,200+dy*weight,18,p.bg);circle(g,target[0]*640,target[1]*400,5,p.secondary);break;
    }
    case 'elastic-cursor':{
      const x=target[0]*640,y=target[1]*400,dx=Math.sin(t)-Math.sin(t-a.delay),dy=Math.cos(t*.7)-Math.cos((t-a.delay)*.7);line(g,[[110,200],[530,200]],p.line,1);transform(g,x,y,Math.atan2(dy,dx),1+Math.hypot(dx,dy)*6*a.stretch,1,()=>circle(g,0,0,16,p.accent));circle(g,x,y,3,p.bg);break;
    }
    case 'breadcrumb':{
      const n=Math.round(a.depth),active=Math.floor(t)%n,start=320-(n-1)*a.spacing/2;
      for(let i=0;i<n;i++){const x=start+i*a.spacing;rect(g,x-42,172,84,51,9,i===active?p.accent:p.panel);words(['Home','Space','Folder','File'][i],x,198,16,i===active?p.bg:p.ink);if(i<n-1)words('›',x+a.spacing/2,198,22,p.muted);}break;
    }
    case 'skeleton-shimmer':{
      g.save();g.beginPath();g.roundRect(125,110,104,145,12);for(let i=0;i<4;i++)g.roundRect(251,114+i*36,260-i%2*60,16,7);g.clip();g.fillStyle=p.panel;g.fillRect(80,80,480,240);const x=phase(t,2)*850-100;const gradient=g.createLinearGradient(x-a.band,0,x+a.band,0);gradient.addColorStop(0,p.panel);gradient.addColorStop(.5,p.secondary);gradient.addColorStop(1,p.panel);g.transform(1,0,a.slope,1,-a.slope*200,0);g.fillStyle=gradient;g.fillRect(x-a.band,60,a.band*2,300);g.restore();break;
    }
    case 'circular-meter':{
      const amount=a.target/100*smooth(clamp(q*2));g.lineWidth=a.thickness;circle(g,320,193,90,null,p.line);g.beginPath();g.arc(320,193,90,-Math.PI/2,-Math.PI/2+amount*TAU);g.strokeStyle=p.accent;g.stroke();words(Math.round(amount*100)+'%',320,193,43);break;
    }
    case 'price-counter':{
      const value=mix(a.amount*.5,a.amount,smooth(z));rect(g,159,103,322,197,18,p.panel);words('YOUR PLAN',320,145,14,p.muted);words('$'+value.toFixed(Math.round(a.digits)),320,207,51,p.accent);words('updated continuously',320,263,15,p.muted);break;
    }
    case 'pin-input':{
      const n=Math.round(a.digits),w=Math.min(54,(510-(n-1)*a.gap)/n),total=n*w+(n-1)*a.gap,filled=Math.floor(phase(t,5)*(n+2));for(let i=0;i<n;i++){const x=320-total/2+i*(w+a.gap);rect(g,x,160,w,76,10,p.panel,i===filled?p.accent:p.line);if(i<filled)circle(g,x+w/2,198,6,p.accent);}words(filled>=n?'VERIFIED':'ENTER CODE',320,279,18,p.muted);break;
    }
    case 'notification-stack':
      for(let i=Math.round(a.count)-1;i>=0;i--){const y=125+i*a.offset+Math.sin(t-i*.2)*5,scale=1-i*.06;transform(g,320,y,0,scale,scale,()=>{rect(g,-177,0,354,100,14,p.panel,p.line);circle(g,-141,34,9,i?p.secondary:p.accent);text(g,['New idea','Shared with you','Ready to go','Saved','Synced'][i],-119,35,18,p.ink);rect(g,-144,62,244,7,3,p.line);});}break;
    case 'color-wheel':{
      for(let i=0;i<180;i++){const angle=i/180*TAU;line(g,[[275+Math.cos(angle)*(a.radius-20),200+Math.sin(angle)*(a.radius-20)],[275+Math.cos(angle)*a.radius,200+Math.sin(angle)*a.radius]],`hsl(${i*2} ${a.saturation}% 60%)`,5);}const angle=s.manual?Math.atan2(target[1]*400-200,target[0]*640-275):t*.7;circle(g,275+Math.cos(angle)*(a.radius-10),200+Math.sin(angle)*(a.radius-10),9,p.ink,p.bg);rect(g,435,154,76,92,12,`hsl(${angle/TAU*360} ${a.saturation}% 60%)`);break;
    }
    case 'focus-ring':{
      const points=[[130,113,150,55],[331,113,180,55],[170,230,300,67]],raw=phase(t,6)*3,i=Math.floor(raw),j=(i+1)%3,u=smooth(clamp(phase(raw)*2));points.forEach((r,k)=>{rect(g,...r,a.roundness,p.panel);words(['Search','Settings','Continue'][k],r[0]+r[2]/2,r[1]+r[3]/2,18);});const r=points[i].map((v,k)=>mix(v,points[j][k],u)),pad=a.padding;rect(g,r[0]-pad,r[1]-pad,r[2]+pad*2,r[3]+pad*2,a.roundness+pad,null,p.accent);break;
    }
    case 'scroll-spy':{
      const n=Math.round(a.sections),u=phase(t,8)*(n-1),active=Math.round(u);rect(g,251,80,310,a.viewport,12,p.panel);g.save();rect(g,265,90,280,a.viewport-20);g.clip();for(let i=0;i<n;i++){const y=110+(i-u)*90;text(g,'Section '+(i+1),280,y,20,p.ink);for(let j=0;j<2;j++)rect(g,280,y+24+j*17,230-j*33,5,2,p.line);}g.restore();for(let i=0;i<n;i++){rect(g,74,88+i*34,135,27,5,i===active?p.accent:p.panel);text(g,'Section '+(i+1),86,102+i*34,13,i===active?p.bg:p.muted);}break;
    }
    case 'split-pane':{
      const ratio=clamp(a.ratio+Math.sin(t)*.08,.15,.85),left=460*ratio;rect(g,90,97,left-a.gutter/2,212,10,p.panel);rect(g,90+left+a.gutter/2,97,460-left-a.gutter/2,212,10,p.panel);rect(g,90+left-a.gutter/2,130,a.gutter,145,3,p.accent);words(Math.round(ratio*100)+'%',90+left/2,203,28);words(Math.round((1-ratio)*100)+'%',90+left+(460-left)/2,203,28);break;
    }
    case 'step-journey':{
      const n=Math.round(a.steps),gap=Math.min(a.spacing,480/(n-1)),start=320-(n-1)*gap/2,u=phase(t,6)*(n-1);line(g,[[start,200],[start+(n-1)*gap,200]],p.line,5);line(g,[[start,200],[start+u*gap,200]],p.accent,5);for(let i=0;i<n;i++){circle(g,start+i*gap,200,18,i<=u?p.accent:p.panel);words(i+1,start+i*gap,200,15,i<=u?p.bg:p.ink);}break;
    }
    case 'pagination-bridge':{
      const n=Math.round(a.pages),gap=470/(n-1),raw=phase(t,6)*(n-1),i=Math.floor(raw),u=phase(raw),x=85+raw*gap;for(let j=0;j<n;j++)circle(g,85+j*gap,200,a.radius,p.panel);rect(g,x-a.radius-gap*Math.sin(u*Math.PI)*.35,200-a.radius,a.radius*2+gap*Math.sin(u*Math.PI)*.7,a.radius*2,a.radius,p.accent);for(let j=0;j<n;j++)words(j+1,85+j*gap,200,14,p.ink);break;
    }
    default:throw new Error(e.kind);
  }
}
